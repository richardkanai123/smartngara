// Courier Filter component, used to filter couriers by status, vehicle, etc. 
// Stores the filter state in the URL

'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from '../ui/select'
import { CaretDownIcon } from '@phosphor-icons/react'
import { Button } from '../ui/button'
import { FilterIcon, XIcon } from 'lucide-react'

const CourierFilter = () => {
  return (
    <div className="w-full flex items-center gap-2">
        <Select>
            <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
                <CaretDownIcon className="size-4" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="on-delivery">On Delivery</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
            </SelectContent>
        </Select>
        <Select>
            <SelectTrigger>
                <SelectValue placeholder="Filter by vehicle" />
                <CaretDownIcon className="size-4" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
            </SelectContent>
        </Select>
        <Button>
            <FilterIcon className="size-4" />
            <XIcon className="size-4" />
            Filter
        </Button>
    </div>
  )
}

export default CourierFilter