'use client'
import Image from "next/image"
import { ModeToggle } from "@/components/theme-toggler"

const Header = () => {
  return (
    <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
            <Image className="invert dark:invert-0" src="/vercel.svg" alt="logo" width={30} height={30} />
        </div>
        <div className="flex items-center gap-2">
            <ModeToggle />
        </div>
    </div>
  )
}

export default Header