"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { TruckTrailerIcon, GridNineIcon } from "@phosphor-icons/react";
import {
  Package,
  PlusIcon,
  Building2,
  LayoutDashboard,
  Zap,
  Radio,
  UsersRound,
  ArrowRightCircle,
} from "lucide-react";
import { ActionCard, QuickLinkButton } from "./card-link";
import { FloatingDock, type DockItem } from "@/components/ui/floating-dock";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

/** Same routes as admin; worker UI excludes finances, invoices, workers, users. */
const mainLinks = [
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
    description: "Orders details",
    variant: "primary" as const,
  },
  {
    label: "Couriers",
    href: "/admin/couriers",
    icon: TruckTrailerIcon,
    description: "Couriers details",
    variant: "accent" as const,
  },
  {
    label: "Racks",
    href: "/admin/racks",
    icon: GridNineIcon,
    description: "Racks details",
    variant: "accent" as const,
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: Building2,
    description: "Clients details",
    variant: "muted" as const,
  },
];

const quickLinks = [
  {
    label: "New Order",
    href: "/admin/orders/add",
    icon: PlusIcon,
    variant: "primary" as const,
  },
  {
    label: "Add Courier",
    href: "/admin/couriers/add",
    icon: TruckTrailerIcon,
    variant: "accent" as const,
  },
  {
    label: "Add Client",
    href: "/admin/clients/add",
    icon: Building2,
    variant: "outline" as const,
  },
];

const tabVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function DutyStatusBadge({ status }: { status: "on-duty" | "off-duty" }) {
  if (status === "on-duty") {
    return (
      <Badge
        variant="outline"
        className="rounded-none border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-400"
      >
        On duty
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-none border-rose-500/30 bg-rose-500/10 font-medium text-rose-800 dark:text-rose-400"
    >
      Off duty
    </Badge>
  );
}

export default function WorkerTabs() {
  const worker = useQuery(api.workers.getCurrentWorkerDetails);
  const setDutyStatus = useMutation(api.workers.setCurrentWorkerDutyStatus);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dutyPending, setDutyPending] = useState(false);

  const onDuty = worker?.status === "on-duty";

  const handleDutyChange = async (next: "on-duty" | "off-duty") => {
    setDutyPending(true);
    try {
      await setDutyStatus({ status: next });
      toast.success(
        next === "on-duty" ? "You are now on duty." : "You are now off duty.",
      );
      if (next === "on-duty") setActiveTab("dashboard");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not update duty status.";
      toast.error(msg);
    } finally {
      setDutyPending(false);
    }
  };

  if (worker === undefined) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center p-8">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (worker === null) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6">
        <p className="text-muted-foreground text-sm">
          No worker profile is linked to your account. Contact an administrator.
        </p>
      </div>
    );
  }

  if (!onDuty) {
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
              <DutyStatusBadge status="off-duty" />
              {worker.name ? (
                <span className="text-muted-foreground text-sm font-medium">
                  {worker.name}
                </span>
              ) : null}
            </div>

            <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
              Start your shift to create and manage orders, clients, deliveries,
              and racks. While off duty, no workspace actions are available.
            </p>

            <Button
              type="button"
              className="w-full rounded-none sm:w-auto shadow-md transition-transform hover:scale-105 active:scale-95 px-8"
              disabled={dutyPending}
              onClick={() => handleDutyChange("on-duty")}
            >
              {dutyPending ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <Radio className="size-4 mr-2" />
              )}
              {dutyPending ? "Starting shift..." : "Go on duty"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dockItems: DockItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="text-foreground size-full" />,
      value: "dashboard",
      onClick: () => setActiveTab("dashboard"),
    },
    {
      title: "Quick Actions",
      icon: <Zap className="text-foreground size-full" />,
      value: "quick-actions",
      onClick: () => setActiveTab("quick-actions"),
    },
    {
      title: "Duty",
      icon: <Radio className="text-foreground size-full" />,
      value: "duty",
      onClick: () => setActiveTab("duty"),
    },
  ];

  return (
    <div className="mx-auto min-h-[65vh] w-full max-w-7xl p-4 pb-32 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {activeTab === "dashboard" && "Worker Dashboard"}
          {activeTab === "quick-actions" && "Quick Actions"}
          {activeTab === "duty" && "Duty Status"}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          {activeTab === "dashboard" &&
            "Orders, clients, deliveries, and racks — same shortcuts as admin, scoped for your shift."}
          {activeTab === "quick-actions" &&
            "Fast access to common tasks while you are on duty."}
          {activeTab === "duty" &&
            "Your current duty state. Go off duty when your shift ends."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
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

        {activeTab === "quick-actions" && (
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
                    Jump into new orders, couriers, or clients without returning
                    to the dashboard.
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
                    Press{" "}
                    <kbd className="rounded-none bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                      Cmd+K
                    </kbd>{" "}
                    to open the global command menu anywhere in the app.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "duty" && (
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
                    <DutyStatusBadge status="on-duty" />
                    <span className="text-foreground text-sm font-medium">
                      {worker.name}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                    You can create and manage orders, clients, couriers, and
                    racks while on duty. When you finish your shift, go off duty
                    — workspace actions are blocked until you start again.
                  </p>
                </div>

                <div className="relative z-10 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto rounded-none border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400"
                    disabled={dutyPending}
                    onClick={() => handleDutyChange("off-duty")}
                  >
                    {dutyPending ? <Spinner className="size-4 mr-2" /> : null}
                    {dutyPending ? "Going off duty..." : "Go off duty"}
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { label: "Active shift", value: "On duty", icon: Radio },
                { label: "Role", value: "Worker", icon: UsersRound },
                { label: "Workspace", value: "Orders & ops", icon: Package },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-none border border-border/40 bg-card p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-muted-foreground text-sm font-medium">
                      {kpi.label}
                    </p>
                    <kpi.icon className="text-muted-foreground/50 size-4" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {kpi.value}
                    </h3>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-none border border-border/40 bg-card flex flex-col items-center justify-center text-center p-12 lg:p-24 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

              <div className="relative z-10 flex max-w-md flex-col items-center">
                <div className="bg-primary/10 text-primary mb-6 flex size-16 items-center justify-center rounded-none shadow-inner">
                  <Radio className="size-8" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold tracking-tight">
                  Duty &amp; availability
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Finances, invoices, user admin, and the staff directory stay
                  on the admin dashboard only. Adjust routes later if your team
                  uses worker-specific pages.
                </p>
                <button
                  type="button"
                  className="bg-foreground text-background flex items-center gap-2 rounded-none px-5 py-2.5 text-sm font-medium shadow-md transition-transform hover:scale-105 active:scale-95"
                  onClick={() => setActiveTab("dashboard")}
                >
                  Open dashboard <ArrowRightCircle className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDock items={dockItems} activeValue={activeTab} />
    </div>
  );
}
