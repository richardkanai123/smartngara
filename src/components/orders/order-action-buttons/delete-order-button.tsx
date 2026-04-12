'use client';


import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation';
import type { Id } from '@convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { Trash2Icon } from 'lucide-react';
import type { Order } from '@convex/schema';

const DeleteOrderButton = ({ orderId, status }: { orderId: Id<"orders">, status: Order["status"] }) => {
  const [open, setOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const Router = useRouter();

  const handleDeleteOrder = async (order: Id<"orders">) => {
    startTransition(async () => {
      try {
        setDeleteError(null);
        const result = await deleteOrder({ id: order })
        if (!result.success) {
          toast.error("Failed to delete order", { description: result.message });
          setDeleteError(result.message);
          return;
        }
        toast.success(result.message);
        setOpen(false);
        setDeleteError(null);
        Router.back();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete order, please try again later.";
        toast.error("Failed!", { description: errorMessage });
        setDeleteError(errorMessage);
      }
    });
  }

 const canDeleteOrder = status === "pending" || status ==='cancelled'

 if (!canDeleteOrder) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn('bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 px-2 py-1 text-xs ring-1 ring-destructive')}>
        <Trash2Icon className="size-4 fill-destructive inline-block mr-1 align-middle" /> Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogDescription>
          {deleteError && (
            <div className="text-destructive text-sm mt-2">{deleteError}</div>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => handleDeleteOrder(orderId)} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : "Delete Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteOrderButton