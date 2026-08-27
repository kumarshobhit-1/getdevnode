"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, LogOut, Settings, User } from "lucide-react";

import { useEffect, useState } from "react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { hasAuthCookie, useCurrentUser, useLogout } from "@/hooks/use-auth";
import { getGithubLoginUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthedCookie = mounted ? hasAuthCookie() : false;

  return (
    <header
      className={cn(
        "relative z-30 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6",
        className
      )}
    >
      <Link href={user ? "/dashboard" : "/"} className="hover:opacity-90 transition-opacity shrink-0">
        <BrandMark />
      </Link>

      {/* Center Landing Nav Links */}
      <nav className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-medium text-muted-foreground">
        <Link
          href="/about"
          className="rounded-lg px-2 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          About
        </Link>
        <Link
          href="/terms"
          className="hidden xs:inline-block rounded-lg px-2 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          Terms
        </Link>
        <Link
          href="/privacy"
          className="hidden xs:inline-block rounded-lg px-2 py-1.5 hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          Privacy
        </Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ModeToggle />

        {!mounted ? (
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="hidden md:inline-block h-4 w-20 rounded-md" />
          </div>
        ) : user ? (
          /* User Logged In State */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden sm:inline-flex items-center gap-1.5 rounded-lg"
              )}
            >
              <LayoutDashboard className="size-4 text-primary" />
              <span>Dashboard</span>
            </Link> */}

            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-muted/80 cursor-pointer">
                <Avatar className="size-8 rounded-lg border border-border shrink-0">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                  <AvatarFallback className="rounded-lg font-medium text-xs">
                    {(user.displayName ?? "GDN").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block max-w-28 truncate font-medium text-xs">
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
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 size-4" />
                    <span>Dashboard</span>
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
          </div>
        ) : isLoading && isAuthedCookie ? (
          /* User has auth cookie, but api.me() is loading -> render matching avatar frame with zero flicker */
          <div className="relative flex items-center gap-2 rounded-xl p-1">
            <Avatar className="size-8 rounded-lg border border-border shrink-0">
              <AvatarFallback className="rounded-lg font-medium text-xs bg-muted animate-pulse">
                GDN
              </AvatarFallback>
            </Avatar>
            <Skeleton className="hidden md:inline-block h-4 w-20 rounded-md" />
          </div>
        ) : (
          /* User Logged Out State (No auth cookie) -> render Sign in button immediately */
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl px-4 text-xs font-semibold shadow-xs border-border/70 hover:bg-muted/80 transition-all"
              )}
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
