import type { Client, Order } from "@convex/schema";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { orderStatuses } from "@/lib/order-helpers";

export type OrderWithClient = {
  order: Order;
  client: Client | null;
};

/** URL param `date`: all | today | yesterday | week | month | range (with `from` / `to` as YYYY-MM-DD) */
export type DatePresetParam =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "range";

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

export function parseDatePreset(value: string | null): DatePresetParam {
  if (
    value === "today" ||
    value === "yesterday" ||
    value === "week" ||
    value === "month" ||
    value === "range"
  ) {
    return value;
  }
  return "all";
}

/** Validates `YYYY-MM-DD`; returns null if invalid. */
export function parseYmdParam(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return value;
}

function ymdToLocalStartOfDay(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return startOfDay(dt);
}

/**
 * Inclusive createdAt window in the user's local timezone.
 * Returns null when no date filter applies.
 */
export function getOrderDateFilterBounds(
  searchParams: Pick<URLSearchParams, "get">,
  now: Date = new Date(),
): { startMs: number; endMs: number } | null {
  const preset = parseDatePreset(searchParams.get("date"));
  const fromY = parseYmdParam(searchParams.get("from"));
  const toY = parseYmdParam(searchParams.get("to"));

  if (preset === "all") return null;

  if (preset === "today") {
    return {
      startMs: startOfDay(now).getTime(),
      endMs: endOfDay(now).getTime(),
    };
  }
  if (preset === "yesterday") {
    const y = subDays(now, 1);
    return {
      startMs: startOfDay(y).getTime(),
      endMs: endOfDay(y).getTime(),
    };
  }
  if (preset === "week") {
    const a = startOfWeek(now, { weekStartsOn: 1 });
    const b = endOfWeek(now, { weekStartsOn: 1 });
    return { startMs: a.getTime(), endMs: b.getTime() };
  }
  if (preset === "month") {
    return {
      startMs: startOfMonth(now).getTime(),
      endMs: endOfMonth(now).getTime(),
    };
  }
  if (preset === "range") {
    if (!fromY || !toY) return null;
    let start = ymdToLocalStartOfDay(fromY);
    let end = ymdToLocalStartOfDay(toY);
    if (!start || !end) return null;
    if (start.getTime() > end.getTime()) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    return {
      startMs: start.getTime(),
      endMs: endOfDay(end).getTime(),
    };
  }
  return null;
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
  const dateBounds = getOrderDateFilterBounds(searchParams);

  return rows.filter(({ order, client }) => {
    if (dateBounds) {
      if (order.createdAt < dateBounds.startMs || order.createdAt > dateBounds.endMs) {
        return false;
      }
    }
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
