"use client";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState, useTransition } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type { Order } from "@convex/schema";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
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
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

type ReadyOrderBtnProps = {
  orderId: Id<"orders">;
  status: Order["status"];
};

const ReadyOrderBtn = ({ orderId, status }: ReadyOrderBtnProps) => {
  const [open, setOpen] = useState(false);
  const [readyError, setReadyError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const readyOrder = useMutation(api.orders.updateOrderStatus);
  const Router = useRouter();

  const handleReadyOrder = async (order: Id<"orders">) => {
    startTransition(async () => {
      try {
        const result = await readyOrder({
          id: order,
          status: "ready-for-pickup",
        });
        if (!result.success) {
          toast.error("Status update failed", {
            description: result.message,
          });
        }
        toast.success(result.message);
        setOpen(false);
        setReadyError(null);
        Router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Status update failed, please try again later.";
        toast.error("Failed!", { description: errorMessage });
        setReadyError(errorMessage);
      }
    });
  };

  if (status !== "processing") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="  bg-lime-700 hover:bg-muted px-2 py-1 text-xs  ring-1 ring-lime-700">
        <CheckIcon className="size-4 fill-lime-700 inline-block mr-1 align-middle" /> Ready
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ready Order</DialogTitle>
          <DialogDescription>
            This will mark the order as ready for pickup or delivery. Are you sure you want to mark this order as ready for pickup or delivery?
          </DialogDescription>
          {readyError && (
            <div className="text-destructive text-sm mt-2">{readyError}</div>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-lime-700 hover:bg-muted"
            onClick={() => handleReadyOrder(orderId)}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : "Ready Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyOrderBtn;
