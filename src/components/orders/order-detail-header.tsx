"use client";

import type { ComponentType } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { Calendar, CalendarCheck, Store, Truck } from "lucide-react";
import { BsQrCodeScan } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MdIron } from "react-icons/md";
type OrderDetailsHeaderProps = {
  orderId: Id<"orders">;
  createdAt: number;
  delivery: boolean;
  ironing: boolean;
  completedAt: number | undefined;
};

type MetaIcon = ComponentType<{ className?: string }>;

type DetailItem = {
  label: string;
  value: string;
  Icon: MetaIcon;
};

function MetaTile({ label, value, Icon }: DetailItem) {
  return (
    <Card
      className={cn(
        "transition-all ease-in duration-200 ring-1",
        "hover:ring-foreground/20 hover:shadow-md",
      )}
    >
      <CardContent className="flex flex-row items-start gap-3 pt-0">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground"
          aria-hidden
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-light uppercase tracking-wider text-foreground">
            {label}
          </p>
          <p className="wrap-break-word text-sm font-semibold leading-snug text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrderDetailsHeader({
  orderId,
  createdAt,
  delivery,
  ironing,
  completedAt,
}: OrderDetailsHeaderProps) {
  const placed = format(new Date(createdAt),'PPPPpp');
  const orderIdDisplay = `…${orderId.slice(-5)}`;

  const details: DetailItem[] = [
    {
      label: "Order ID",
      value: orderIdDisplay,
      Icon: BsQrCodeScan,
    },
    {
      label: "Delivery Mode",
      value: delivery ? "Delivery" : "Store pickup",
      Icon: delivery ? Truck : Store,
    },
    {
      label: "Ironing",
      value: ironing ? "Requested" : "Not requested",
      Icon: MdIron,
    },
    {
      label: "Placed",
      value: placed,
      Icon: Calendar,
    },
    {
      label: "Completed",
      value: completedAt ? format(new Date(completedAt),'PPPPpp') : "—",
      Icon: CalendarCheck,
    },
  ];

  const detailsToShow = completedAt ? details : details.slice(0, 4);

  return (
    <section className=" w-full" aria-label="Order summary">

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 my-2">
        {detailsToShow.map((row) => (
          <MetaTile key={row.label} {...row} />
        ))}
      </div>
    </section>
  );
}
