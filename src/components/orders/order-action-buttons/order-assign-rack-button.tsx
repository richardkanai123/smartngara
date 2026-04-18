"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Order } from "@convex/schema";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const OrderAssignRackButton = ({
  orderId,
  status,
  currentRackId,
}: {
  orderId: Id<"orders">;
  status: Order["status"];
  currentRackId?: Id<"racks">;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const Router = useRouter();
  const availableRacks = useQuery(api.racks.getAllAvailableRacks);
  const assignRack = useMutation(api.racks.assignRackToOrder);

  const comboboxItems = useMemo(
    () =>
      (availableRacks ?? []).map((rack) => {
        const used = rack.currentOrders?.length ?? 0;
        return {
          value: rack._id,
          label: rack.label,
          description: `${rack.location} · ${used} / ${rack.maxOrders} orders`,
        };
      }),
    [availableRacks],
  );

  useEffect(() => {
    if (!open) {
      setSelectedRackId("");
      return;
    }
    setAssignError(null);
    if (availableRacks === undefined) return;
    const inList =
      !!currentRackId && availableRacks.some((r) => r._id === currentRackId);
    setSelectedRackId(inList ? currentRackId : "");
  }, [open, currentRackId, availableRacks]);

  const handleAssign = () => {
    if (!selectedRackId) {
      setAssignError("Choose a rack first.");
      return;
    }

    startTransition(async () => {
      try {
        setAssignError(null);
        const result = await assignRack({
          orderId,
          rackId: selectedRackId as Id<"racks">,
        });
        if (!result.success) {
          toast.error("Could not assign rack", { description: result.message });
          setAssignError(result.message);
          return;
        }
        toast.success(result.message);
        Router.refresh();
        setOpen(false);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Something went wrong. Try again.";
        toast.error("Assignment failed", { description: message });
        setAssignError(message);
      }
    });
  };

  if (status === "cancelled" || status === "delivered") {
    return null;
  }

  const isLoading = availableRacks === undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={isLoading}
        className={cn(
          "inline-flex items-center gap-1 rounded-none px-2 py-1 text-xs ring-1 transition-colors",
          "bg-secondary/30 text-foreground hover:bg-secondary/50",
          "ring-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {isLoading ? (
          <Spinner className="size-3.5" />
        ) : (
          <Boxes className="size-3.5 shrink-0 opacity-80" />
        )}
        {currentRackId ? "Change rack" : "Assign rack"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentRackId ? "Change rack" : "Assign rack"}
          </DialogTitle>
          <DialogDescription>
            Choose an available rack with free capacity. If this order is
            already on a rack, it will be moved to the new rack.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          <Label className="text-xs">Rack</Label>
          <Combobox
            items={comboboxItems}
            value={selectedRackId}
            onValueChange={(v) => {
              setSelectedRackId(v);
              setAssignError(null);
            }}
            placeholder={
              comboboxItems.length === 0
                ? "No racks available"
                : "Search racks…"
            }
            searchPlaceholder="Search label or location…"
            emptyMessage="No rack matches your search."
            disabled={comboboxItems.length === 0}
            aria-invalid={!!assignError}
          />
          {comboboxItems.length === 0 && !isLoading ? (
            <p className="text-[0.65rem] text-muted-foreground">
              No rack has free capacity right now. Clear a slot or add a rack,
              then try again.
            </p>
          ) : null}
          {assignError ? (
            <p className="text-xs text-destructive">{assignError}</p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleAssign}
            disabled={
              isPending || !selectedRackId || comboboxItems.length === 0
            }
          >
            {isPending ? (
              <>
                <Spinner className="size-4" />
                Assigning…
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderAssignRackButton;
