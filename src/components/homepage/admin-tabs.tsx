'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InvoiceIcon, MoneyIcon } from '@phosphor-icons/react'
import {
  Package,
  Package2Icon,
  PlusIcon,
  UsersRound,
  LayoutDashboard,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ActionCard, QuickLinkButton } from './card-link'

// Main navigation links for POS operations
const mainLinks = [
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: Package,
    description: 'View & manage all orders',
    color: 'from-primary/20 to-primary/5',
    glowColor: 'shadow-primary/30',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: UsersRound,
    description: 'Manage team & clients',
    color: 'from-chart-2/20 to-chart-2/5',
    glowColor: 'shadow-chart-2/30',
  },
  {
    label: 'Couriers',
    href: '/admin/couriers',
    icon: Package2Icon,
    description: 'Track deliveries',
    color: 'from-chart-3/20 to-chart-3/5',
    glowColor: 'shadow-chart-3/30',
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: MoneyIcon,
    description: 'Revenue & reports',
    color: 'from-chart-4/20 to-chart-4/5',
    glowColor: 'shadow-chart-4/30',
  },
  {
    label: 'Invoices',
    href: '/admin/invoices',
    icon: InvoiceIcon,
    description: 'Billing & payments',
    color: 'from-chart-5/20 to-chart-5/5',
    glowColor: 'shadow-chart-5/30',
  },
]

// Quick action links
const quickLinks = [
  {
    label: 'New Order',
    href: '/admin/orders/add',
    icon: PlusIcon,
    variant: 'primary' as const,
  },
  {
    label: 'Add Courier',
    href: '/admin/couriers/add',
    icon: PlusIcon,
    variant: 'secondary' as const,
  },
  {
    label: 'Add User',
    href: '/admin/users/add',
    icon: PlusIcon,
    variant: 'accent' as const,
  },
]

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="w-full max-w-7xl mx-auto p-1 sm:p-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Custom styled tabs list */}
        <TabsList className="mb-2 sm:mb-4 grid w-full grid-cols-3 gap-1 bg-muted rounded-lg border border-border shadow-sm p-1">
          <TabsTrigger
            value="dashboard"
            className="relative text-xs sm:text-sm lg:text-base font-medium overflow-hidden rounded-md data-[state=active]:bg-linear-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/30 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all py-1.5 sm:py-2 px-1 sm:px-2"
          >
            <LayoutDashboard className="mr-1 sm:mr-2 size-3.5 sm:size-4 lg:size-5" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dash</span>
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-indicator"
                layoutId="activeTabIndicator"
                className="absolute inset-0 -z-10 rounded-md bg-linear-to-r from-primary/20 to-transparent"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="quick-actions"
            className="relative text-xs sm:text-sm lg:text-base font-medium overflow-hidden rounded-md data-[state=active]:bg-linear-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/30 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all py-1.5 sm:py-2 px-1 sm:px-2"
          >
            <Zap className="mr-1 sm:mr-2 size-3.5 sm:size-4 lg:size-5" />
            <span className="hidden sm:inline">Quick Actions</span>
            <span className="sm:hidden">Quick</span>
            {activeTab === 'quick-actions' && (
              <motion.div
                key="quick-actions-indicator"
                layoutId="activeTabIndicator"
                className="absolute inset-0 -z-10 rounded-md bg-linear-to-r from-primary/20 to-transparent"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="relative text-xs sm:text-sm lg:text-base font-medium overflow-hidden rounded-md data-[state=active]:bg-linear-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/30 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all py-1.5 sm:py-2 px-1 sm:px-2"
          >
            <Package className="mr-1 sm:mr-2 size-3.5 sm:size-4 lg:size-5" />
            Overview
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-indicator"
                layoutId="activeTabIndicator"
                className="absolute inset-0 -z-10 rounded-md bg-linear-to-r from-primary/20 to-transparent"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <AnimatePresence mode="wait">
          <TabsContent value="dashboard" className="mt-0">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {mainLinks.map((link, index) => (
                  <ActionCard
                    key={link.label + link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    description={link.description}
                    color={link.color}
                    glowColor={link.glowColor}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="quick-actions" className="mt-0">
            <motion.div
              key="quick-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 bg-linear-to-br from-muted/50 to-muted/20 p-3 sm:p-4 lg:p-6 backdrop-blur-sm">
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-foreground">
                    Quick Actions
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Fast access to common operations
                  </p>
                </div>

                <div className="grid gap-2 sm:gap-3 lg:grid-cols-3">
                  {quickLinks.map((link) => (
                    <QuickLinkButton
                      key={link.label}
                      href={link.href}
                      icon={link.icon}
                      label={link.label}
                      variant={link.variant}
                    />
                  ))}
                </div>

                {/* Decorative element */}
                <div className="mt-4 sm:mt-6 lg:mt-8 flex items-center gap-2 sm:gap-4 border-t border-border/50 pt-3 sm:pt-4 lg:pt-6">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="size-4 sm:size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Pro Tip
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Use keyboard shortcuts to navigate faster. Press{' '}
                      <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] sm:text-xs">
                        Cmd+K
                      </kbd>{' '}
                      for quick search.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics/Overview Tab */}
          <TabsContent value="analytics" className="mt-0">
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 bg-linear-to-br from-muted/50 to-muted/20 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                    <Package className="size-6 sm:size-8 text-primary" />
                  </div>
                  <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold text-foreground">
                    Overview Coming Soon
                  </h3>
                  <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
                    Detailed analytics and reporting features are being
                    developed. Check back for updates on sales metrics, order
                    statistics, and performance insights.
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
