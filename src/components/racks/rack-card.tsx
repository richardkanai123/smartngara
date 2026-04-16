"use client";

import type { Order, Rack } from "@convex/schema";

import {
  formatRackStatusLabel,
  rackSizeLabel,
  RACK_STATUS_OPTIONS,
  statusTileStyles,
} from "@/lib/racks-helper";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { api } from "@convex/_generated/api";

import { useMutation, useQuery } from "convex/react";

import {
  Activity,
  ChevronDown,
  Lock,
  MapPin,
  Package,
  Unlock,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import MinOrdersTable from "@/components/orders/min-orders-table";

const RackCard = ({ rack }: { rack: Rack }) => {
  const { label, status, currentOrders, maxOrders, location, size, isReserved } =
    rack;

  const tile = statusTileStyles[status];

  const used = currentOrders?.length ?? 0;

  const remainingOrders = maxOrders - used;

  const [isPending, setisPending] = useState(false);

  const [statusSaving, setStatusSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const unreserveRack = useMutation(api.racks.unreserveRack);

  const reserveRack = useMutation(api.racks.reserveRack);

  const updateRackStatus = useMutation(api.racks.updateRackStatus);

  const rackOrders = useQuery(
    api.racks.getAllOrdersForRack,
    drawerOpen ? { id: rack._id } : "skip",
  );

  const sizeText = rackSizeLabel[size];

  const handleUnreserveRack = async () => {
    setisPending(true);

    try {
      await unreserveRack({ id: rack._id });

      toast.success(`${label} is now unreserved`, {
        icon: <Unlock className="size-4" />,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to unreserve rack";

      toast.error(message);
    } finally {
      setisPending(false);
    }
  };

  const handleReserveRack = async () => {
    setisPending(true);

    try {
      await reserveRack({ id: rack._id });

      toast.success(`${label} is now reserved`, {
        icon: <Lock className="size-4" />,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reserve rack";

      toast.error(message);
    } finally {
      setisPending(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const next = e.target.value as Rack["status"];

    if (next === status) return;

    setStatusSaving(true);

    try {
      const result = await updateRackStatus({ id: rack._id, status: next });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(`${label}: ${formatRackStatusLabel(next)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status";

      toast.error(message);
    } finally {
      setStatusSaving(false);
    }
  };

  const drawerBusy = isPending || statusSaving;

  return (
    <Drawer direction="right" onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={isReserved ? `${label}, reserved` : `${label}, rack slot`}
          className={cn(
            "group relative flex min-h-[104px] w-full flex-col items-stretch justify-between overflow-hidden rounded-lg border border-border/90 bg-background p-3 text-left shadow-sm transition-all",

            "border-l-4",

            tile.border,

            tile.tint,

            "hover:z-10 hover:-translate-y-0.5 hover:border-border hover:shadow-lg",

            "active:translate-y-0 active:shadow-md",

            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "line-clamp-2 min-w-0 flex-1 font-semibold text-foreground text-sm leading-tight tracking-tight sm:text-base",

                tile.label,
              )}
            >
              {label}
            </span>

            <span
              className="shrink-0 rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase leading-none tracking-wide"
              title={`Size: ${sizeText}`}
            >
              {sizeText}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2 border-border/50 border-t pt-2">
            <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              {formatRackStatusLabel(status)}
            </span>

            <span className="flex items-center gap-1 font-mono text-muted-foreground text-xs tabular-nums">
              <Package className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {used}/{maxOrders}
            </span>
          </div>

          {isReserved ? (
            <span
              className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center rounded-lg bg-background/55 backdrop-blur-[2px] dark:bg-background/45"
              aria-hidden
            >
              <Lock
                className="size-9 text-foreground/65 drop-shadow-sm dark:text-foreground/80"
                strokeWidth={2}
              />
            </span>
          ) : null}

          <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-black/5 ring-inset dark:ring-white/10" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex h-full max-h-dvh min-h-0 w-full flex-col gap-3 overflow-hidden p-4 sm:max-w-lg">
        <DrawerHeader className="space-y-1 text-left">
          <DrawerTitle className="font-semibold text-2xl">{label}</DrawerTitle>

          <DrawerDescription className="text-muted-foreground text-sm">
            Location, status, and current orders on this rack
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-sm">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />

          <div className="min-w-0">
            <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              Location
            </p>

            <p className="text-foreground leading-snug">{location}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-sm">
          <Activity
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />

          <div className="min-w-0 flex-1 space-y-1.5">
            <label
              htmlFor={`rack-status-${rack._id}`}
              className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider"
            >
              Status
            </label>

            <div className="relative">
              <select
                id={`rack-status-${rack._id}`}
                value={status}
                onChange={handleStatusChange}
                disabled={drawerBusy || used > 0}
                title={
                  used > 0
                    ? "Cannot change status while the rack has active orders"
                    : undefined
                }
                aria-label="Change rack status"
                className={cn(
                  "bg-muted/80 h-8 w-full appearance-none rounded-none border border-border/80 py-0 pr-5 pl-2.5 text-left text-xs text-foreground capitalize",
                  "outline-none transition-colors",
                  "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {RACK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatRackStatusLabel(s)}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-border/60 border-y py-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-xs">
              {remainingOrders} slots free
            </span>

            {isReserved ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-900 text-xs dark:text-amber-100">
                <Lock className="size-3" aria-hidden />
                Reserved
              </span>
            ) : null}
          </div>

          {isReserved ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 sm:w-auto"
              disabled={drawerBusy}
              onClick={handleUnreserveRack}
            >
              <Unlock className="size-4" aria-hidden />

              {isPending ? "Removing…" : "Remove reservation"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 sm:w-auto"
              disabled={drawerBusy}
              onClick={handleReserveRack}
            >
              <Lock className="size-4" aria-hidden />

              {isPending ? "Reserving…" : "Reserve rack"}
            </Button>
          )}
        </div>

        {drawerOpen ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2 border-border/50 border-t pt-3">
            <h2 className="shrink-0 font-medium text-foreground text-sm">
              Current orders
              <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
                ({rackOrders === undefined ? used : rackOrders.length})
              </span>
            </h2>

            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              {rackOrders === undefined ? (
                <p className="text-muted-foreground text-sm">Loading orders…</p>
              ) : rackOrders.length > 0 ? (
                <MinOrdersTable orders={rackOrders} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  No current orders on this rack.
                </p>
              )}
            </div>
          </div>
        ) : null}

        <DrawerClose disabled={drawerBusy} asChild>
          <Button
            disabled={drawerBusy}
            variant="default"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
};

export default RackCard;
