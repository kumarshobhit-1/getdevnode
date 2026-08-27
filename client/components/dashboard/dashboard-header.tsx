"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderGit2, Home, LayoutDashboard, LogOut, RefreshCw, Search, Settings } from "lucide-react";

import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { isDashboardNavActive } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import type { IndexStatus } from "@/lib/api";

type FilterStatus = "ALL" | IndexStatus;

const desktopNavItems = [
  { title: "Home Page", href: "/", icon: Home, exact: true },
  { title: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Repositories", href: "/dashboard", icon: FolderGit2, exact: true },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  visibility: "all" | "public" | "private";
  onVisibilityChange: (value: "all" | "public" | "private") => void;
  status: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  totalCount?: number;
  readyCount?: number;
  onSync: () => void;
  isSyncing?: boolean;
};

const visibilityFilters = [
  { value: "all" as const, label: "All" },
  { value: "public" as const, label: "Public" },
  { value: "private" as const, label: "Private" },
];

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "READY", label: "Ready" },
  { value: "INDEXING", label: "Indexing" },
  { value: "PENDING", label: "New" },
  { value: "FAILED", label: "Failed" },
];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors shrink-0",
        active
          ? "border-foreground/20 bg-foreground text-background shadow-xs"
          : "border-dashed border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function DashboardHeader({
  search,
  onSearchChange,
  visibility,
  onVisibilityChange,
  status,
  onStatusChange,
  totalCount,
  readyCount,
  onSync,
  isSyncing,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="shrink-0 z-20 border-b bg-background/95 backdrop-blur-xl shadow-xs">
      {/* Desktop Top Navbar Row (md:) */}
      <div className="hidden md:flex h-14 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-1">
            {desktopNavItems.map((item) => {
              const active = isDashboardNavActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("size-3.5", active ? "text-primary" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-muted/80 cursor-pointer">
              <Avatar className="size-8 rounded-lg border border-border shrink-0">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                <AvatarFallback className="rounded-lg font-medium text-xs">
                  {(user.displayName ?? "GDN").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline-block max-w-28 truncate text-xs font-medium">
                {user.displayName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl" align="end" sideOffset={8}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground leading-none">
                      @{user.githubUsername}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard/overview")}>
                  <LayoutDashboard className="mr-2 size-4" />
                  <span>Overview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <FolderGit2 className="mr-2 size-4" />
                  <span>Repositories</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer font-medium transition-colors"
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-4 md:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <div className="min-w-0">
              <h1 className="font-heading text-base font-semibold tracking-tight sm:text-xl">
                Repositories
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {totalCount != null
                  ? `${totalCount} connected · ${readyCount ?? 0} ready`
                  : "Sync and index a repo to start chatting"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search repos…"
                className="h-8 border-dashed bg-background pl-8 text-xs shadow-xs sm:h-9 sm:pl-9 sm:text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-dashed px-2.5 text-xs shadow-xs sm:h-9 sm:px-3 sm:text-sm"
              onClick={onSync}
              disabled={isSyncing}
            >
              <RefreshCw
                data-icon="inline-start"
                className={cn("size-3.5", isSyncing && "animate-spin")}
              />
              <span className="hidden xs:inline">Sync</span>
            </Button>
            <ModeToggle />
          </div>
        </div>

        <Separator className="opacity-40" />

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground sm:text-xs">
              Visibility
            </span>
            {visibilityFilters.map((filter) => (
              <FilterPill
                key={filter.value}
                active={visibility === filter.value}
                onClick={() => onVisibilityChange(filter.value)}
              >
                {filter.label}
              </FilterPill>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground sm:text-xs">
              Status
            </span>
            {statusFilters.map((filter) => (
              <FilterPill
                key={filter.value}
                active={status === filter.value}
                onClick={() => onStatusChange(filter.value)}
              >
                {filter.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}