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
    width: `min(100%, calc(75dvh * ${frameWidth} / ${frameHeight}))`,
  };
}
