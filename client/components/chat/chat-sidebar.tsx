"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileText, FolderGit2, Home, Info, LayoutDashboard, LogOut, PanelLeftClose, Plus, RotateCcw, Settings, ShieldCheck, Trash2 } from "lucide-react";

import { IndexStatusBadge } from "@/components/dashboard/repo-status";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
} from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
  onToggleCollapse,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string | null) => void;
  onToggleCollapse?: () => void;
}) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const deleteSession = useDeleteChatSession(repo.id);
  const reindex = useStartIndexing();

  return (
    <aside className="flex h-full w-full flex-col min-h-0 bg-sidebar text-sidebar-foreground">
      <div className="space-y-3 p-4 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{repo.owner}</p>
            <h2 className="truncate text-base font-semibold font-heading text-foreground">{repo.name}</h2>
            <div className="flex items-center gap-2 pt-1">
              <IndexStatusBadge status={repo.indexStatus} />
              {repo.isPrivate && (
                <span className="rounded-md border border-dashed px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  Private
                </span>
              )}
            </div>
          </div>
          {onToggleCollapse && (
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={onToggleCollapse}
              className="hidden md:flex text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
              title="Collapse chat sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={!ready || createSession.isPending}
            onClick={() =>
              createSession.mutate("New chat", {
                onSuccess: (session) => onSelectSession(session.id),
              })
            }
          >
            <Plus data-icon="inline-start" />
            New chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <Separator className="shrink-0" />

      <div className="px-4 py-2 text-xs font-medium text-muted-foreground shrink-0">
        Sessions
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1 px-2 pb-4">
          {!ready && (
            <p className="px-2 text-xs text-muted-foreground">
              Sessions unlock after indexing completes.
            </p>
          )}

          {sessionsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}

          {sessionsQuery.data?.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted",
                sessionId === session.id && "bg-muted"
              )}
            >
              <button
                type="button"
                onClick={() => onSelectSession(session.id)}
                className="min-w-0 flex-1 pr-2 text-left cursor-pointer focus:outline-none"
              >
                <p className="truncate text-sm font-medium">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </button>

              <Button
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                disabled={deleteSession.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession.mutate(session.id, {
                    onSuccess: () => {
                      if (sessionId === session.id) {
                        const remaining =
                          sessionsQuery.data?.filter((s) => s.id !== session.id) ?? [];
                        onSelectSession(remaining[0]?.id ?? null);
                      }
                    },
                  });
                }}
                aria-label="Delete chat session"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}

          {ready && sessionsQuery.isSuccess && sessionsQuery.data.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">
              No chats yet. Start one to begin.
            </p>
          )}
        </div>
      </ScrollArea>

      <Separator className="shrink-0" />

      {/* User Profile Footer Dropdown */}
      <div className="p-3 shrink-0 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/60 p-2.5 text-left transition-all hover:bg-card/90 cursor-pointer shadow-xs">
            <Avatar className="size-9 rounded-xl border border-border shrink-0">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.displayName} />
              <AvatarFallback className="rounded-xl font-medium text-xs">
                {(user?.displayName ?? "GDN").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-foreground">
                {user?.displayName ?? "Shobhit Kumar"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user?.githubUsername ? `@${user.githubUsername}` : "@kumarshobhit-1"}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-2xl border border-border/60 p-1.5 shadow-xl"
            align="start"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2.5 py-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold leading-none">{user?.displayName ?? "Shobhit Kumar"}</p>
                  <p className="text-xs text-muted-foreground leading-none">
                    Connected via GitHub
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="rounded-xl px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 size-4" />
                <span>Home Page</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/about")}
              >
                <Info className="mr-2 size-4" />
                <span>About</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/terms")}
              >
                <FileText className="mr-2 size-4" />
                <span>Terms & Conditions</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/privacy")}
              >
                <ShieldCheck className="mr-2 size-4" />
                <span>Privacy Policy</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-xl px-2.5 py-2 cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground font-medium transition-colors"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}