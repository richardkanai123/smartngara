import type { Client } from "@convex/schema"

/** URL param `walkIn`: all | yes (walk-in only) | no (non–walk-in only) */
export type WalkInFilterParam = "all" | "yes" | "no"

export function parseWalkInFilter(value: string | null): WalkInFilterParam {
  if (value === "yes" || value === "no") return value
  return "all"
}

/**
 * Client-side filter for admin list: `name` (multi-term substring) and `walkIn`.
 */
export function filterClientsBySearchParams(
  clients: Client[],
  searchParams: Pick<URLSearchParams, "get">
): Client[] {
  const rawName = (searchParams.get("name") || "").trim().toLowerCase()
  const terms = rawName.split(/\s+/).filter(Boolean)
  const walkIn = parseWalkInFilter(searchParams.get("walkIn"))

  return clients.filter((c) => {
    if (walkIn === "yes" && !c.isWalkIn) return false
    if (walkIn === "no" && c.isWalkIn) return false

    if (terms.length === 0) return true

    const haystack = [c.name, c.email, c.phone ?? "", c.address ?? ""]
      .join(" ")
      .toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}
