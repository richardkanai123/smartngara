'use client'

import { useState } from 'react'
import { InvoiceIcon, MoneyIcon, TruckTrailerIcon, GridNineIcon } from '@phosphor-icons/react'
import {
  Package,
  PlusIcon,
  UsersRound,
  LayoutDashboard,
  Zap,
  Users2
} from 'lucide-react'
import { ActionCard, QuickLinkButton } from './card-link'
import { FloatingDock, type DockItem } from '@/components/ui/floating-dock'

const mainLinks = [
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: Package,
    description: 'View & manage all orders',
    variant: 'primary' as const,
  },
  
  {
    label: 'Couriers',
    href: '/admin/couriers',
    icon: TruckTrailerIcon,
    description: 'Track deliveries',
    variant: 'accent' as const,
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: MoneyIcon,
    description: 'Revenue & reports',
    variant: 'muted' as const,
  },
  {
    label: 'Invoices',
    href: '/admin/invoices',
    icon: InvoiceIcon,
    description: 'Billing & payments',
    variant: 'primary' as const,
  },
  {
    label: 'Racks',
    href: '/admin/racks',
    icon: GridNineIcon,
    description: 'Manage racks',
    variant: 'accent' as const,
  },
  {
    label: 'Workers',
    href: '/admin/workers',
    icon: Users2,
    description: 'Manage workers',
    variant: 'muted' as const,
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: UsersRound,
    description: 'Manage clients',
    variant: 'muted' as const,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: UsersRound,
    description: 'Manage team & clients',
    variant: 'secondary' as const,
  },
]

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

  const dockItems: DockItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="size-full text-foreground" />,
      value: 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      title: 'Quick Actions',
      icon: <Zap className="size-full text-foreground" />,
      value: 'quick-actions',
      onClick: () => setActiveTab('quick-actions'),
    },
    {
      title: 'Overview',
      icon: <Package className="size-full text-foreground" />,
      value: 'analytics',
      onClick: () => setActiveTab('analytics'),
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto p-1 sm:p-2 min-h-[50vh]">
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {mainLinks.map((link) => (
            <ActionCard
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              description={link.description}
              variant={link.variant}
            />
          ))}
        </div>
      )}

      {activeTab === 'quick-actions' && (
        <div className="rounded-md border border-border/50 bg-card p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Quick Actions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Fast access to common operations
            </p>
          </div>

          <div className="grid gap-2 sm:gap-2.5 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <QuickLinkButton
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                variant={link.variant}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted/60">
              <Zap className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Pro Tip</p>
              <p className="text-[11px] text-muted-foreground">
                Press{' '}
                <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  Cmd+K
                </kbd>{' '}
                for quick search.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="rounded-md border border-border/50 bg-card p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-md bg-muted/60">
              <Package className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              Overview Coming Soon
            </h3>
            <p className="max-w-sm text-xs sm:text-sm text-muted-foreground">
              Detailed analytics and reporting features are being developed.
              Check back for sales metrics, order statistics, and performance insights.
            </p>
          </div>
        </div>
      )}

      <FloatingDock items={dockItems} activeValue={activeTab} />
    </div>
  )
}
