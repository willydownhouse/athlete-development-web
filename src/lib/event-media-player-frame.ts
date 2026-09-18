export type EventMediaPlayerFrameSize = {
  width: number | null;
  height: number | null;
};

export function resolveEventMediaPlayerFrameSize(input: {
  originalWidth: number | null;
  originalHeight: number | null;
  localSize: { width: number; height: number } | null;
  previewSize: { width: number; height: number } | null;
}): EventMediaPlayerFrameSize {
  if (input.originalWidth && input.originalHeight) {
    return { width: input.originalWidth, height: input.originalHeight };
  }

  if (input.localSize) {
    return input.localSize;
  }

  if (input.previewSize) {
    return input.previewSize;
  }

  return { width: null, height: null };
}

type EventMediaPlayerFrameStyle = {
  aspectRatio: string;
  width: string;
};

export function eventMediaPlayerFrameStyle(
  width: number | null,
  height: number | null,
): EventMediaPlayerFrameStyle {
  const frameWidth = width && width > 0 ? width : 9;
  const frameHeight = height && height > 0 ? height : 16;

  return {
    aspectRatio: `${frameWidth} / ${frameHeight}`,
    width: `min(100%, calc(75svh * ${frameWidth} / ${frameHeight}))`,
  };
}
