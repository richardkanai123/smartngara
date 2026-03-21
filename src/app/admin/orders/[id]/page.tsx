import React from 'react'

const AdminOrdersIdPage = async({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return <div>AdminOrdersIdPage {id}</div>;
};
export default AdminOrdersIdPage;