"use client";

import { useEffect } from "react";

import type { DeployInfo } from "@/lib/deploy-info";

type DeployMarkerProps = {
  info: DeployInfo;
};

export function DeployMarker({ info }: DeployMarkerProps) {
  useEffect(() => {
    console.log("[athlete-development-web deploy]", info);
  }, [info]);

  if (info.environment === "local") {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-24 right-3 z-50 rounded-md bg-black/75 px-2 py-1 font-mono text-[10px] text-white/80"
    >
      {info.environment} · {info.branch} · {info.commit}
    </div>
  );
}
