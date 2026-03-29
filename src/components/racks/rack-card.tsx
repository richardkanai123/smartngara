"use client";
import type { Order, Rack } from "@convex/schema";
import { rackSizeLabel, statusTileStyles } from "@/lib/racks-helper";
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
import { Lock, MapPin, Package, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import MinOrdersTable from "@/components/orders/min-orders-table";

const RackCard = ({ rack }: { rack: Rack }) => {
  const { label, status, orders, maxOrders, location, size, isReserved } = rack;
  const tile = statusTileStyles[status];
  const used = orders?.length ?? 0;
  const remainingOrders = maxOrders - used;
  const [isPending, setisPending] = useState(false);

  const unreserveRack = useMutation(api.racks.unreserveRack);
  const reserveRack = useMutation(api.racks.reserveRack);

  const rackOrders: Order[] | undefined = useQuery(
    api.racks.getAllOrdersForRack,
    { id: rack._id },
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

  return (
    <Drawer direction="right">
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
              {status.replace("-", " ")}
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
      <DrawerContent className="flex max-h-[90vh] w-full flex-col gap-3 p-4 sm:max-w-lg">
        <DrawerHeader className="space-y-1 text-left">
          <DrawerTitle className="font-semibold text-2xl">{label}</DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-sm">
            Rack details and active orders
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

        <div className="flex flex-col gap-3 border-border/60 border-y py-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 font-medium text-xs capitalize",
                tile.border,
                tile.tint,
                tile.label,
              )}
            >
              {status.replace("-", " ")}
            </span>
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
              disabled={isPending}
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
              disabled={isPending}
              onClick={handleReserveRack}
            >
              <Lock className="size-4" aria-hidden />
              {isPending ? "Reserving…" : "Reserve rack"}
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1">
          {rackOrders === undefined ? (
            <p className="text-muted-foreground text-sm">Loading orders…</p>
          ) : rackOrders.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="font-medium text-foreground text-sm">Orders</h2>
              <MinOrdersTable orders={rackOrders} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No orders on this rack.
            </p>
          )}
        </div>

        <DrawerClose disabled={isPending} asChild>
          <Button
            disabled={isPending}
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
