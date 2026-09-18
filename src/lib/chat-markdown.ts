export type ChatMarkdownSegment = {
  type: "text" | "strong" | "em";
  value: string;
};

export function parseChatMarkdown(input: string): ChatMarkdownSegment[] {
  const segments: ChatMarkdownSegment[] = [];
  let index = 0;

  while (index < input.length) {
    if (input.startsWith("**", index)) {
      const end = input.indexOf("**", index + 2);
      if (end > index + 2) {
        segments.push({ type: "strong", value: input.slice(index + 2, end) });
        index = end + 2;
        continue;
      }
    }

    if (input[index] === "*" && input[index + 1] !== "*") {
      const end = input.indexOf("*", index + 1);
      if (end > index + 1) {
        segments.push({ type: "em", value: input.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }

    const next = input.indexOf("*", index);
    const end = next === -1 ? input.length : next;
    if (end === index) {
      segments.push({ type: "text", value: "*" });
      index += 1;
      continue;
    }

    segments.push({ type: "text", value: input.slice(index, end) });
    index = end;
  }

  return mergeAdjacentText(segments);
}

function mergeAdjacentText(segments: ChatMarkdownSegment[]): ChatMarkdownSegment[] {
  const merged: ChatMarkdownSegment[] = [];

  for (const segment of segments) {
    const last = merged.at(-1);
    if (segment.type === "text" && last?.type === "text") {
      last.value += segment.value;
      continue;
    }

    merged.push({ ...segment });
  }

  return merged;
}
