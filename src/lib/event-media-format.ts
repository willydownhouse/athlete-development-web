export function formatMediaDuration(seconds: number | null): string | null {
  if (seconds == null || seconds < 1) {
    return null;
  }

  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
