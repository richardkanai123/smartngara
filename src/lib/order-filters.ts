import type { Client, Order } from "@convex/schema";
import { orderStatuses } from "@/lib/order-helpers";

export type OrderWithClient = {
  order: Order;
  client: Client | null;
};

/** URL param `delivery`: all | yes (delivery required) | no (pickup / not delivery) */
export type DeliveryFilterParam = "all" | "yes" | "no";

export function parseDeliveryFilter(value: string | null): DeliveryFilterParam {
  if (value === "yes" || value === "no") return value;
  return "all";
}

export function parseStatusFilter(
  value: string | null,
): Order["status"] | "all" {
  if (!value || value === "all") return "all";
  if ((orderStatuses as readonly string[]).includes(value)) {
    return value as Order["status"];
  }
  return "all";
}

/**
 * Client-side filter for admin orders list: `name` (multi-term substring),
 * `status` (single status or all), `delivery` (isDeliveryRequired).
 */
export function filterOrdersBySearchParams(
  rows: OrderWithClient[],
  searchParams: Pick<URLSearchParams, "get">,
): OrderWithClient[] {
  const rawName = (searchParams.get("name") || "").trim().toLowerCase();
  const terms = rawName.split(/\s+/).filter(Boolean);
  const statusFilter = parseStatusFilter(searchParams.get("status"));
  const delivery = parseDeliveryFilter(searchParams.get("delivery"));

  return rows.filter(({ order, client }) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (delivery === "yes" && !order.isDeliveryRequired) return false;
    if (delivery === "no" && order.isDeliveryRequired) return false;

    if (terms.length === 0) return true;

    const idLower = order._id.toLowerCase();
    const idTail = order._id.slice(-8).toLowerCase();
    const haystack = [
      idTail,
      idLower,
      order.status.replace(/-/g, " "),
      order.status,
      client?.name ?? "",
      client?.email ?? "",
      client?.phone ?? "",
      client?.address ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((t) => haystack.includes(t));
  });
}
