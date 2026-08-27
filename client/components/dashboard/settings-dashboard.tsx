"use client";

import { LogOut, UserRound } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export function SettingsDashboard() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="h-full w-full flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6 pb-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your GitHub account connected to GetDevNode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-xl">
              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={user?.displayName}
              />
              <AvatarFallback className="rounded-xl">
                {(user?.displayName ?? "GDN").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                @{user?.githubUsername}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Display name</span>
              <span className="font-medium">{user?.displayName ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">GitHub username</span>
              <span className="font-medium">@{user?.githubUsername ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Authentication</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <GitHubIcon className="size-4" />
                GitHub OAuth
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account actions</CardTitle>
          <CardDescription>
            Manage your session and connected workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="justify-start" disabled>
            <UserRound data-icon="inline-start" />
            Manage on GitHub
          </Button>
          <Button
            variant="destructive"
            className="justify-start"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut data-icon="inline-start" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}