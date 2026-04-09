import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { orderIdSuffix } from "@/components/orders/order-details-utils";

type OrderDetailsBreadcrumbProps = {
  orderId: string;
};

export function OrderDetailsBreadcrumb({ orderId }: OrderDetailsBreadcrumbProps) {
  const short = orderIdSuffix(orderId);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-muted-foreground text-xs">
      <Link href="/admin" className="hover:text-foreground">
        Admin
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
      <Link href="/admin/orders" className="hover:text-foreground">
        Orders
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
      <span className="font-mono text-foreground tabular-nums">…{short}</span>
    </nav>
  );
}
