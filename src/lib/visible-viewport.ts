export function remainingVisibleViewportHeight(
  elementTop: number,
  visualViewport: { offsetTop: number; height: number } | null,
  layoutViewportHeight: number,
): number {
  const viewportBottom = visualViewport
    ? visualViewport.offsetTop + visualViewport.height
    : layoutViewportHeight;

  return Math.max(0, viewportBottom - elementTop);
}
