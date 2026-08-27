"use client";

import { UserRound } from "lucide-react";
import { useEffect, useRef } from "react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { CitationChips } from "@/components/chat/citation-chips";
import { GetDevNodeIcon } from "@/components/icons/getdevnode-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatMessages({
  repo,
  messages,
  streamText,
  streaming,
  isLoading,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  streaming?: boolean;
  isLoading?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText, streaming]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3 rounded-3xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-3xl" />
        <Skeleton className="h-24 w-3/4 rounded-3xl" />
      </div>
    );
  }

return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-4 sm:px-4 sm:py-6">
        {messages.length === 0 && !streamText && !streaming && (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
            <p className="font-medium text-base">Ask anything about this codebase</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try “Where is authentication handled?” or “Explain the repository
              indexing flow.”
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "USER";
          return (
            <div key={message.id || index} className="space-y-2">
              {isUser ? (
                /* User Prompt Bubble (Right-aligned, ChatGPT style) */
                <div className="flex flex-col items-end gap-1 ml-auto max-w-[88%] sm:max-w-[80%]">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pr-1">
                    <span className="font-medium text-[11px]">You</span>
                    <Avatar className="size-5">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                        <UserRound className="size-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="rounded-2xl rounded-tr-xs bg-muted/90 border border-border/70 px-4 py-2.5 text-sm text-foreground shadow-xs whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ) : (
                /* AI Response Block (Left-aligned, ChatGPT style) */
                <div className="flex flex-col gap-1.5 w-full max-w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground pl-0.5">
                    <GetDevNodeIcon className="size-5 rounded-lg shrink-0 shadow-xs" />
                    <span>GetDevNode AI</span>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/50 px-3 py-3 sm:px-5 sm:py-4 shadow-xs">
                    <ChatMarkdown content={message.content} />
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 border-t border-border/40 pt-3">
                        <CitationChips repo={repo} citations={message.citations} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(streaming || streamText) && (
          <div className="flex flex-col gap-1.5 w-full max-w-full">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground pl-0.5">
              <GetDevNodeIcon className="size-5 rounded-lg shrink-0 shadow-xs animate-pulse" />
              <span>GetDevNode AI</span>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3.5 sm:px-5 sm:py-4 shadow-xs">
              {streamText ? (
                <>
                  <ChatMarkdown content={streamText} isStreaming />
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary align-middle" />
                </>
              ) : (
                <div className="flex items-center gap-3 py-1 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 rounded-full bg-primary animate-bounce" />
                  </div>
                  <span className="font-medium text-xs text-foreground/80 animate-pulse">
                    Searching codebase & generating answer…
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}