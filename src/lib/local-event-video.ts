const localEventVideos = new Map<string, string>();
const localEventVideoPosters = new Map<string, string>();
const listeners = new Set<() => void>();
let localEventVideoRevision = 0;

function notifyLocalEventVideoListeners(): void {
  localEventVideoRevision += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeLocalEventVideos(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getLocalEventVideoRevision(): number {
  return localEventVideoRevision;
}

export function rememberLocalEventVideo(mediaId: string, file: Blob): string {
  forgetLocalEventVideo(mediaId);
  const objectUrl = URL.createObjectURL(file);
  localEventVideos.set(mediaId, objectUrl);
  notifyLocalEventVideoListeners();
  return objectUrl;
}

export function getLocalEventVideo(mediaId: string): string | null {
  return localEventVideos.get(mediaId) ?? null;
}

export function rememberLocalEventVideoPoster(mediaId: string, poster: Blob): string {
  forgetLocalEventVideoPoster(mediaId);
  const objectUrl = URL.createObjectURL(poster);
  localEventVideoPosters.set(mediaId, objectUrl);
  notifyLocalEventVideoListeners();
  return objectUrl;
}

export async function rememberLocalEventVideoPosterIfCached(
  mediaId: string,
  posterPromise: Promise<Blob | null>,
): Promise<void> {
  try {
    const poster = await posterPromise;

    if (!poster || !getLocalEventVideo(mediaId)) {
      return;
    }

    rememberLocalEventVideoPoster(mediaId, poster);
  } catch {
    return;
  }
}

export function getLocalEventVideoPoster(mediaId: string): string | null {
  return localEventVideoPosters.get(mediaId) ?? null;
}

export function forgetLocalEventVideoPoster(mediaId: string): void {
  const objectUrl = localEventVideoPosters.get(mediaId);

  if (!objectUrl) {
    return;
  }

  localEventVideoPosters.delete(mediaId);
  URL.revokeObjectURL(objectUrl);
  notifyLocalEventVideoListeners();
}

export function forgetLocalEventVideo(mediaId: string): void {
  forgetLocalEventVideoPoster(mediaId);

  const objectUrl = localEventVideos.get(mediaId);

  if (!objectUrl) {
    return;
  }

  localEventVideos.delete(mediaId);
  URL.revokeObjectURL(objectUrl);
  notifyLocalEventVideoListeners();
}

export function forgetFailedLocalEventVideos(items: Array<{ id: string; status: string }>): void {
  for (const item of items) {
    if (item.status === "failed") {
      forgetLocalEventVideo(item.id);
    }
  }
}

export function resetLocalEventVideosForTests(): void {
  const mediaIds = new Set([...localEventVideos.keys(), ...localEventVideoPosters.keys()]);

  for (const mediaId of mediaIds) {
    forgetLocalEventVideo(mediaId);
  }
}
