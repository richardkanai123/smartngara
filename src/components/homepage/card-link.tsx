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
}

const variantStyles = {
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    borderHover: 'hover:border-primary/50',
    bgHover: 'hover:bg-primary/5',
    glow: 'group-hover:shadow-[0_0_15px_var(--color-primary)]/20',
  },
  secondary: {
    iconBg: 'bg-secondary text-secondary-foreground',
    borderHover: 'hover:border-secondary/50',
    bgHover: 'hover:bg-secondary/5',
    glow: 'group-hover:shadow-[0_0_15px_var(--color-secondary)]/20',
  },
  accent: {
    iconBg: 'bg-accent/10 text-accent',
    borderHover: 'hover:border-accent/50',
    bgHover: 'hover:bg-accent/5',
    glow: 'group-hover:shadow-[0_0_15px_var(--color-accent)]/20',
  },
  muted: {
    iconBg: 'bg-muted text-muted-foreground',
    borderHover: 'hover:border-muted-foreground/30',
    bgHover: 'hover:bg-muted/30',
    glow: 'group-hover:shadow-[0_0_15px_var(--color-muted)]/20',
  },
}

export function ActionCard({
  href,
  icon: Icon,
  label,
  description,
  variant = 'primary',
}: ActionCardProps) {
  const styles = variantStyles[variant]

  return (
    <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-none">
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-none border border-border/40 bg-card p-5',
          'transition-all duration-300 ease-out',
          'active:scale-[0.98]',
          styles.borderHover,
          styles.bgHover
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-none',
              'transition-transform duration-300 ease-out group-hover:scale-110',
              styles.iconBg,
              styles.glow
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="rounded-none bg-muted/50 p-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-background">
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
        </div>

        <h3 className="mb-1 text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground">
          {label}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  )
}

export interface QuickLinkButtonProps {
  href: string
  icon: React.ElementType
  label: string
  variant: 'primary' | 'secondary' | 'accent' | 'outline'
}

const quickVariantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm',
  outline: 'border border-border/50 bg-background hover:bg-muted text-foreground',
}

export function QuickLinkButton({
  href,
  icon: Icon,
  label,
  variant,
}: QuickLinkButtonProps) {
  return (
    <Link href={href} className="block outline-none rounded-none focus-visible:ring-2 focus-visible:ring-ring">
      <div
        className={cn(
          'group flex items-center gap-3 rounded-none px-4 py-3',
          'transition-all duration-200 ease-out',
          'active:scale-[0.98]',
          quickVariantStyles[variant]
        )}
      >
        <Icon className={cn("size-4 shrink-0 transition-transform duration-200 group-hover:scale-110", variant === 'outline' ? 'text-muted-foreground' : '')} />
        <span className="text-sm font-medium">{label}</span>
        <ArrowUpRight className="ml-auto size-4 opacity-40 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      </div>
    </Link>
  )
}