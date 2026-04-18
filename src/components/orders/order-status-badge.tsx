'use client';

import { Suspense } from 'react'
import { Badge } from '../ui/badge';
import { getStatusIcon } from '@/lib/order-helpers';
import { cn } from '@/lib/utils';
import type { Order } from '@convex/schema';
import { Skeleton } from '../ui/skeleton';

const statusConfig: Record<Order["status"], { bg: string, text: string, border: string, dot: string, pulse?: boolean }> = {
  "pending": { bg: "bg-amber-500/15 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/30", dot: "bg-amber-500", pulse: true },
  "processing": { bg: "bg-blue-500/15 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/30", dot: "bg-blue-500", pulse: true },
  "ready-for-pickup": { bg: "bg-indigo-500/15 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-500/30", dot: "bg-indigo-500", pulse: true },
  "in-transit": { bg: "bg-orange-500/15 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/30", dot: "bg-orange-500", pulse: true },
  "on-delivery": { bg: "bg-purple-500/15 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/30", dot: "bg-purple-500", pulse: true },
  "delivered": { bg: "bg-emerald-500/15 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500" },
  "cancelled": { bg: "bg-red-500/15 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-500/30", dot: "bg-red-500" },
};

const formatStatus = (status: string) => {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const OrderStatusBadge = ({status}: {status: Order["status"]}) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = getStatusIcon(status);

  return (
    <Suspense fallback={<Skeleton className="h-6 w-24 rounded-full" />}>
        <Badge 
            variant="outline"
            className={cn(
                "px-2.5 py-0.5 rounded-full font-medium transition-all duration-300 ease-in-out hover:shadow-sm border",
                config.bg,
                config.text,
                config.border
            )}
        >
            <span className="flex items-center gap-1.5">
                
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${status === "processing" ? "animate-spin" : ""}`} strokeWidth={2.5} />}
                <span className="truncate">{formatStatus(status)}</span>
            </span>
        </Badge>    
    </Suspense>
  )
}

export default OrderStatusBadge
