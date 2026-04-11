'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InvoiceIcon, MoneyIcon, TruckTrailerIcon, GridNineIcon } from '@phosphor-icons/react'
import {
  Package,
  PlusIcon,
  UsersRound,
  LayoutDashboard,
  Zap,
  TrendingUp,
  CreditCard,
  ArrowRightCircle
} from 'lucide-react'
import { FaUsersCog } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { GrUserWorker } from 'react-icons/gr';
import { ActionCard, QuickLinkButton } from './card-link'
import { FloatingDock, type DockItem } from '@/components/ui/floating-dock'
const mainLinks = [
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: Package,
    description: 'Track and manage all customer orders in real-time.',
    variant: 'primary' as const,
  },
  {
    label: 'Couriers',
    href: '/admin/couriers',
    icon: TruckTrailerIcon,
    description: 'Monitor active deliveries and courier performance.',
    variant: 'accent' as const,
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: MoneyIcon,
    description: 'Revenue, expenses, and comprehensive financial reports.',
    variant: 'secondary' as const,
  },
  {
    label: 'Invoices',
    href: '/admin/invoices',
    icon: InvoiceIcon,
    description: 'Manage billing, overdue payments, and receipts.',
    variant: 'primary' as const,
  },
  {
    label: 'Racks',
    href: '/admin/racks',
    icon: GridNineIcon,
    description: 'Organize warehouse racks and storage utilization.',
    variant: 'accent' as const,
  },
  {
    label: 'Workers',
    href: '/admin/workers',
    icon: GrUserWorker,
    description: 'Manage staff, shifts, and team assignments.',
    variant: 'muted' as const,
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: FaUsers,
    description: 'View client profiles and their order history.',
    variant: 'muted' as const,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: FaUsersCog,
    description: 'Manage system access and team permissions.',
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
    icon: TruckTrailerIcon,
    variant: 'accent' as const,
  },
  {
    label: 'Add User',
    href: '/admin/users/add',
    icon: UsersRound,
    variant: 'outline' as const,
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
      icon: <TrendingUp className="size-full text-foreground" />,
      value: 'analytics',
      onClick: () => setActiveTab('analytics'),
    },
  ]

  const tabVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.4, staggerChildren: 0.05 } 
    },
    exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[65vh] pb-32">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {activeTab === 'dashboard' && 'Admin Dashboard'}
          {activeTab === 'quick-actions' && 'Quick Actions'}
          {activeTab === 'analytics' && 'Analytics Overview'}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
          {activeTab === 'dashboard' && 'Manage your logistics, operations, and team from a single unified view.'}
          {activeTab === 'quick-actions' && 'Fast access to the most frequently used operations in your workspace.'}
          {activeTab === 'analytics' && 'Detailed insights into your business performance and growth metrics.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {mainLinks.map((link) => (
              <motion.div key={link.href} variants={itemVariants}>
                <ActionCard
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  description={link.description}
                  variant={link.variant}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'quick-actions' && (
          <motion.div
            key="quick-actions"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div variants={itemVariants} className="col-span-full mb-2">
              <div className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 size-48 rounded-full bg-primary/5 blur-3xl" />
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 mb-2">
                    <Zap className="size-5 text-primary" />
                    Essential Tools
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Jump straight into creating new records or managing immediate tasks without navigating through the dashboard.
                  </p>
                </div>
                
                <div className="flex flex-col w-full sm:w-auto min-w-[200px] gap-3 relative z-10">
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
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-full">
              <div className="flex items-center gap-4 rounded-none border border-primary/20 bg-primary/5 p-4 text-primary">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10">
                  <Zap className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Keyboard Shortcuts</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    Press <kbd className="rounded-none bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold">Cmd+K</kbd> to open the global command menu anywhere in the app.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Dummy KPI Cards */}
              {[
                { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: CreditCard },
                { label: 'Active Orders', value: '356', change: '+12.4%', icon: Package },
                { label: 'Platform Users', value: '1,204', change: '+4.3%', icon: UsersRound }
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <kpi.icon className="size-4 text-muted-foreground/50" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
                    <p className="text-xs text-emerald-500 font-medium mt-1">{kpi.change} from last month</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-none border border-border/40 bg-card flex flex-col items-center justify-center text-center p-12 lg:p-24 shadow-sm relative overflow-hidden">
              {/* Decorative grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
              
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="mb-6 flex size-16 items-center justify-center rounded-none bg-primary/10 text-primary shadow-inner">
                  <TrendingUp className="size-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                  Comprehensive Analytics Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  We are building powerful charts and reporting tools to help you track sales metrics, order statistics, and operational performance insights.
                </p>
                <button type="button" className="flex items-center gap-2 rounded-none bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95 shadow-md">
                  Notify Me When Ready <ArrowRightCircle className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrapping FloatingDock to position it perfectly within the UI bounds while remaining fixed relative to viewport usually */}
      <FloatingDock items={dockItems} activeValue={activeTab} />
    </div>
  )
}