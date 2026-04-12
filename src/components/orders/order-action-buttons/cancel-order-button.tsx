"use client";
import type { Order } from "@convex/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
type CancelOrderButtonProps = {
  orderId: Id<"orders">;
  status: Order["status"];
};

const CancelOrderButton = ({ orderId, status }: CancelOrderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cancelOrder = useMutation(api.orders.cancelOrder);
  const [cancelReason, setCancelReason] = useState<string>("");
  const Router = useRouter();

  // zod cancel reason schema
  const cancelReasonSchema = z
    .string()
    .min(3, "Reason is required")
    .max(200, "Reason must be less than 200 characters");

  const handleCancelOrder = async (order: Id<"orders">, reason: string) => {
    startTransition(async () => {
      try {
        setCancelError(null);
        const validatedReason = cancelReasonSchema.safeParse(reason);
        if (!validatedReason.success) {
          setCancelError(validatedReason.error.message);
          toast.error("Invalid reason", {
            description: validatedReason.error.message,
          });
          return;
        }
        const result = await cancelOrder({ id: order, reason });
        if (!result.success) {
          toast.error("Failed to cancel order", {
            description: result.message,
          });
          setCancelError(result.message);
          return;
        }

        toast.success(result.message);
        setOpen(false);
        setCancelReason("");
        setCancelError(null);
        Router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to cancel order, please try again later.";
        toast.error("Failed", { description: errorMessage });
        setCancelError(errorMessage);
      }
    });
  };

  if (status === "cancelled" || status === "delivered" || status === "ready-for-pickup") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn('bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 px-2 py-1 text-xs ring-1 ring-destructive')}>
        <XIcon className="size-4 fill-destructive inline-block mr-1 align-middle" /> Cancel
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order </DialogTitle>
          <DialogDescription>
            Are you sure you want to this cancel order?
          </DialogDescription>
          <div className="mt-2 flex flex-col gap-2">
            <Label>Reason</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation"
            />
          </div>
          {cancelError && (
            <div className="text-destructive text-sm mt-2">{cancelError}</div>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleCancelOrder(orderId, cancelReason)}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderButton;
