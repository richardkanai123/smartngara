import { Courier } from '@convex/schema'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { getCourierStatusColor, getVehicleIcon } from '@/lib/courier-helpers'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'

const CourierCard = ({ courier }: { courier: Courier }) => {
    const {name, email, phone, vehicle, status}=courier
    const VehicleIcon = getVehicleIcon(vehicle)
    const statusColor = getCourierStatusColor(status)
  return (
    <Card className={cn("border-l-4", statusColor)} style={{
      borderLeftColor: statusColor,
      borderLeftWidth: "4px",   
      borderLeftStyle: "solid",
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VehicleIcon className="size-4" />
          {name}
        </CardTitle>
        <Badge className={cn("text-xs", statusColor)}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <p>{email}</p>
        <p>{phone}</p>
      </CardContent>
    </Card>
  )
}

export default CourierCard