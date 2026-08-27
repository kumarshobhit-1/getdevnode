"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  FolderGit2,
  Layers,
  MessageSquareCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { GetDevNodeIcon } from "@/components/icons/getdevnode-icon";
import { GitHubIcon } from "@/components/icons/github-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hasAuthCookie, useCurrentUser } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getGithubLoginUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data: user, isLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthedCookie = mounted ? hasAuthCookie() : false;

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      {/* Dynamic Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      {/* Header Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 md:py-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-3xl space-y-8 text-center">
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-xs">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>AI-Powered Codebase Intelligence</span>
          </div> */}

          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.15]">
              Chat directly with your <span className="text-primary">entire codebase</span>.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground text-balance sm:text-xl sm:leading-relaxed">
              Connect GitHub, index any repository with PgVector embeddings, and ask questions grounded in your actual source code with precise line-level citations.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row min-h-[44px]">
            {user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 font-medium shadow-md shadow-primary/20"
                )}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : isLoading && isAuthedCookie ? (
              <Skeleton className="h-11 w-44 rounded-xl" />
            ) : (
              <a
                href={getGithubLoginUrl()}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 font-medium shadow-md shadow-primary/20"
                )}
              >
                <GitHubIcon className="size-5" />
                <span>Continue with GitHub</span>
                <ArrowRight className="size-4" />
              </a>
            )}
            {/* <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6"
              )}
            >
              <FolderGit2 className="size-4" />
              <span>Explore Dashboard</span>
            </Link> */}
          </div>

          {/* Key Quick Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Private & Public Repos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>PgVector RAG Indexing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Gemini 2.5 Flash AI</span>
            </div>
          </div>
        </section>

        {/* Live UI Mockup Preview */}
        <section className="relative mx-auto w-full max-w-4xl rounded-2xl border border-border/80 bg-card/80 p-2 shadow-2xl backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 px-1.5 sm:px-2 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <div className="size-2.5 sm:size-3 rounded-full bg-red-500/80 shrink-0" />
              <div className="size-2.5 sm:size-3 rounded-full bg-yellow-500/80 shrink-0" />
              <div className="size-2.5 sm:size-3 rounded-full bg-green-500/80 shrink-0" />
              <span className="ml-1 sm:ml-2 font-mono text-[11px] sm:text-xs text-muted-foreground truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
                GetDevNode — getdevnode/backend
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-500 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="hidden xs:inline">Indexed & Ready</span>
              <span className="xs:hidden">Ready</span>
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4 p-2.5 sm:p-6 font-sans">
            {/* User Message Mock */}
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-md rounded-2xl bg-primary px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-primary-foreground shadow-xs">
                How does code context retrieval and PgVector search work in this repository?
              </div>
            </div>

            {/* AI Response Mock */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <GetDevNodeIcon className="size-4 sm:size-5 rounded-lg" />
              </div>
              <div className="space-y-3 min-w-0 flex-1 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:p-4 text-xs sm:text-sm leading-relaxed">
                <p>
                  Context retrieval is handled by <code className="inline rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-primary border border-primary/20 break-all">CodeContextRetriever.java</code>.
                  It executes similarity searches against the <code className="inline rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] sm:text-xs border border-border/40 break-all">vector_store</code> PostgreSQL table using 1536-dimensional embeddings generated by Google Gemini.
                </p>

                {/* Citation Cards */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Source Citations:</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-border/80 bg-background/80 p-2 sm:p-2.5 text-[11px] sm:text-xs hover:border-primary/40 transition-colors">
                      <FileCode2 className="size-3.5 sm:size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-mono font-medium text-[11px] sm:text-xs">CodeContextRetriever.java</p>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Lines 22-38 • Similarity Search</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-border/80 bg-background/80 p-2 sm:p-2.5 text-[11px] sm:text-xs hover:border-primary/40 transition-colors">
                      <FileCode2 className="size-3.5 sm:size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-mono font-medium text-[11px] sm:text-xs">IndexingService.java</p>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Lines 85-112 • Chunking Pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Built for Modern Developers
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Everything you need to navigate, understand, and debug complex codebases effortlessly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "GitHub OAuth Sync",
                body: "Seamlessly authorize and fetch public or private repositories directly with repo scope authentication.",
                icon: FolderGit2,
              },
              {
                title: "PgVector Vector Store",
                body: "High-performance vector database indexing with HNSW cosine similarity search.",
                icon: Database,
              },
              {
                title: "Grounded AI Chat",
                body: "Get precise, hallucination-free answers grounded exclusively in your indexed codebase context.",
                icon: MessageSquareCode,
              },
              {
                title: "Line-Level Citations",
                body: "Every response includes clickable source file references and exact line ranges for verification.",
                icon: Code2,
              },
              {
                title: "Smart Text Chunking",
                body: "Intelligent overlapping text splitters preserve file structure and function boundaries.",
                icon: Layers,
              },
              {
                title: "Secure Session Storage",
                body: "Encrypted tokens and session management keep your code and interactions fully private.",
                icon: ShieldCheck,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/80 p-6 shadow-xs backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-base">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="rounded-3xl border border-border/80 bg-card/50 p-6 sm:p-10 backdrop-blur-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              How GetDevNode Works
            </h2>
            <p className="text-sm text-muted-foreground">From repository to intelligent code conversation in 4 simple steps.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Connect GitHub", desc: "Authenticate with your GitHub account securely." },
              { step: "02", title: "Select Repo", desc: "Choose any repository you want to analyze and index." },
              { step: "03", title: "RAG Indexing", desc: "GetDevNode chunks files & embeds into PgVector store." },
              { step: "04", title: "Chat & Ask", desc: "Ask questions and receive answers with source code links." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3">
                <span className="font-mono text-2xl font-bold text-primary/40">{item.step}</span>
                <h3 className="font-medium text-base">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to chat with your codebase?
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base text-balance">
              Start indexing your repositories with GetDevNode and unlock instant AI-powered code insights today.
            </p>
            <div className="flex justify-center pt-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "inline-flex items-center gap-2 rounded-xl px-8 font-semibold text-foreground shadow-lg"
                  )}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <a
                  href={getGithubLoginUrl()}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "inline-flex items-center gap-2 rounded-xl px-8 font-semibold text-foreground shadow-lg"
                  )}
                >
                  <GitHubIcon className="size-5" />
                  <span>Get Started Now</span>
                  <ArrowRight className="size-4" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-card/30 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <BrandMark />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GetDevNode. All rights reserved. Powered by Spring Boot & Next.js.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {/* <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              GitHub <ExternalLink className="size-3" />
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  );
}