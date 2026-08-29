const localEventVideos = new Map<string, string>();
const localEventVideoPosters = new Map<string, string>();
const localEventVideoEventIds = new Map<string, string>();
const localEventVideoSizes = new Map<string, { width: number; height: number }>();
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

export function rememberLocalEventVideo(mediaId: string, file: Blob, eventId: string): string {
  forgetLocalEventVideo(mediaId);
  const objectUrl = URL.createObjectURL(file);
  localEventVideos.set(mediaId, objectUrl);
  localEventVideoEventIds.set(mediaId, eventId);
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

export function getLocalEventVideoPoster(mediaId: string): string | null {
  return localEventVideoPosters.get(mediaId) ?? null;
}

export function rememberLocalEventVideoSize(mediaId: string, width: number, height: number): void {
  if (!getLocalEventVideo(mediaId) || width <= 0 || height <= 0) {
    return;
  }

  const existing = localEventVideoSizes.get(mediaId);

  if (existing && existing.width === width && existing.height === height) {
    return;
  }

  localEventVideoSizes.set(mediaId, { width, height });
  notifyLocalEventVideoListeners();
}

export function getLocalEventVideoSize(mediaId: string): { width: number; height: number } | null {
  return localEventVideoSizes.get(mediaId) ?? null;
}

export function adoptLocalEventVideoId(fromId: string, toId: string): void {
  if (fromId === toId) {
    return;
  }

  const videoUrl = localEventVideos.get(fromId);
  const posterUrl = localEventVideoPosters.get(fromId);
  const eventId = localEventVideoEventIds.get(fromId);
  const size = localEventVideoSizes.get(fromId);

  localEventVideos.delete(fromId);
  localEventVideoPosters.delete(fromId);
  localEventVideoEventIds.delete(fromId);
  localEventVideoSizes.delete(fromId);

  forgetLocalEventVideo(toId);

  if (videoUrl) {
    localEventVideos.set(toId, videoUrl);
  }

  if (posterUrl) {
    localEventVideoPosters.set(toId, posterUrl);
  }

  if (eventId) {
    localEventVideoEventIds.set(toId, eventId);
  }

  if (size) {
    localEventVideoSizes.set(toId, size);
  }

  notifyLocalEventVideoListeners();
}

export async function rememberLocalEventVideoCaptureIfCached(
  mediaId: string,
  capturePromise: Promise<{ poster: Blob | null; width: number; height: number } | null>,
): Promise<void> {
  try {
    const captured = await capturePromise;

    if (!captured || !getLocalEventVideo(mediaId)) {
      return;
    }

    rememberLocalEventVideoSize(mediaId, captured.width, captured.height);

    if (captured.poster) {
      rememberLocalEventVideoPoster(mediaId, captured.poster);
    }
  } catch {
    return;
  }
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
  localEventVideoEventIds.delete(mediaId);
  localEventVideoSizes.delete(mediaId);

  const objectUrl = localEventVideos.get(mediaId);

  if (!objectUrl) {
    return;
  }

  localEventVideos.delete(mediaId);
  URL.revokeObjectURL(objectUrl);
  notifyLocalEventVideoListeners();
}

function forgetAllLocalEventVideos(): void {
  const mediaIds = new Set([
    ...localEventVideos.keys(),
    ...localEventVideoPosters.keys(),
    ...localEventVideoSizes.keys(),
  ]);

  for (const mediaId of mediaIds) {
    forgetLocalEventVideo(mediaId);
  }
}

export function forgetLocalEventVideosOutsideEvent(eventId: string | null): void {
  if (eventId === null) {
    forgetAllLocalEventVideos();
    return;
  }

  const mediaIds = new Set([
    ...localEventVideos.keys(),
    ...localEventVideoPosters.keys(),
    ...localEventVideoSizes.keys(),
  ]);

  for (const mediaId of mediaIds) {
    if (localEventVideoEventIds.get(mediaId) !== eventId) {
      forgetLocalEventVideo(mediaId);
    }
  }
}

export function forgetFailedLocalEventVideos(items: Array<{ id: string; status: string }>): void {
  for (const item of items) {
    if (item.status === "failed") {
      forgetLocalEventVideo(item.id);
    }
  }
}

export function resetLocalEventVideosForTests(): void {
  forgetAllLocalEventVideos();
}
