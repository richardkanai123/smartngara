"use client";

import type { Id } from "@convex/_generated/dataModel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Truck } from "lucide-react";
import { useState } from "react";

type OrderAddDeliveryPlaceholderProps = {
  orderId: Id<"orders">;
};

export function OrderAddDeliveryPlaceholder({
  orderId,
}: OrderAddDeliveryPlaceholderProps) {
  const [open, setOpen] = useState(false);
  

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          No delivery linked to this order yet.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button variant="outline" size="sm" className="w-full sm:w-auto" />}
          >
            <Truck className="size-3.5" />
            Add delivery
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>Add delivery</DialogTitle>
              <DialogDescription>
                Link delivery details to order{" "}
                <span className="font-mono tabular-nums text-foreground">
                  …{orderId.slice(-6)}
                </span>
                . Fields below are ready for your save handler.
              </DialogDescription>
            </DialogHeader>
            <form
              id="add-delivery-form"
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="delivery-address">Delivery address</Label>
                <Textarea
                  id="delivery-address"
                  name="deliveryAddress"
                  placeholder="Street, city, notes"
                  rows={3}
                  className="min-h-[4.5rem] resize-y"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pickup-address">Pickup address</Label>
                <Textarea
                  id="pickup-address"
                  name="pickupAddress"
                  placeholder="Optional"
                  rows={2}
                  className="resize-y"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-fee">Delivery fee</Label>
                <Input
                  id="delivery-fee"
                  name="deliveryFee"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                />
              </div>
            </form>
            <DialogFooter className="w-full flex justify-end items-end gap-2">
              <Button type="submit" form="add-delivery-form" className="w-full sm:w-auto">
                Add delivery
              </Button>
              <DialogClose render={<Button type="button" variant="outline" className="w-full sm:w-auto" />}>
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
