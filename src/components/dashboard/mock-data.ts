export type MockWeekDay = {
  day: string;
  label: string;
  tone: "ice" | "recovery" | "gym" | "game" | "rest";
  height: number;
};

export const MOCK_AI_INSIGHT =
  "After two hard ice sessions, today looks better as a light recovery day. Short puck touches or mobility would fit well.";

export const MOCK_WEEK_DAYS: MockWeekDay[] = [
  { day: "Mon", label: "Ice", tone: "ice", height: 88 },
  { day: "Tue", label: "Rec", tone: "recovery", height: 36 },
  { day: "Wed", label: "Gym", tone: "gym", height: 56 },
  { day: "Thu", label: "Rec", tone: "recovery", height: 36 },
  { day: "Fri", label: "Ice", tone: "ice", height: 88 },
  { day: "Sat", label: "Game", tone: "game", height: 64 },
  { day: "Sun", label: "Rest", tone: "rest", height: 28 },
];

export const MOCK_WEEK_LOAD_LABEL = "Moderate load";
export const MOCK_EVENTS_THIS_WEEK = 4;
