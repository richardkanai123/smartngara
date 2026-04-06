// Courier Filter component, used to filter couriers by status, vehicle, etc. 
// Stores the filter state in the URL

'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FilterIcon, XIcon } from 'lucide-react'
import { useTransition } from 'react'
import { Spinner } from '../ui/spinner'

const CourierFilter = () => {

    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const status = searchParams.get('status') || 'all'
    const vehicle = searchParams.get('vehicle') || 'all'
    const router = useRouter()
    const currentPath = usePathname()


    const handleStatusChange = (value: string) => {
        startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.set('status', value)
        router.push(`${currentPath}?${params.toString()}`)
        })
    }
    const handleVehicleChange = (value: string) => {
        startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.set('vehicle', value)
        router.push(`${currentPath}?${params.toString()}`)
        })
    }

    const handleClearFilters = () => {
        startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.delete('status')
        params.delete('vehicle')
        router.push(`${currentPath}?${params.toString()}`)
        })
    }

  return (
    <div className="w-full flex items-center gap-2">
        <Select value={status || 'all'} disabled={isPending} onValueChange={(value) => handleStatusChange(value || '')}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="on-delivery">On Delivery</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
            </SelectContent>
        </Select>
        <Select value={vehicle || 'all'} disabled={isPending} onValueChange={(value) => handleVehicleChange(value || '')}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by vehicle" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
            </SelectContent>
        </Select>
        {isPending && <Spinner className="size-4 animate-spin" />}
        <Button onClick={handleClearFilters} disabled={isPending || (status === 'all' && vehicle === 'all')}>
            {isPending ? <Spinner className="size-4 animate-spin" /> : <FilterIcon className="size-4" />}
            <XIcon className="size-4" />
            Filter
        </Button>
    </div>
  )
}

export default CourierFilter