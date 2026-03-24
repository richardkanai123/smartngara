'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
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

export function ActionCard({
  href,
  icon: Icon,
  label,
  description,
  variant = 'primary',
  index = 0,
}: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const variantStyles = {
    primary: 'from-primary/10 via-background to-secondary/5 hover:from-primary/20',
    secondary: 'from-secondary/20 via-background to-accent/10 hover:from-secondary/30',
    accent: 'from-accent/20 via-background to-primary/10 hover:from-accent/30',
    muted: 'from-muted/30 via-background to-muted/10 hover:from-muted/40',
  }

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards',
        index > 0 && `delay-[${index * 80}ms]`
      )}
      style={{ animationDelay: index > 0 ? `${index * 80}ms` : undefined }}
    >
      <Link 
        href={href} 
        className="block h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={cn(
            'group relative h-full overflow-hidden border-0 bg-linear-to-br p-3 sm:p-4 lg:p-6',
            'cursor-pointer backdrop-blur-sm transition-all duration-500 ease-out',
            'hover:scale-[1.02] hover:shadow-xl',
            variantStyles[variant],
            isHovered && 'shadow-lg ring-1 ring-primary/20'
          )}
        >
          {/* Animated background glow on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500',
              isHovered && 'opacity-100',
              variant === 'primary' && 'from-primary/20 to-transparent',
              variant === 'secondary' && 'from-secondary/30 to-transparent',
              variant === 'accent' && 'from-accent/30 to-transparent',
              variant === 'muted' && 'from-muted/50 to-transparent'
            )}
          />

          {/* Subtle border glow on hover */}
          <div
            className={cn(
              'absolute inset-0 rounded-none border transition-all duration-500',
              isHovered ? 'border-primary/20' : 'border-transparent'
            )}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Icon with hover animation */}
            <div
              className={cn(
                'mb-2 sm:mb-3 lg:mb-4 flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12',
                'items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm',
                'transition-transform duration-300 ease-out',
                isHovered && 'scale-110 rotate-3'
              )}
            >
              <Icon
                className={cn(
                  'size-4 sm:size-5 lg:size-6 transition-colors duration-300',
                  'text-foreground/70 group-hover:text-primary'
                )}
              />
            </div>

            {/* Label */}
            <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {label}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>

            {/* Arrow indicator */}
            <div
              className={cn(
                'mt-auto pt-2 sm:pt-3 lg:pt-4 transition-all duration-200',
                isHovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-50'
              )}
            >
              <ArrowUpRight className="size-3 sm:size-4 text-primary" />
            </div>
          </div>

          {/* Corner accent */}
          <div
            className={cn(
              'absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8',
              'size-16 sm:size-20 lg:size-24 rounded-full bg-primary/10 blur-2xl',
              'transition-all duration-500',
              isHovered ? 'scale-150 opacity-60' : 'scale-100 opacity-30'
            )}
          />
        </Card>
      </Link>
    </div>
  )
}

// Quick link button with distinct styling
export interface QuickLinkButtonProps {
  href: string
  icon: React.ElementType
  label: string
  variant: 'primary' | 'secondary' | 'accent'
}

export function QuickLinkButton({
  href,
  icon: Icon,
  label,
  variant,
}: QuickLinkButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:shadow-primary/40',
    secondary: 'bg-secondary text-secondary-foreground hover:shadow-secondary/40',
    accent: 'bg-accent text-accent-foreground hover:shadow-accent/40',
  }

  return (
    <Link 
      href={href} 
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'group flex items-center gap-2 sm:gap-3 rounded-lg',
          'px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3',
          'backdrop-blur-sm transition-all duration-300 ease-out',
          'hover:scale-[1.02] active:scale-[0.98]',
          variantStyles[variant]
        )}
      >
        <div
          className={cn(
            'transition-transform duration-300 ease-out',
            isHovered && 'scale-120 rotate-90'
          )}
        >
          <Icon className="size-3.5 sm:size-4" />
        </div>
        <span className="font-medium text-xs sm:text-sm">{label}</span>
        <div
          className={cn(
            'ml-auto transition-all duration-200',
            isHovered ? 'translate-x-0.5 opacity-100' : 'translate-x-0 opacity-0'
          )}
        >
          <ArrowUpRight className="size-3.5 sm:size-4" />
        </div>
      </div>
    </Link>
  )
}
