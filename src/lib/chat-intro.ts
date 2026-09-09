export function chatExampleAthleteName(name: string): string {
  return name.trim().split(/\s+/).find(Boolean) ?? "your athlete";
}

export function chatEventLoggingExample(athleteName: string): string {
  return `${chatExampleAthleteName(athleteName)} had ice practice today at 2pm`;
}

export function chatEmptyIntro(athleteName: string): string {
  return [
    "Hey — I'm Toby, your event logging agent. 🙂",
    "I'm here to make your daily event logging as easy as possible.",
    "Just tell me about a practice, game, or rest day and I'll add it to the timeline. Name the athlete if you have more than one, and include the day and time when you can.",
    "I'm not here to plan training, suggest what to practice, or answer coaching questions.",
    `Try something like: *${chatEventLoggingExample(athleteName)}*`,
  ].join("\n\n");
}
