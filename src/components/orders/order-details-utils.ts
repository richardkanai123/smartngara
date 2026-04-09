/** Compact display for Convex ids */
export function orderIdSuffix(id: string): string {
  const tail = id.slice(-8);
  return tail.length >= 6 ? tail : id;
}

export function formatMoney(amount: number, currency = "KES"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
