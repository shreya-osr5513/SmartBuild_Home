import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth, useBuilding } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/rooms", label: "Rooms", icon: Building2 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/energy", label: "Energy", icon: Zap },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { alerts } = useBuilding();
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeProps={{ className: "bg-teal-soft text-teal" }}
          inactiveProps={{
            className: "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
          {label === "Alerts" && activeAlerts > 0 ? (
            <span className="ml-auto rounded-full bg-danger/20 px-2 py-0.5 text-xs font-semibold text-danger">
              {activeAlerts}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/15">
        <Building2 className="size-5 text-teal" />
      </span>
      <div className="min-w-0">
        <p className="font-display truncate text-sm font-semibold">SmartBuild OS</p>
        <p className="truncate text-xs text-muted-foreground">IoT Energy Management</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const title = useRouterState({
    select: (s) => {
      const path = s.location.pathname;
      return NAV.find((n) => path.startsWith(n.to))?.label ?? "Overview";
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="mt-4 rounded-xl bg-sidebar-accent p-3">
          <p className="truncate text-sm font-medium capitalize">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          <button
            onClick={signOut}
            className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-danger"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-danger"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" />
            Live
          </span>
        </header>

        <main className="px-4 pt-5 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeProps={{ className: "text-teal" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium")}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
