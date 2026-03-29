"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowArcLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

const AdminHeader = () => {
    const pathname = usePathname()
    const isAdminPage = () => pathname.startsWith("/admin")
    const currentPage = () => pathname.split("/").pop()
    const pageTitle = () => currentPage()?.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase())

    const router = useRouter()
    if (!isAdminPage()) return null

    const breadcrumbs = () =>
        pathname
            .split("/")
            .slice(1)
            .map((segment, index) => (
                <Fragment key={`${segment}-${index}`}>
                    {index > 0 ? " > " : null}
                    <Link
                        href={
                            segment === "admin"
                                ? "/"
                                : `/admin/${segment}`
                        }
                    >
                        {segment
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Link>
                </Fragment>
            ));



    const QuickButtons = [
        {
            label: "Racks",
            href: "/admin/racks/add",
            icon: <PlusIcon size={16} />
        },
        {
            label: "Orders",
            href: "/admin/orders/add",
            icon: <PlusIcon size={16} />
        },
        {
            label: "Users",
            href: "/admin/users/add",
            icon: <PlusIcon size={16} />
        },
        {
            label: "Couriers",
            href: "/admin/couriers/add",
            icon: <PlusIcon size={16} />
        },
        {
            label: "Invoices",
            href: "/admin/invoices/add",
            icon: <PlusIcon size={16} />
        },
    ]

    const currentQuickButton = QuickButtons.find((button) => button.label === pageTitle())

  return (
    <div className="w-full h-10 bg-background border-b px-2">
        <div className="w-full h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowArcLeftIcon size={24} /> Back
                </Button>
                <div className="flex items-center gap-2">
                    {breadcrumbs()}
                </div>
            </div>
                {currentQuickButton && (
                    <Button variant="outline" size="sm" onClick={() => router.push(currentQuickButton.href)}>
                        {currentQuickButton.icon} Add New {currentQuickButton.label} 
                    </Button>
                )}
        </div>
    </div>
  )
}

export default AdminHeader