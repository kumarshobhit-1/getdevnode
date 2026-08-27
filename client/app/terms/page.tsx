"use client";

import Link from "next/link";
import { ExternalLink, FileText, FolderGit2, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
              <FileText className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                Terms & Conditions
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Effective Date: August 2026
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            Please read these Terms & Conditions carefully before using the GetDevNode platform. By connecting your GitHub account and importing repositories into GetDevNode, you agree to be bound by these terms.
          </p>
        </div>

        {/* Section Cards matching repo-card styling */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              1. Acceptance of Terms & Service Description
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GetDevNode provides artificial intelligence tools for source code indexing, vector retrieval, and repository question answering. Access to the service is granted subject to compliance with these Terms. We reserve the right to update these terms at any time.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              2. GitHub OAuth Authentication & Repository Authorization
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You authorize GetDevNode to access your connected GitHub account using OAuth authentication tokens. You affirm that you hold necessary administrative rights, ownership, or permission to index the repositories you submit to GetDevNode.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              3. Acceptable Use & Security Responsibilities
            </h2>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>You agree not to use GetDevNode for malicious code analysis or reverse-engineering proprietary software without authorization.</li>
              <li>You are responsible for maintaining the security of your GitHub credentials and access tokens.</li>
              <li>You agree not to attempt to breach, bypass, or flood the API rate limits or vector processing services.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              4. Code Embeddings & Data Ownership
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You retain full ownership of your source code and intellectual property. GetDevNode computes vector embeddings exclusively for providing search and chat functionality within your authorized workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/90 p-6 space-y-3 shadow-xs backdrop-blur-xl">
            <h2 className="text-base font-semibold font-heading text-foreground">
              5. Limitation of Liability
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GetDevNode is provided on an "as is" and "as available" basis without warranties of any kind. GetDevNode shall not be liable for direct, indirect, incidental, or consequential damages resulting from service interruptions or AI answer generation accuracy.
            </p>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xs backdrop-blur-xl">
          <span className="text-xs text-muted-foreground text-center sm:text-left">
            Questions about our terms? Contact our support team.
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" render={<Link href="/privacy" />}>
              <ShieldCheck className="mr-1.5 size-4" />
              Privacy Policy
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
            <Link href="/terms" className="hover:text-foreground transition-colors font-semibold text-foreground">
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
