import type { MediaKind } from "@/lib/types";

export const EVENT_MEDIA_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.m4v,.mov";

export const EVENT_MEDIA_MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const EVENT_MEDIA_MAX_VIDEO_BYTES = 200 * 1024 * 1024;

const UNSUPPORTED_FILE_ERROR = "Use a JPEG, PNG, WebP, MP4, or MOV file.";
const EMPTY_FILE_ERROR = "File is empty.";

type DeclaredImageMimeType = "image/jpeg" | "image/png" | "image/webp";
type DeclaredVideoMimeType = "video/mp4" | "video/quicktime";
type DeclaredMediaMimeType = DeclaredImageMimeType | DeclaredVideoMimeType;

type ClassifiedEventMediaFile = {
  kind: MediaKind;
  declaredMimeType: DeclaredMediaMimeType;
  maxBytes: number;
};

type ClassifyEventMediaFileResult =
  { ok: true; value: ClassifiedEventMediaFile } | { ok: false; error: string };

const IMAGE_MIME_TYPES = new Map<string, DeclaredImageMimeType>([
  ["image/jpeg", "image/jpeg"],
  ["image/jpg", "image/jpeg"],
  ["image/png", "image/png"],
  ["image/webp", "image/webp"],
]);

const VIDEO_MIME_TYPES = new Map<string, DeclaredVideoMimeType>([
  ["video/mp4", "video/mp4"],
  ["video/quicktime", "video/quicktime"],
]);

const IMAGE_EXTENSIONS = new Map<string, DeclaredImageMimeType>([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

const VIDEO_EXTENSIONS = new Map<string, DeclaredVideoMimeType>([
  ["mp4", "video/mp4"],
  ["m4v", "video/mp4"],
  ["mov", "video/quicktime"],
  ["qt", "video/quicktime"],
]);

function fileExtension(filename: string): string {
  const separatorIndex = filename.lastIndexOf(".");

  if (separatorIndex === -1) {
    return "";
  }

  return filename.slice(separatorIndex + 1).toLowerCase();
}

function mimeFromType(type: string): DeclaredMediaMimeType | null {
  const normalized = type.trim().toLowerCase();

  return IMAGE_MIME_TYPES.get(normalized) ?? VIDEO_MIME_TYPES.get(normalized) ?? null;
}

function mimeFromFilename(filename: string): DeclaredMediaMimeType | null {
  const extension = fileExtension(filename);

  return IMAGE_EXTENSIONS.get(extension) ?? VIDEO_EXTENSIONS.get(extension) ?? null;
}

function classifiedFile(declaredMimeType: DeclaredMediaMimeType): ClassifiedEventMediaFile {
  const kind: MediaKind = declaredMimeType.startsWith("video/") ? "video" : "image";

  return {
    kind,
    declaredMimeType,
    maxBytes: kind === "video" ? EVENT_MEDIA_MAX_VIDEO_BYTES : EVENT_MEDIA_MAX_IMAGE_BYTES,
  };
}

function oversizeError(kind: MediaKind): string {
  return kind === "video" ? "Video must be 200 MB or smaller." : "Image must be 15 MB or smaller.";
}

export function classifyEventMediaFile(file: {
  name: string;
  type: string;
  size: number;
}): ClassifyEventMediaFileResult {
  if (file.size < 1) {
    return { ok: false, error: EMPTY_FILE_ERROR };
  }

  const type = file.type.trim().toLowerCase();
  const declaredMimeType =
    type === "" || type === "application/octet-stream"
      ? mimeFromFilename(file.name)
      : mimeFromType(type);

  if (!declaredMimeType) {
    return { ok: false, error: UNSUPPORTED_FILE_ERROR };
  }

  const value = classifiedFile(declaredMimeType);

  if (file.size > value.maxBytes) {
    return { ok: false, error: oversizeError(value.kind) };
  }

  return { ok: true, value };
}
