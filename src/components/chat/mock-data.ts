export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Hi! I can help you log training, track recovery, and answer questions about your athlete's development. What would you like to note today?",
    createdAt: "2026-07-31T09:00:00.000Z",
  },
  {
    id: "msg-2",
    role: "user",
    content: "Log today's ice session — 60 minutes of skills work, felt moderate.",
    createdAt: "2026-07-31T09:02:00.000Z",
  },
  {
    id: "msg-3",
    role: "assistant",
    content:
      "Got it. I've noted a 60-minute ice skills session with moderate intensity for today. Want me to add anything else, like focus areas or how legs felt afterward?",
    createdAt: "2026-07-31T09:02:30.000Z",
  },
  {
    id: "msg-4",
    role: "user",
    content: "How does this week look overall?",
    createdAt: "2026-07-31T09:05:00.000Z",
  },
  {
    id: "msg-5",
    role: "assistant",
    content:
      "After two hard ice sessions, today looks better as a light recovery day. Short puck touches or mobility would fit well.",
    createdAt: "2026-07-31T09:05:30.000Z",
  },
];
