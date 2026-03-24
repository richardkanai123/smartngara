'use client'
import { BackendStatus } from "../backend-status"
import { ModeToggle } from "../theme-toggler"
import { Suspense } from "react"
import { Spinner } from "../ui/spinner"


const Footer = () => {
  return (
    <div className='flex justify-between items-center p-4 border-t fixed bottom-0 left-0 right-0 z-10 backdrop-blur-lg'>
        <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>© 2026 Smart Ng'ara. All rights reserved.</span>
        </div>

        <div className='flex items-center gap-2'>
            <ModeToggle />
            <Suspense fallback={<Spinner className='size-4' />}>
          <BackendStatus />
            </Suspense>
        </div>
    </div>
  )
}

export default Footer