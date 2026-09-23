"use server";

import { updateTag } from "next/cache";

import {
  fetchFocusedEventChatMessages,
  fetchOlderChatMessages,
  submitChatMessage,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { athleteEventsCacheTag, chatMessagesCacheTag, eventCacheTag } from "@/lib/cache-tags";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { CHAT_MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/constants";
import { getRequestLocale } from "@/lib/locale-server";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { ChatMessage, ChatTurn } from "@/lib/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SendChatMessageState = {
  error?: string;
  turn?: ChatTurn;
};

async function actionError(error: unknown): Promise<{ error: string }> {
  return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendChatMessageAction(
  _prevState: SendChatMessageState,
  formData: FormData,
): Promise<SendChatMessageState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const threadId = readString(formData, "threadId");
  const clientRequestId = readString(formData, "clientRequestId");
  const content = readString(formData, "content");
  const eventId = readString(formData, "eventId");
  const athleteId = readString(formData, "athleteId");

  if (!threadId || !UUID_PATTERN.test(threadId)) {
    return { error: actions.chatThreadMissing };
  }

  if (!UUID_PATTERN.test(clientRequestId)) {
    return { error: actions.couldNotSendMessage };
  }

  if (!content) {
    return { error: actions.writeMessageFirst };
  }

  if (content.length > CHAT_MESSAGE_CONTENT_MAX_LENGTH) {
    return { error: actions.messageTooLong(CHAT_MESSAGE_CONTENT_MAX_LENGTH) };
  }

  if (eventId && !UUID_PATTERN.test(eventId)) {
    return { error: actions.couldNotSendMessage };
  }

  if (athleteId && !UUID_PATTERN.test(athleteId)) {
    return { error: actions.couldNotSendMessage };
  }

  const [timeZone, locale] = await Promise.all([getRequestTimeZone(), getRequestLocale()]);

  try {
    const turn = await submitChatMessage(token, threadId, {
      content,
      clientRequestId,
      timeZone,
      locale,
      ...(eventId ? { eventId } : {}),
    });

    updateTag(chatMessagesCacheTag(threadId));
    if (eventId) {
      updateTag(eventCacheTag(eventId));
    }
    if (athleteId) {
      updateTag(athleteEventsCacheTag(athleteId));
    }

    if (turn.status === "failed") {
      return { turn, error: turn.failureMessage ?? actions.couldNotCompleteReply };
    }

    return { turn };
  } catch (error) {
    return await actionError(error);
  }
}

export type LoadOlderChatMessagesResult = {
  error?: string;
  items?: ChatMessage[];
  hasMore?: boolean;
};

export async function loadOlderChatMessagesAction(
  threadId: string,
  before: string,
): Promise<LoadOlderChatMessagesResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  if (!UUID_PATTERN.test(threadId) || !UUID_PATTERN.test(before)) {
    return { error: actions.loadOlderMessages };
  }

  try {
    const result = await fetchOlderChatMessages(token, threadId, before);
    return {
      items: result.items,
      hasMore: result.pagination.hasMore,
    };
  } catch (error) {
    return await actionError(error);
  }
}

export async function loadFocusedEventChatMessagesAction(
  threadId: string,
  focusedEventId: string,
  before?: string,
): Promise<LoadOlderChatMessagesResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  if (!UUID_PATTERN.test(threadId) || !UUID_PATTERN.test(focusedEventId)) {
    return { error: actions.loadEarlierUpdates };
  }

  if (before && !UUID_PATTERN.test(before)) {
    return { error: actions.loadEarlierUpdates };
  }

  try {
    const result = await fetchFocusedEventChatMessages(token, threadId, focusedEventId, {
      ...(before ? { before } : {}),
    });
    return {
      items: result.items,
      hasMore: result.pagination.hasMore,
    };
  } catch (error) {
    return await actionError(error);
  }
}
