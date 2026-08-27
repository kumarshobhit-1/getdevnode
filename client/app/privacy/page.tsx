"use client";

import Link from "next/link";
import { ExternalLink, FileText, FolderGit2, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-svh flex flex-col overflow-hidden bg-background text-foreground">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.1),transparent_55%)]" />

      {/* Landing Home Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 space-y-8">
        {/* Header Card */}
        <div className="rounded-2xl border border-border/60 bg-card/90 p-6 sm:p-8 shadow-xs space-y-2 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                Privacy Policy
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Effective Date: August 2026
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            At GetDevNode, we take the confidentiality of your source code and personal data seriously. This Privacy Policy details how we collect, process, and protect your information when using our service.
          </p>
        </div>

        {/* Policy Section Cards */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li><strong>Account Information:</strong> Your GitHub username, email address, display name, and avatar URL provided via GitHub OAuth.</li>
              <li><strong>Repository Data:</strong> Repository names, branch references, AST code chunks, and metadata necessary for indexing.</li>
              <li><strong>Usage Data:</strong> Chat session query history and citation interaction metrics within your active sessions.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              2. How We Use Your Repository Data
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Source code fetched during indexing is parsed into AST chunks and processed to compute high-dimensional vector embeddings. These embeddings are stored securely to enable semantic vector retrieval and context-grounded AI answers strictly for your account. We do NOT use your private code to train public foundation models.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              3. Encryption & Access Control
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All communications with GetDevNode are encrypted in transit using TLS 1.3. GitHub OAuth access tokens are encrypted at rest using industry-standard AES-256 encryption. Vector store access is strictly partitioned by user identity.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              4. Data Retention & Deletion Rights
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You hold complete control over your indexed repositories. You may delete repository embeddings or disconnect your GitHub account at any time from the Repository Settings dashboard. Upon deletion, associated vector embeddings and chat history are permanently purged.
            </p>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xs backdrop-blur-xl">
          <span className="text-xs text-muted-foreground text-center sm:text-left">
            Review our terms of service agreement.
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" render={<Link href="/terms" />}>
              <FileText className="mr-1.5 size-4" />
              Terms & Conditions
            </Button>
            <Button size="sm" render={<Link href="/dashboard" />}>
              <FolderGit2 className="mr-1.5 size-4" />
              Repositories
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
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors font-semibold text-foreground">
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
