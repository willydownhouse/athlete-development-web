export function getLocalDayRange(date = new Date()): {
  startedAtFrom: string;
  startedAtTo: string;
} {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);

  return {
    startedAtFrom: start.toISOString(),
    startedAtTo: end.toISOString(),
  };
}
