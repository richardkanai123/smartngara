'use client';

import { Order } from '@convex/schema';
import { Button } from '../ui/button';
import { getActionsForStatus } from '@/lib/order-helpers';

const OrderButtons = ({orderID, status,}: {orderID: string, status: Order["status"]}) => {

    const orderAction = getActionsForStatus(status);
    console.log(orderID);

  return (
    <div className="flex gap-2">
        {orderAction && (
          <Button variant="outline">{orderAction}</Button>
        )}
        {status !== 'cancelled' && status !== 'delivered' && (
          <Button variant="destructive">Cancel</Button>
        )}
    </div>
  )
}

export default OrderButtons