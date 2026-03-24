'use client'
import Image from "next/image"
import { ModeToggle } from "@/components/theme-toggler"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import ProfileDropDown from "../auth/profile-dropdown"
import { ShieldWarningIcon } from "@phosphor-icons/react"


const Header = () => {
  const {data, error, isPending, isRefetching} = authClient.useSession()

  const  user = {
    image: data?.user?.image || null,
    username: data?.user?.username || null,
    email: data?.user?.email || null,
  }
const loading = isPending || isRefetching && <Spinner className="size-4" />
const userButton = data?.user ? <ProfileDropDown user={user} /> : null
const isError= error && <ShieldWarningIcon className="size-4 text-destructive" />

  return (
    <div className="flex justify-between items-center p-4 border-b fixed top-0 left-0 right-0 z-10 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image className=" " src="/rounded.png" alt="logo" width={30} height={30} />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isError}
          {loading}
          {userButton}
            <ModeToggle />
        </div>
    </div>
  )
}

export default Header