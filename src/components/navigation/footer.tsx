'use client'
import { BackendStatus } from "../backend-status"
import { ModeToggle } from "../theme-toggler"
import { Suspense } from "react"
import { Spinner } from "../ui/spinner"


const Footer = () => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 flex min-h-[5rem] items-center justify-between border-t bg-background/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] backdrop-blur-lg"
    >
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