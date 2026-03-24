"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

type Status = "checking" | "online" | "offline";

const TIMEOUT_MS = 10_000;

const STATUS_CONFIG = {
  checking: { color: "bg-yellow-500 animate-pulse", label: "Checking..." },
  online: { color: "bg-green-500", label: "System OK" },
  offline: { color: "bg-red-500 animate-pulse", label: "System Unreachable" },
} as const;

export function BackendStatus() {
  const result = useQuery(api.health.ping);
  const [status, setStatus] = useState<Status>("checking");
  const prevStatus = useRef<Status>("checking");

  const updateStatus = useCallback((next: Status) => {
    setStatus((prev) => {
      prevStatus.current = prev;
      return next;
    });
  }, []);

  useEffect(() => {
    if (result === null) {
      updateStatus("online");
    }
  }, [result, updateStatus]);

  useEffect(() => {
    if (status === "online") return;

    const timer = setTimeout(() => {
      if (status === "checking") {
        updateStatus("offline");
      }
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [status, updateStatus]);

  useEffect(() => {
    if (status === "offline" && prevStatus.current !== "offline") {
      toast.error("Backend is unreachable");
    }
  }, [status]);

  const { color, label } = STATUS_CONFIG[status];

  if (status === "checking") {
    return <Spinner className="size-2" />;
  }

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {label}
      </span>
    </div>
  );
}
