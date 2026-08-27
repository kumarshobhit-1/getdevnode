"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderGit2, Home, LayoutDashboard, LogOut, Settings } from "lucide-react";

import { GetDevNodeIcon } from "@/components/icons/getdevnode-icon";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
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
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  dashboardNavGroups,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

const desktopNavItems = [
  { title: "Home Page", href: "/", icon: Home, exact: true },
  { title: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Repositories", href: "/dashboard", icon: FolderGit2, exact: true },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppShell({
  children,
  title,
  description,
  actions,
  hideHeader = false,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <SidebarProvider className="h-svh max-h-svh overflow-hidden">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/" />}
                tooltip="Go to Home Page"
              >
                <GetDevNodeIcon className="size-8 shrink-0 rounded-[10px]" />
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">GetDevNode</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Chat with your code
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {dashboardNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isDashboardNavActive(
                          pathname,
                          item.href,
                          item.exact
                        )}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[popup-open]:bg-sidebar-accent"
                  >
                    <Avatar className="size-8 shrink-0 rounded-lg">
                      <AvatarImage
                        src={user?.avatarUrl ?? undefined}
                        alt={user?.displayName}
                      />
                      <AvatarFallback className="rounded-lg font-medium text-xs">
                        {(user?.displayName ?? "GDN").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-medium">
                        {user?.displayName ?? "Guest User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.githubUsername ? `@${user.githubUsername}` : "Connected"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {user?.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Connected via GitHub
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    <Home />
                    Home Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-svh max-h-svh overflow-hidden">
        {!hideHeader && (
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-xl">
            {/* Mobile Header View (< md) */}
            <div className="flex items-center gap-1.5 md:hidden min-w-0 flex-1 mr-2">
              <SidebarTrigger className="-ml-1 shrink-0" />
              <Separator orientation="vertical" className="h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="truncate font-heading text-xs sm:text-sm font-medium max-w-[130px] xs:max-w-[200px]">
                    {title}
                  </h1>
                )}
              </div>
            </div>

            {/* Desktop Header Navbar View (md:) */}
            <div className="hidden md:flex items-center gap-6">
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

            {/* Right side actions + User Dropdown + Theme Toggle */}
            <div className="flex items-center gap-2">
              {actions}
              <ModeToggle />

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden md:flex relative items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-muted/80 cursor-pointer">
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
          </header>
        )}
        <div className="flex flex-1 flex-col min-h-0 h-full overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        className
      )}
    >
      <GetDevNodeIcon className="size-8 rounded-[10px]" />
      <span className="font-heading text-[1.05rem] leading-none">GetDevNode</span>
    </div>
  );
}

export function GhostButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button variant="ghost" size="sm" className={className} render={<Link href={href} />}>
      {children}
    </Button>
  );
}