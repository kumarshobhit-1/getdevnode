"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, History, PanelLeftOpen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useStreamChat,
} from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const statusQuery = useIndexStatus(repoId, true);

  const indexStatus =
    statusQuery.data?.indexStatus ?? repoQuery.data?.indexStatus;
  const ready = indexStatus === "READY";

  const sessionsQuery = useChatSessions(repoId, ready);
  const createSession = useCreateChatSession(repoId);
  const deleteSession = useDeleteChatSession(repoId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const autoCreateRef = useRef(false);

  const sessionId =
    selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } = useStreamChat(sessionId);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (statusQuery.data?.indexStatus === "READY") {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repos.detail(repoId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.repos.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.sessions(repoId) });
    }
  }, [statusQuery.data?.indexStatus, repoId, queryClient]);

  useEffect(() => {
    if (!ready || sessionsQuery.isLoading) return;
    if (sessionsQuery.data && sessionsQuery.data.length > 0) return;
    if (
      !sessionsQuery.isSuccess ||
      (sessionsQuery.data?.length ?? 0) > 0 ||
      autoCreateRef.current
    ) {
      return;
    }

    autoCreateRef.current = true;
    createSession.mutate(undefined, {
      onSuccess: (session) => setSelectedSessionId(session.id),
      onError: () => {
        autoCreateRef.current = false;
      },
    });
  }, [
    ready,
    sessionsQuery.isLoading,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession,
  ]);

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Loading chat…">
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-[18rem_1fr]">
          <Skeleton className="min-h-80 rounded-2xl" />
          <Skeleton className="min-h-80 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    return (
      <AppShell title="Repository unavailable">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm text-muted-foreground">
            {(repoQuery.error as Error)?.message ?? "Repository not found"}
          </p>
          <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  const repo = repoQuery.data;
  const currentSessionTitle =
    sessionsQuery.data?.find((s) => s.id === sessionId)?.title ?? "Current Chat";

  return (
    <AppShell
      title={repo.name}
      description={
        ready
          ? "Ask questions grounded in this repository"
          : "Waiting for indexing to finish"
      }
      actions={
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile Sessions Sheet */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="xs"
                  className="md:hidden flex items-center gap-1 text-xs h-7 px-2 shrink-0"
                />
              }
            >
              <History className="size-3.5" />
              <span>Chats</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 h-full flex flex-col overflow-hidden">
              <SheetHeader className="p-3 border-b shrink-0">
                <SheetTitle className="text-sm">Chat Sessions</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatSidebar
                  repo={{
                    ...repo,
                    indexStatus: indexStatus ?? repo.indexStatus,
                    filesProcessed:
                      statusQuery.data?.filesProcessed ?? repo.filesProcessed,
                    filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
                    chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
                    errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
                  }}
                  sessionId={sessionId}
                  onSelectSession={(id) => {
                    setSelectedSessionId(id);
                    setMobileSheetOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="xs" className="h-7 px-2 text-xs shrink-0" render={<Link href="/dashboard" />}>
            <ArrowLeft data-icon="inline-start" className="size-3.5" />
            <span>Repos</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-1 h-full min-h-0 w-full flex-col md:flex-row overflow-hidden">
        {/* Desktop Collapsible Chat Sidebar */}
        <div
          className={cn(
            "hidden md:flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out relative overflow-hidden bg-background",
            isSidebarOpen ? "w-72 opacity-100" : "w-0 border-r-0 opacity-0"
          )}
        >
          <div className="w-72 h-full flex flex-col">
            <ChatSidebar
              repo={{
                ...repo,
                indexStatus: indexStatus ?? repo.indexStatus,
                filesProcessed:
                  statusQuery.data?.filesProcessed ?? repo.filesProcessed,
                filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
                chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
                errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
              }}
              sessionId={sessionId}
              onSelectSession={setSelectedSessionId}
              onToggleCollapse={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Desktop Collapsed Bar Control (Only visible on Desktop when sidebar is collapsed) */}
        {!isSidebarOpen && (
          <div className="hidden md:flex items-center gap-2 border-b bg-background/80 px-4 py-2 shrink-0 backdrop-blur-sm">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setIsSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Expand chat sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {currentSessionTitle}
            </span>
          </div>
        )}

        {/* Main Chat Conversation Container */}
        <section className="flex flex-1 min-w-0 flex-col min-h-0 h-full overflow-hidden">
          {!ready ? (
            <IndexingState repo={repo} status={statusQuery.data} />
          ) : (
            <>
              <ChatMessages
                repo={repo}
                messages={messagesQuery.data ?? []}
                streamText={streamText}
                streaming={streaming}
                isLoading={messagesQuery.isLoading}
              />
              <ChatComposer
                disabled={!sessionId}
                streaming={streaming}
                onSend={send}
                onStop={stop}
              />
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}