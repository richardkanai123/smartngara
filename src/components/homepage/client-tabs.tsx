'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InvoiceIcon, MoneyIcon } from '@phosphor-icons/react'
import {
  Package,
  PlusIcon,
  UsersRound,
  LayoutDashboard,
  Zap,
  Bell,
  TrendingUp,
  CreditCard,
  ArrowRightCircle,
} from 'lucide-react'
import { ActionCard, QuickLinkButton } from './card-link'
import { FloatingDock, type DockItem } from '@/components/ui/floating-dock'

const mainLinks = [
  {
    label: 'My Orders',
    href: '/client/orders',
    icon: Package,
    description: 'Track the status of your current and past orders.',
    variant: 'primary' as const,
  },
  {
    label: 'Invoices',
    href: '/client/invoices',
    icon: InvoiceIcon,
    description: 'View billing history and download receipts.',
    variant: 'accent' as const,
  },
  {
    label: 'Finances',
    href: '/client/finances',
    icon: MoneyIcon,
    description: 'Track payments made and outstanding balances.',
    variant: 'secondary' as const,
  },
  {
    label: 'Profile',
    href: '/client/profile',
    icon: UsersRound,
    description: 'Manage your personal information and addresses.',
    variant: 'muted' as const,
  },
]

const quickLinks = [
  {
    label: 'Request Order',
    href: '/client/orders/add',
    icon: PlusIcon,
    variant: 'primary' as const,
  },
  {
    label: 'Pay Invoice',
    href: '/client/invoices/pay',
    icon: CreditCard,
    variant: 'accent' as const,
  },
]

export default function ClientTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const dockItems: DockItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="size-full text-foreground" />,
      value: 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      title: 'Finances',
      icon: <CreditCard className="size-full text-foreground" />,
      value: 'finances',
      onClick: () => setActiveTab('finances'),
    },
    {
      title: 'Notifications',
      icon: <Bell className="size-full text-foreground" />,
      value: 'notifications',
      onClick: () => setActiveTab('notifications'),
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
          {activeTab === 'dashboard' && 'Client Portal'}
          {activeTab === 'finances' && 'Financial Overview'}
          {activeTab === 'notifications' && 'Your Notifications'}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
          {activeTab === 'dashboard' && 'Manage your orders, profile, and billing all in one place.'}
          {activeTab === 'finances' && 'Track your payments, due invoices, and overall account balance.'}
          {activeTab === 'notifications' && 'Stay updated on your order statuses and account alerts.'}
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
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            </div>

            <motion.div variants={itemVariants}>
              <div className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 size-48 rounded-full bg-primary/5 blur-3xl" />
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 mb-2">
                    <Zap className="size-5 text-primary" />
                    Quick Actions
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start a new delivery request or manage your pending invoices instantly.
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
          </motion.div>
        )}

        {activeTab === 'finances' && (
          <motion.div
            key="finances"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Outstanding Balance', value: '$120.00', icon: CreditCard },
                { label: 'Total Paid', value: '$1,450.00', icon: MoneyIcon },
                { label: 'Pending Invoices', value: '2', icon: InvoiceIcon },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col justify-between">
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                    <kpi.icon className="text-muted-foreground/50 size-4" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
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
                  Detailed Billing History
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Easily track past payments, view statements, and manage your payment methods in our upcoming update.
                </p>
                <button type="button" className="flex items-center gap-2 rounded-none bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95 shadow-md">
                  View Latest Invoice <ArrowRightCircle className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="rounded-none border border-border/40 bg-card flex flex-col items-center justify-center text-center p-12 lg:p-24 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
              
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="mb-6 flex size-16 items-center justify-center rounded-none bg-muted text-muted-foreground shadow-inner">
                  <Bell className="size-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                  You're all caught up!
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  You don't have any unread notifications right now. Order updates and alerts will appear here.
                </p>
                <button type="button" className="flex items-center gap-2 rounded-none border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-transform hover:scale-105 active:scale-95 shadow-sm hover:bg-muted">
                  Notification Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDock items={dockItems} activeValue={activeTab} />
    </div>
  )
}
