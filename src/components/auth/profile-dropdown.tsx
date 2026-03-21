'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import Link from 'next/link'
import LogOutBtn from './log-out-btn'
import { UserIcon } from 'lucide-react'

const ProfileDropDown = ({user}:{user: {
    image: string | null
    username: string | null
    email: string | null
}}) => {
    const {image,username}=user
  return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Image src={image || '/rounded.png'} alt={username || 'User'} width={32} height={32} className='rounded-full' />
            </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem>
                <Link href="/profile" className='flex items-center gap-2'>
                    <UserIcon className='size-4' />
                    <span>{username}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <LogOutBtn/>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>     
    )
}

export default ProfileDropDown