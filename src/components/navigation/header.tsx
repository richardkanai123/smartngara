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
const userButton = data?.user ? <ProfileDropDown user={user} /> : <Link className="text-sm text-primary underline" href="/login">Login</Link>
const isError= error && <ShieldWarningIcon className="size-4 text-destructive" />

  return (
    <div className="fixed top-0 right-0 left-0 z-10 flex min-h-[4.5rem] items-center justify-between border-b bg-background/80 px-4 pt-[env(safe-area-inset-top,0px)] pb-4 backdrop-blur-lg">
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