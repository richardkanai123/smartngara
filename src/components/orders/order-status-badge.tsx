'use client';

import React, { Suspense } from 'react'
import { Badge } from '../ui/badge';
import { getColorForStatus } from '@/lib/order-helpers';
import { cn } from '@/lib/utils';
import { Order } from '@convex/schema';
import { Skeleton } from '../ui/skeleton';

const OrderStatusBadge = ({status}: {status: Order["status"]}) => {
  return (
    <Suspense fallback={<Skeleton className=" h-3 rounded-sm" />}
    >
        <Badge className={cn(getColorForStatus(status), "text-white font-bold rounded-md")}>
            {status}
        </Badge>    
    </Suspense>
  )
}

export default OrderStatusBadge