'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TruckTrailerIcon, MoneyIcon } from '@phosphor-icons/react'
import {
  Package,
  LayoutDashboard,
  Zap,
  Radio,
  ArrowRightCircle,
  MapPin,
  Banknote
} from 'lucide-react'
import { ActionCard, QuickLinkButton } from './card-link'
import { FloatingDock, type DockItem } from '@/components/ui/floating-dock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const mainLinks = [
  {
    label: 'My Deliveries',
    href: '/courier/deliveries',
    icon: Package,
    description: 'View active and past deliveries assigned to you.',
    variant: 'primary' as const,
  },
  {
    label: 'Earnings',
    href: '/courier/finances',
    icon: MoneyIcon,
    description: 'Track your delivery fees and payout history.',
    variant: 'accent' as const,
  },
  {
    label: 'Live Map',
    href: '/courier/map',
    icon: MapPin,
    description: 'Navigate to your next drop-off location.',
    variant: 'secondary' as const,
  },
]

const quickLinks = [
  {
    label: 'Active Delivery',
    href: '/courier/deliveries/active',
    icon: TruckTrailerIcon,
    variant: 'primary' as const,
  },
  {
    label: 'Wallet',
    href: '/courier/finances/wallet',
    icon: Banknote,
    variant: 'accent' as const,
  },
]

const tabVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function CourierStatusBadge({ status }: { status: 'available' | 'off-duty' }) {
  if (status === 'available') {
    return (
      <Badge
        variant="outline"
        className="rounded-none border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-400"
      >
        Available for orders
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="rounded-none border-rose-500/30 bg-rose-500/10 font-medium text-rose-800 dark:text-rose-400"
    >
      Off duty
    </Badge>
  )
}

export default function CourierTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dutyStatus, setDutyStatus] = useState<'available' | 'off-duty'>('off-duty')
  const [dutyPending, setDutyPending] = useState(false)

  const handleDutyChange = async (next: 'available' | 'off-duty') => {
    setDutyPending(true)
    // Simulate API call for UI
    setTimeout(() => {
      setDutyStatus(next)
      toast.success(next === 'available' ? 'You are now online and available for orders.' : 'You are now off duty.')
      if (next === 'available') setActiveTab('dashboard')
      setDutyPending(false)
    }, 800)
  }

  if (dutyStatus === 'off-duty') {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-7xl flex-col items-center justify-center p-4 pb-32 sm:p-6 lg:p-8">
        <div className="rounded-none border border-border/40 bg-card w-full max-w-md p-12 shadow-sm relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-none bg-primary/10 text-primary shadow-inner">
              <Radio className="size-8" />
            </div>
            
            <h1 className="mb-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              You&apos;re off duty
            </h1>
            
            <div className="mb-6 flex flex-wrap justify-center items-center gap-3">
              <CourierStatusBadge status="off-duty" />
              <span className="text-muted-foreground text-sm font-medium">Courier</span>
            </div>

            <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
              Go online to start receiving delivery assignments. While off duty, you will not receive any new orders to deliver.
            </p>
            
            <Button
              type="button"
              className="w-full rounded-none sm:w-auto shadow-md transition-transform hover:scale-105 active:scale-95 px-8"
              disabled={dutyPending}
              onClick={() => handleDutyChange('available')}
            >
              {dutyPending ? <Spinner className="size-4 mr-2" /> : <Radio className="size-4 mr-2" />}
              {dutyPending ? 'Going online...' : 'Go online'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const dockItems: DockItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="text-foreground size-full" />,
      value: 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      title: 'Earnings',
      icon: <Banknote className="text-foreground size-full" />,
      value: 'finances',
      onClick: () => setActiveTab('finances'),
    },
    {
      title: 'Status',
      icon: <Radio className="text-foreground size-full" />,
      value: 'duty',
      onClick: () => setActiveTab('duty'),
    },
  ]

  return (
    <div className="mx-auto min-h-[65vh] w-full max-w-7xl p-4 pb-32 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {activeTab === 'dashboard' && 'Courier Dashboard'}
          {activeTab === 'finances' && 'My Earnings'}
          {activeTab === 'duty' && 'Courier Status'}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          {activeTab === 'dashboard' && 'View your assigned deliveries and navigate to your next drop-off.'}
          {activeTab === 'finances' && 'Track the delivery fees you have earned and check your payout history.'}
          {activeTab === 'duty' && 'Manage your availability for incoming delivery assignments.'}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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

            <motion.div variants={itemVariants} className="mt-4">
              <div className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 -mt-12 -mr-12 size-48 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2 mb-2">
                    <Zap className="size-5 text-primary" />
                    Quick Actions
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Jump right into your current delivery or check your wallet balance.
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
                { label: 'Today\'s Earnings', value: '$85.50', icon: Banknote },
                { label: 'This Week', value: '$420.00', icon: MoneyIcon },
                { label: 'Completed Deliveries', value: '42', icon: Package },
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
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

              <div className="relative z-10 flex max-w-md flex-col items-center">
                <div className="bg-primary/10 text-primary mb-6 flex size-16 items-center justify-center rounded-none shadow-inner">
                  <Banknote className="size-8" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold tracking-tight">
                  Detailed Payouts Coming Soon
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  We are working on a comprehensive view of your payment history, tips, and direct deposit settings.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'duty' && (
          <motion.div
            key="duty"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants}>
              <div className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 -mt-12 -mr-12 size-48 rounded-full bg-primary/5 blur-3xl" />
                
                <div className="space-y-2 relative z-10">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Current status
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <CourierStatusBadge status="available" />
                  </div>
                  <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                    You are currently online and will receive delivery assignments. When you are done for the day, make sure to go off duty so you don't receive new orders.
                  </p>
                </div>
                
                <div className="relative z-10 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto rounded-none border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400"
                    disabled={dutyPending}
                    onClick={() => handleDutyChange('off-duty')}
                  >
                    {dutyPending ? <Spinner className="size-4 mr-2" /> : null}
                    {dutyPending ? 'Going off duty...' : 'Go off duty'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDock items={dockItems} activeValue={activeTab} />
    </div>
  )
}
