"use client";

import { Fragment, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowArcLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

const RESERVED_SEGMENTS = new Set(["add", "edit", "new"]);

/** Convex-style ids, numeric ids, long opaque slugs — hide from breadcrumb labels. */
function isDynamicSegment(segment: string): boolean {
  const lower = segment.toLowerCase();
  if (RESERVED_SEGMENTS.has(lower)) return false;
  if (/^\d+$/.test(segment)) return true;
  if (/^[a-z0-9_-]{17,}$/i.test(segment)) return true;
  return false;
}

function formatSegmentLabel(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Crumb = { label: string; href: string | null };

function buildAdminBreadcrumbs(pathname: string): Crumb[] {
  const normalized =
    pathname.replace(/\/+$/, "") || "/";
  const parts = normalized.split("/").filter(Boolean);

  if (parts.length === 0 || parts[0] !== "admin") {
    return [];
  }

  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin" }];

  let acc = "/admin";
  let i = 1;

  while (i < parts.length) {
    const seg = parts[i];

    if (seg.toLowerCase() === "edit") {
      crumbs.push({ label: "Editing", href: null });
      break;
    }

    if (isDynamicSegment(seg)) {
      i += 1;
      continue;
    }

    acc = `${acc}/${seg}`;
    crumbs.push({
      label: formatSegmentLabel(seg),
      href: acc,
    });
    i += 1;
  }

  return crumbs;
}

function CrumbView({
  crumb,
  pathname,
}: {
  crumb: Crumb;
  pathname: string;
}) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (crumb.href === null) {
    return (
      <span className="font-medium text-foreground" aria-current="page">
        {crumb.label}
      </span>
    );
  }

  const isCurrent =
    normalizedPath === crumb.href || normalizedPath === `${crumb.href}/`;

  if (isCurrent) {
    return (
      <span className="text-muted-foreground" aria-current="page">
        {crumb.label}
      </span>
    );
  }

  return (
    <Link
      href={crumb.href}
      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {crumb.label}
    </Link>
  );
}

const AdminHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPage = pathname.startsWith("/admin");

  const crumbs = useMemo(() => buildAdminBreadcrumbs(pathname), [pathname]);

  const pageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) return "";
    if (last.toLowerCase() === "edit") return "Editing";
    if (isDynamicSegment(last)) {
      for (let j = parts.length - 2; j >= 0; j--) {
        const p = parts[j];
        if (!isDynamicSegment(p) && !RESERVED_SEGMENTS.has(p.toLowerCase())) {
          return formatSegmentLabel(p);
        }
      }
    }
    return formatSegmentLabel(last);
  };

  const QuickButtons = [
    {
      label: "Racks",
      href: "/admin/racks/add",
      icon: <PlusIcon size={16} />,
    },
    {
      label: "Orders",
      href: "/admin/orders/add",
      icon: <PlusIcon size={16} />,
    },
    {
      label: "Users",
      href: "/admin/users/add",
      icon: <PlusIcon size={16} />,
    },
    {
      label: "Couriers",
      href: "/admin/users/add",
      icon: <PlusIcon size={16} />,
    },
    {
      label: "Invoices",
      href: "/admin/invoices/add",
      icon: <PlusIcon size={16} />,
    },
    {
      label: "Clients",
      href: "/admin/clients/add",
      icon: <PlusIcon size={16} />,
    },
  ];

  const currentQuickButton = QuickButtons.find(
    (button) => button.label === pageTitle(),
  );

  if (!isAdminPage) return null;

  return (
    <div className="h-10 w-full border-b bg-background px-2">
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowArcLeftIcon size={24} /> Back
          </Button>
          <nav
            className="flex items-center gap-2 text-xs md:text-sm"
            aria-label="Breadcrumb"
          >
            {crumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${crumb.href ?? "current"}-${index}`}>
                {index > 0 ? (
                  <span className="text-muted-foreground" aria-hidden>
                    {" "}
                    &gt;{" "}
                  </span>
                ) : null}
                <CrumbView crumb={crumb} pathname={pathname} />
              </Fragment>
            ))}
          </nav>
        </div>
        {currentQuickButton ? (
          <Button onClick={() => router.push(currentQuickButton.href)}>
            {currentQuickButton.icon} Add New {currentQuickButton.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default AdminHeader;
