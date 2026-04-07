'use client';

import { Order } from '@convex/schema';
import { Button } from '../ui/button';
import { getActionsForStatus } from '@/lib/order-helpers';

const OrderButtons = ({orderID,status}: {orderID: string, status: Order["status"]}) => {

    const orderActions = getActionsForStatus(status);

  return (
    <div className="flex gap-2">
        <Button variant="outline">{orderActions}</Button>
        <Button variant="destructive">Cancel</Button>
    </div>
  )
}

export default OrderButtons