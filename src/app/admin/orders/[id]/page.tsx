import { Suspense } from 'react'
import OrderDetails from '@/components/orders/order-details';

const AdminOrdersIdPage = async({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return (
    <div className="w-full mx-auto">
      <h1 className="text-lg font-bold">Order Details</h1>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
       <OrderDetails orderId={id} />
      </Suspense>
    </div>
  )
};
export default AdminOrdersIdPage;