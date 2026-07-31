export function getLocalDayRange(date = new Date()): {
  startedAtFrom: string;
  startedAtTo: string;
} {
  const start = startOfLocalDay(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startedAtFrom: start.toISOString(),
    startedAtTo: end.toISOString(),
  };
}

export function getLocalMonthRange(date = new Date()): {
  startedAtFrom: string;
  startedAtTo: string;
} {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);

  return {
    startedAtFrom: start.toISOString(),
    startedAtTo: end.toISOString(),
  };
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function addLocalMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0);
}

export function getLocalWeekRange(date = new Date()): {
  startedAtFrom: string;
  startedAtTo: string;
  days: Date[];
} {
  const day = date.getDay();
  const daysFromMonday = (day + 6) % 7;
  const monday = startOfLocalDay(date);
  monday.setDate(monday.getDate() - daysFromMonday);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const days = Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    return dayDate;
  });

  return {
    startedAtFrom: monday.toISOString(),
    startedAtTo: nextMonday.toISOString(),
    days,
  };
}
