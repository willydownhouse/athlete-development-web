"use client";

import type { ReactNode } from "react";

import { useFillVisibleViewport } from "@/hooks/use-fill-visible-viewport";

type VisibleViewportFrameProps = {
  children: ReactNode;
  className: string;
};

export function VisibleViewportFrame({ children, className }: VisibleViewportFrameProps) {
  const rootRef = useFillVisibleViewport<HTMLDivElement>();

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
