"use server";

import { updateTag } from "next/cache";

import { ApiError, submitChatMessage } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { chatMessagesCacheTag } from "@/lib/cache-tags";
import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { ChatTurn } from "@/lib/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SendChatMessageState = {
  error?: string;
  turn?: ChatTurn;
};

function actionError(error: unknown): SendChatMessageState {
  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendChatMessageAction(
  _prevState: SendChatMessageState,
  formData: FormData,
): Promise<SendChatMessageState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "Missing Auth.js session token" };
  }

  const threadId = readString(formData, "threadId");
  const clientRequestId = readString(formData, "clientRequestId");
  const content = readString(formData, "content");

  if (!threadId || !UUID_PATTERN.test(threadId)) {
    return { error: "Chat thread is missing" };
  }

  if (!UUID_PATTERN.test(clientRequestId)) {
    return { error: "Could not send that message" };
  }

  if (!content) {
    return { error: "Write a message first" };
  }

  if (content.length > CHAT_MESSAGE_CONTENT_MAX_LENGTH) {
    return { error: `Keep messages under ${CHAT_MESSAGE_CONTENT_MAX_LENGTH} characters` };
  }

  const timeZone = await getRequestTimeZone();

  try {
    const turn = await submitChatMessage(token, threadId, {
      content,
      clientRequestId,
      timeZone,
    });

    updateTag(chatMessagesCacheTag(threadId));

    if (turn.status === "failed") {
      return { turn, error: turn.failureMessage ?? "Could not complete that reply" };
    }

    return { turn };
  } catch (error) {
    return actionError(error);
  }
}
