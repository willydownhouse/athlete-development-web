const LOCAL_VIDEO_POSTER_TIMEOUT_MS = 2_500;

type LocalVideoCaptureResult = {
  poster: Blob | null;
  width: number;
  height: number;
};

export async function captureLocalVideoPoster(file: Blob): Promise<LocalVideoCaptureResult | null> {
  if (typeof document === "undefined") {
    return null;
  }

  const videoUrl = URL.createObjectURL(file);

  try {
    return await captureFrame(videoUrl);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(videoUrl);
  }
}

function captureFrame(videoUrl: string): Promise<LocalVideoCaptureResult | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.src = videoUrl;
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.top = "0";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.append(video);

    let settled = false;
    let capturedSize: { width: number; height: number } | null = null;

    const timeout = window.setTimeout(() => {
      finish(null);
    }, LOCAL_VIDEO_POSTER_TIMEOUT_MS);

    function finish(poster: Blob | null) {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      video.remove();
      resolve(
        capturedSize ? { poster, width: capturedSize.width, height: capturedSize.height } : null,
      );
    }

    function sizeToIntrinsicFrame(): { width: number; height: number } | null {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        return null;
      }

      video.width = width;
      video.height = height;
      video.style.width = `${width}px`;
      video.style.height = `${height}px`;
      capturedSize = { width, height };
      return capturedSize;
    }

    function grabFrame() {
      if (settled) {
        return;
      }

      const frame = sizeToIntrinsicFrame();

      if (!frame) {
        finish(null);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = frame.width;
      canvas.height = frame.height;
      const context = canvas.getContext("2d");

      if (!context) {
        finish(null);
        return;
      }

      context.drawImage(video, 0, 0, frame.width, frame.height);
      canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.8);
    }

    function seekThenGrab() {
      if (settled) {
        return;
      }

      if (!sizeToIntrinsicFrame()) {
        finish(null);
        return;
      }

      if (video.duration > 0.12 && video.currentTime < 0.05) {
        video.addEventListener("seeked", grabFrame, { once: true });
        video.currentTime = Math.min(0.1, video.duration / 2);
        return;
      }

      grabFrame();
    }

    video.addEventListener("error", () => finish(null), { once: true });
    video.addEventListener("loadeddata", seekThenGrab, { once: true });
    void video.play().then(
      () => {
        video.pause();
      },
      () => undefined,
    );
  });
}
