"use client";

import Link from "next/link";
import {
  Code2,
  Cpu,
  ExternalLink,
  FileText,
  FolderGit2,
  GitBranch,
  Layers,
  Search,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

import { GetDevNodeIcon } from "@/components/icons/getdevnode-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const coreFeatures = [
  {
    icon: GitBranch,
    title: "Instant GitHub Repository Sync",
    description:
      "One-click OAuth integration with public and private GitHub repositories. Automatically fetches code structure, commits, and file hierarchies.",
  },
  {
    icon: Code2,
    title: "AST-Aware Code Chunking",
    description:
      "Intelligent code parser that breaks down source files by syntax trees, functions, and classes rather than arbitrary line counts for precise semantic accuracy.",
  },
  {
    icon: Search,
    title: "High-Dimensional Vector Search",
    description:
      "Generates dense vector embeddings for all code chunks, enabling instant semantic search and grounded retrieval across entire software codebases.",
  },
  {
    icon: Terminal,
    title: "Grounded Code Intelligence",
    description:
      "Ask complex architectural or implementation questions and receive accurate, context-grounded answers complete with exact file location citations.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description:
      "OAuth token scoping ensures read-only repository access. Your code embeddings are securely isolated with strict workspace authorization.",
  },
  {
    icon: Zap,
    title: "Real-Time Chat Streaming",
    description:
      "ChatGPT-style conversational interface with live streaming responses, syntax-highlighted code blocks, and interactive citation chips.",
  },
];

const techStack = [
  { name: "Next.js 16 (Turbopack)", category: "Frontend Framework" },
  { name: "Spring Boot & Java 21", category: "Backend Engine" },
  { name: "Vector Database (PGVector)", category: "Semantic Search" },
  { name: "GitHub GraphQL / REST API", category: "Repository Integration" },
  { name: "Tailwind CSS & Shadcn UI", category: "Design System" },
  { name: "AST Parser & Embeddings", category: "Code Chunking Engine" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-svh flex flex-col overflow-hidden bg-background text-foreground">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.1),transparent_55%)]" />

      {/* Landing Home Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 space-y-10">
        {/* Header Banner - Repo Card Styled */}
        <div className="rounded-2xl border border-border/60 bg-card/90 p-6 sm:p-8 shadow-xs space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <GetDevNodeIcon className="size-10 rounded-xl shrink-0" />
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                About GetDevNode
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                v1.0.0 • AI Codebase Intelligence Platform
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            GetDevNode is an advanced repository intelligence platform designed for developers, engineering leads, and open-source contributors. By combining Abstract Syntax Tree (AST) code parsing with vector embeddings and Retrieval-Augmented Generation (RAG), GetDevNode lets you converse directly with your codebases to understand software architecture, trace API flows, and locate features instantly.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <GitBranch className="size-3" /> GitHub Integration
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Cpu className="size-3" /> AST Code Chunking
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Search className="size-3" /> Vector RAG Search
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Layers className="size-3" /> File Citations
            </Badge>
          </div>
        </div>

        {/* Core Capabilities - Styled Grid matching repo cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading text-foreground">
              Platform Capabilities
            </h2>
            <span className="text-xs text-muted-foreground">
              Built for software engineers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="rounded-2xl border-border/60 bg-card/90 shadow-xs transition-colors hover:border-border backdrop-blur-xl">
                  <CardHeader className="pb-2 flex flex-row items-center gap-3 space-y-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works - Repo Card Styled Horizontal Flow */}
        <div className="rounded-2xl border border-border/60 bg-card/90 p-6 sm:p-8 space-y-6 shadow-xs backdrop-blur-xl">
          <h2 className="text-lg font-semibold font-heading text-foreground">
            How GetDevNode Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 rounded-xl border border-border/40 bg-muted/30 p-4">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-medium text-foreground">Connect Repo</h3>
              <p className="text-xs text-muted-foreground">
                Authenticate with GitHub OAuth and import any public or private repository.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-border/40 bg-muted/30 p-4">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-medium text-foreground">AST Chunking</h3>
              <p className="text-xs text-muted-foreground">
                Backend parses syntax structures and computes dense vector embeddings.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-border/40 bg-muted/30 p-4">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </span>
              <h3 className="text-sm font-medium text-foreground">Grounded Chat</h3>
              <p className="text-xs text-muted-foreground">
                Ask questions and receive streaming answers grounded in actual source files.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Architecture */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-heading text-foreground">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card/90 p-3.5 space-y-1 shadow-xs backdrop-blur-xl"
              >
                <p className="text-xs font-semibold text-foreground">{tech.name}</p>
                <p className="text-[11px] text-muted-foreground">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xs backdrop-blur-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-foreground">
              Ready to explore your codebase?
            </h3>
            <p className="text-xs text-muted-foreground">
              Import a repository and start asking architectural questions instantly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Button size="sm" render={<Link href="/dashboard" />}>
              <FolderGit2 className="mr-1.5 size-4" />
              Repositories
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/terms" />}>
              <FileText className="mr-1.5 size-4" />
              Terms
            </Button>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-card/30 py-8 mt-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <BrandMark />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GetDevNode. All rights reserved. Powered by Spring Boot & Next.js.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors font-semibold text-foreground">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
