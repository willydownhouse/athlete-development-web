const localEventVideos = new Map<string, string>();
const listeners = new Set<() => void>();

function notifyLocalEventVideoListeners(): void {
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

export function forgetLocalEventVideo(mediaId: string): void {
  const objectUrl = localEventVideos.get(mediaId);

  if (!objectUrl) {
    return;
  }

  localEventVideos.delete(mediaId);
  URL.revokeObjectURL(objectUrl);
  notifyLocalEventVideoListeners();
}

export function resetLocalEventVideosForTests(): void {
  for (const mediaId of [...localEventVideos.keys()]) {
    forgetLocalEventVideo(mediaId);
  }
}
