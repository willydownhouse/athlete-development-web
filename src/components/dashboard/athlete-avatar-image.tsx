"use client";

import { useState } from "react";

type AthleteAvatarImageProps = {
  src: string;
  alt: string;
  initials: string;
};

export function AthleteAvatarImage({ src, alt, initials }: AthleteAvatarImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return initials;
  }

  return (
    // Same-origin contentUrl is proxied by Next.js with cache headers.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
