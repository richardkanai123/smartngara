import type { Courier } from '@convex/schema'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { getCourierStatusColor, getVehicleIcon } from '@/lib/courier-helpers'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Mail, Phone } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import CourierSheetDetails from './courier-sheet-details'
import { Separator } from '../ui/separator'
import { Suspense } from 'react'

const CourierCard = ({ courier }: { courier: Courier }) => {
    const { name, email, phone, vehicle, status } = courier
    const VehicleIcon = getVehicleIcon(vehicle)
    const statusColor = getCourierStatusColor(status)
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    return (
        <Sheet>
            <SheetTrigger
                className={cn(
                    "w-full text-left bg-card border rounded-md cursor-pointer",
                    "transition-colors duration-150 ease-out",
                    "hover:bg-muted/40 active:scale-[0.98]",
                    "border-l-2",
                    statusColor.border
                )}
            >
                <div className="flex items-center gap-3 p-4">
                    <Avatar className="size-9 shrink-0 rounded-full ring-1 ring-border">
                        <AvatarFallback className="text-xs font-medium text-muted-foreground bg-muted/50">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-medium text-foreground truncate">
                                {name}
                            </h3>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "shrink-0 capitalize text-[10px] font-medium h-5 bg-background",
                                    statusColor.text,
                                    statusColor.border
                                )}
                            >
                                {status.replace('-', ' ')}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                            <VehicleIcon className="size-3" />
                            <span className="capitalize">{vehicle}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4 px-4 py-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 min-w-0">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate">{email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                        <Phone className="size-3 shrink-0" />
                        <span>{phone}</span>
                    </span>
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-2xl font-semibold tracking-tight">
                        {name}
                    </SheetTitle>
                </SheetHeader>
                <Suspense fallback={<div>Loading courier details...</div>}>
                    <CourierSheetDetails courier={courier} />
                </Suspense>
            </SheetContent>
        </Sheet>
    )
}

export default CourierCard
