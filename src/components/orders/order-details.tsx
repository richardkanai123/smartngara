import { fetchAuthQuery } from '@/lib/auth-server';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import OrderButtons from './order-buttons';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import OrderStatusBadge from './order-status-badge';

const OrderDetails = async({ orderId }: { orderId: string }) => {
    const order =await fetchAuthQuery(api.orders.getOrderById, { id: orderId as Id<"orders"> });

   const {_creationTime, clientId,handlerId,items,isDeliveryRequired,instructions,ironing,ironingFee,orderFee,rackId,status,completedAt,deliveryId}=order
  return (
    <div className='w-full mx-auto flex flex-col gap-2'>
        <Suspense fallback={<Skeleton className="w-full h-5" />}
        >
            <OrderStatusBadge status={status} />
            <OrderButtons orderID={orderId} status={status} />
        </Suspense>
        {/* order details card , status and Items, Instructions, Fees */}

        {/* Client Card */}

        {/* Handler Card */}

        {/* Delivery Card */}

        
    </div>
  )
}

export default OrderDetails