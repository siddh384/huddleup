"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  RiBuilding2Line,
  RiCalendarLine,
  RiDashboard2Line,
  RiLogoutBoxRLine,
  RiSideBarFill,
  RiUser3Line,
} from "@remixicon/react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { ChevronUpDownSmall } from "@/components/foundations/icons/chevrons";
import { cx } from "@/utils/cx";
import { signOut } from "@/lib/auth-client";

/**
 * Adapted from BoardUI's DashboardSidebar (components/application/dashboard):
 * same floating panel, collapse-to-rail animation, and user-menu popover
 * pattern. Changes for HuddleUp: three nav items driven by usePathname,
 * next/link navigation, real session data in the user menu (Profile link +
 * better-auth sign out), and the demo quick-search / team menu / settings
 * modal / BoardUI ThemeToggle removed (the app themes via next-themes).
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: IconComponent;
  exact: boolean;
}[] = [
  {
    label: "Overview",
    href: "/owner-dashboard",
    icon: RiDashboard2Line,
    exact: true,
  },
  {
    label: "My Venues",
    href: "/owner-dashboard/venues",
    icon: RiBuilding2Line,
    exact: false,
  },
  {
    label: "Bookings",
    href: "/owner-dashboard/bookings",
    icon: RiCalendarLine,
    exact: false,
  },
];

/** Collapsible text slot: blurs + fades away as the rail closes. */
function Collapsible({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        collapsed ? "max-w-0 opacity-0 blur-[3px]" : "max-w-40 opacity-100 blur-0",
      )}
    >
      {children}
    </span>
  );
}

function NavItem({
  icon: Icon,
  label,
  isSelected = false,
  collapsed = false,
  href,
}: {
  icon: IconComponent;
  label: string;
  isSelected?: boolean;
  collapsed?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={isSelected ? "page" : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={cx(
        "flex items-center justify-between overflow-hidden rounded-2lg p-2",
        "transition-[width,background-color] duration-300 ease-in-out",
        collapsed ? "w-9" : "w-full",
        isSelected
          ? "bg-linear-to-b from-accent-500 to-accent-600 shadow-nav-selected"
          : "hover:bg-background-secondary-hover",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon
          className={cx(
            "size-5 shrink-0",
            isSelected ? "text-white" : "text-foreground-icon-secondary",
          )}
          aria-hidden
        />
        <Collapsible collapsed={collapsed}>
          <span
            className={cx(
              "text-body-medium whitespace-nowrap",
              isSelected ? "text-white" : "text-text-secondary",
            )}
          >
            {label}
          </span>
        </Collapsible>
      </span>
    </Link>
  );
}

function OwnerUserMenu({
  collapsed,
  user,
}: {
  collapsed: boolean;
  user: { name: string; email: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const initials = user.name.slice(0, 1).toUpperCase();

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label={user.name}
        className={cx(
          "relative flex min-w-0 cursor-pointer items-center gap-2 rounded-full outline-none",
          "focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2",
          "before:pointer-events-none before:absolute before:-inset-x-1.5 before:-inset-y-[5px] before:rounded-full before:border-2 before:border-transparent before:transition-colors before:duration-150",
          "hover:before:border-border-sidebar-profile-hover",
          collapsed && "w-9 justify-center gap-0 before:-inset-x-[3px]",
        )}
      >
        <Avatar size="md" color="neutral" initials={initials} />
        <Collapsible collapsed={collapsed}>
          <span className="flex items-center gap-0.5">
            <span className="text-body-medium whitespace-nowrap text-text-primary">
              {user.name}
            </span>
            <ChevronUpDownSmall className="size-4 shrink-0 text-foreground-icon-tertiary" />
          </span>
        </Collapsible>
      </AriaButton>

      <AriaPopover
        placement="right top"
        offset={8}
        className={cx(
          "w-[265px] max-w-[calc(100vw-32px)] origin-top-left",
          "rounded-2xl border border-border-button-default bg-background-primary-default p-2.5 shadow-dropdown",
          "transition duration-150 ease-out",
          "data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:blur-[2px]",
          "data-[exiting]:opacity-0 data-[exiting]:scale-95 data-[exiting]:blur-[2px]",
        )}
      >
        <AriaDialog aria-label="Account menu" className="flex flex-col outline-none">
          <div className="flex w-full flex-col gap-0.5 px-2 pb-2 pt-1">
            <span className="truncate text-body-medium text-text-primary">
              {user.name}
            </span>
            <span className="truncate text-caption-1-regular text-text-tertiary">
              {user.email}
            </span>
          </div>
          <div className="-mx-2.5 h-px bg-border-button-default" />
          <div className="flex w-full flex-col gap-1 pt-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-2lg px-2 py-1.5 text-body-medium text-text-primary outline-none transition-colors hover:bg-background-primary-hover"
            >
              <RiUser3Line className="size-4 text-foreground-icon-secondary" aria-hidden />
              Profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-2lg px-2 py-1.5 text-body-medium text-text-error-primary outline-none transition-colors hover:bg-background-primary-hover"
            >
              <RiLogoutBoxRLine className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
}

export function OwnerSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cx(
        "flex h-full shrink-0 flex-col justify-between overflow-hidden",
        "rounded-3xl border border-border-button-white bg-background-secondary-default shadow-sidebar",
        "transition-[width] duration-300 ease-in-out",
        // Collapsed rail keeps the 60px spec: 1px border + 11px padding on
        // each side leaves an exactly 36px column for the w-9 icon items.
        collapsed ? "w-[60px] px-[11px] py-3" : "w-[260px] p-3",
      )}
    >
      <div className="-m-2 flex min-h-0 w-[calc(100%+16px)] flex-col gap-3 overflow-y-auto p-2 [scrollbar-width:none]">
        <div
          className={cx(
            "flex w-full transition-[gap] duration-300 ease-in-out",
            collapsed
              ? "flex-col-reverse items-start justify-center gap-2.5"
              : "flex-row items-center justify-between",
          )}
        >
          <div
            className={cx(
              "-m-2 min-w-0 overflow-hidden p-2 transition-[max-width,opacity,transform] duration-300 ease-in-out",
              "max-w-[206px] scale-100 opacity-100",
            )}
          >
            <OwnerUserMenu collapsed={collapsed} user={user} />
          </div>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
            className={cx(
              "cursor-pointer text-foreground-icon-secondary transition-transform duration-300 ease-in-out",
              collapsed && "flex w-9 items-center justify-center",
            )}
          >
            <RiSideBarFill
              className={cx(
                "size-5 transition-transform duration-300 ease-in-out",
                !collapsed && "-scale-x-100",
              )}
              aria-hidden
            />
          </button>
        </div>

        <nav className={cx("flex w-full flex-col gap-1", !collapsed && "px-0.5")}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isSelected={
                item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
