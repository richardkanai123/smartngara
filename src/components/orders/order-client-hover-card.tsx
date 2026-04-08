"use client";

import type { Client } from "@convex/schema";
import { Mail, MapPin, Phone, User } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type OrderClientHoverCardProps = {
  client: Client | null;
  displayName: string;
  className?: string;
};

export function OrderClientHoverCard({
  client,
  displayName,
  className,
}: OrderClientHoverCardProps) {
  if (!client) {
    return (
      <span className={cn("text-muted-foreground text-sm", className)}>
        {displayName}
      </span>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={200}
        closeDelay={100}
        href="#"
        className={cn(
          "max-w-[200px] cursor-default truncate border-b border-dotted border-muted-foreground/40 text-left font-medium text-foreground text-sm underline-offset-4 hover:border-foreground/50",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {displayName}
      </HoverCardTrigger>
      <HoverCardContent className="w-72 space-y-2.5 p-3" side="top" align="start">
        <div className="flex items-start gap-2">
          <User
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-snug">
              {client.name}
            </p>
            {client.isWalkIn ? (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Walk-in
              </p>
            ) : null}
          </div>
        </div>
        <dl className="space-y-2 text-xs">
          <div className="flex gap-2">
            <dt className="sr-only">Email</dt>
            <dd className="flex min-w-0 items-start gap-2 text-foreground">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="wrap-break-word">{client.email}</span>
            </dd>
          </div>
          {client.phone ? (
            <div className="flex gap-2">
              <dt className="sr-only">Phone</dt>
              <dd className="flex items-start gap-2 text-foreground">
                <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="tabular-nums">{client.phone}</span>
              </dd>
            </div>
          ) : null}
          {client.address ? (
            <div className="flex gap-2">
              <dt className="sr-only">Address</dt>
              <dd className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span className="whitespace-normal leading-snug">
                  {client.address}
                </span>
              </dd>
            </div>
          ) : null}
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}
