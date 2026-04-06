'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionCardProps {
  href: string
  icon: React.ElementType
  label: string
  description: string
  variant?: 'primary' | 'secondary' | 'accent' | 'muted'
  index?: number
}

const variantIconColor = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  muted: 'text-muted-foreground',
}

const variantGlow = {
  primary: 'group-hover:shadow-[0_0_12px_var(--color-primary)]',
  secondary: 'group-hover:shadow-[0_0_12px_var(--color-secondary)]',
  accent: 'group-hover:shadow-[0_0_12px_var(--color-accent)]',
  muted: 'group-hover:shadow-[0_0_12px_var(--color-muted-foreground)]',
}

export function ActionCard({
  href,
  icon: Icon,
  label,
  description,
  variant = 'primary',
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="block"
    >
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-md border border-border/40 bg-card p-4',
          'transition-colors duration-150 ease-out',
          'hover:border-border hover:bg-muted/40 active:scale-[0.98]'
        )}
      >
        <div className={cn(
          'mb-3 flex size-9 items-center justify-center rounded-md bg-muted/60',
          'transition-all duration-200 ease-out group-hover:scale-105',
          variantGlow[variant]
        )}>
          <Icon className={cn('size-4 transition-colors duration-150', variantIconColor[variant])} />
        </div>

        <h3 className="mb-0.5 text-sm font-medium tracking-tight text-foreground">
          {label}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>

        <div className="mt-auto pt-3">
          <ArrowUpRight className="size-3.5 text-muted-foreground/40 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}

export interface QuickLinkButtonProps {
  href: string
  icon: React.ElementType
  label: string
  variant: 'primary' | 'secondary' | 'accent'
}

const quickVariantStyles = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent text-accent-foreground',
}

export function QuickLinkButton({
  href,
  icon: Icon,
  label,
  variant,
}: QuickLinkButtonProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          'group flex items-center gap-3 rounded-md px-3 py-2.5',
          'transition-colors duration-150 ease-out',
          'active:scale-[0.98]',
          quickVariantStyles[variant]
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
        <ArrowUpRight className="ml-auto size-3.5 opacity-0 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:opacity-60" />
      </div>
    </Link>
  )
}
