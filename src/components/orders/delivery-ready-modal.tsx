"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeliveryReadyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * UI-only: confirm flow for marking an order ready for delivery (wire mutations later).
 */
export function DeliveryReadyModal({ open, onOpenChange }: DeliveryReadyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Ready for delivery</DialogTitle>
          <DialogDescription>
            This will mark the order as ready for the next delivery step. Confirmation and
            courier assignment will be wired up later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
