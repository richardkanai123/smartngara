import AdminHeader from "@/components/navigation/admin-header"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-full h-full'>
        <AdminHeader />
        <div className="w-full h-full p-2">
            {children}
        </div>
    </div>
  )
}

export default AdminLayout