'use client';

import { api } from "@convex/_generated/api";
import type{ Id } from "@convex/_generated/dataModel";
import type { Order } from "@convex/schema";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { cn } from "@/lib/utils";
import { PlayIcon } from "lucide-react";

type ProcessOrderBtnProps = {
  orderId: Id<"orders">;
  status: Order["status"];
};

const ProcessOrderBtn = ({ orderId, status }: ProcessOrderBtnProps) => {
  const [open, setOpen] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const processOrder = useMutation(api.orders.processOrder);
  const Router = useRouter();

  const handleProcessOrder = async (order: Id<"orders">) => {
    startTransition(async () => {
      try {
        const result = await processOrder({ id: order })
        if (!result.success) {
          toast.error("Failed to process order", {
            description: result.message,
          });
          setProcessError(result.message);
          return;
        }
        toast.success(result.message);
        setOpen(false);
        setProcessError(null);
        Router.refresh();
      }
      catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to process order, please try again later.";
        toast.error("Failed", { description: errorMessage });
        setProcessError(errorMessage);
      }
    });
  }

  if(status !=='pending') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn('bg-primary/10 text-primary hover:bg-primary/20 focus-visible:border-primary/40 focus-visible:ring-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 dark:focus-visible:ring-primary/40 px-2 py-1 text-xs ring-1 ring-primary')}>
        <PlayIcon className="size-4 fill-primary inline-block mr-1 align-middle" /> Process
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Order</DialogTitle>
          <DialogDescription>
            This order will be marked as processing, meaning cleaning/ironing or both is ongoing. Are you sure you want to process this order?
          </DialogDescription>
          {processError && (
            <div className="text-destructive text-sm mt-2">{processError}</div>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => handleProcessOrder(orderId)} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : "Process Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProcessOrderBtn