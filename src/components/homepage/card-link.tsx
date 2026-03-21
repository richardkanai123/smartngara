'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionCardProps {
  href: string
  icon: React.ElementType
  label: string
  description: string
  color: string
  glowColor: string
  index: number
}

export function ActionCard({
  href,
  icon: Icon,
  label,
  description,
  color,
  glowColor,
  index,
}: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Link href={href} className="block h-full">
        <Card
          className={cn(
            'group relative h-full overflow-hidden border-0 bg-linear-to-br p-3 sm:p-4 lg:p-6 transition-all duration-500',
            'cursor-pointer backdrop-blur-sm',
            'hover:scale-[1.02] hover:shadow-xl',
            color,
            isHovered && cn('shadow-lg', glowColor)
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated background glow */}
          <motion.div
            className={cn(
              'absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500',
              color.replace('/20', '/30').replace('/5', '/10')
            )}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Neon border glow on hover */}
          <motion.div
            className="absolute inset-0 rounded-none border border-primary/0 transition-all duration-500"
            animate={{
              borderColor: isHovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)',
              boxShadow: isHovered
                ? 'inset 0 0 20px rgba(0,0,0,0.05), 0 0 30px rgba(0,0,0,0.1)'
                : 'inset 0 0 0px rgba(0,0,0,0), 0 0 0px rgba(0,0,0,0)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Icon with animation */}
            <motion.div
              className="mb-2 sm:mb-3 lg:mb-4 flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon
                className={cn(
                  'size-4 sm:size-5 lg:size-6 transition-colors duration-300',
                  'text-foreground/70 group-hover:text-primary'
                )}
              />
            </motion.div>

            {/* Label */}
            <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {label}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>

            {/* Arrow indicator */}
            <motion.div
              className="mt-auto pt-2 sm:pt-3 lg:pt-4"
              animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="size-3 sm:size-4 text-primary" />
            </motion.div>
          </div>

          {/* Corner accent */}
          <motion.div
            className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 size-16 sm:size-20 lg:size-24 rounded-full bg-primary/10 blur-2xl"
            animate={{
              scale: isHovered ? 1.5 : 1,
              opacity: isHovered ? 0.6 : 0.3,
            }}
            transition={{ duration: 0.5 }}
          />
        </Card>
      </Link>
    </motion.div>
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
    <Link href={href} className="block">
      <motion.div
        className={cn(
          'group flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 transition-all duration-300',
          'backdrop-blur-sm',
          variantStyles[variant]
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? 90 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon className="size-3.5 sm:size-4" />
        </motion.div>
        <span className="font-medium text-xs sm:text-sm">{label}</span>
        <motion.div
          className="ml-auto"
          animate={{ x: isHovered ? 2 : 0, opacity: isHovered ? 1 : 0 }}
        >
          <ArrowUpRight className="size-3.5 sm:size-4" />
        </motion.div>
      </motion.div>
    </Link>
  )
}
