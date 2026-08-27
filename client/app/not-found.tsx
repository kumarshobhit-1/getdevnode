"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FolderGit2, Home, SearchX } from "lucide-react";

import { GetDevNodeIcon } from "@/components/icons/getdevnode-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-svh flex flex-col overflow-hidden bg-background text-foreground">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      {/* Landing Home Navbar */}
      <Navbar />

      {/* Main 404 Content */}
      <main className="relative z-10 flex-1 mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 py-12 sm:px-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/90 p-8 sm:p-10 shadow-xl backdrop-blur-xl space-y-6">
          {/* Top Icon Badge */}
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <SearchX className="size-8" />
          </div>

          <div className="space-y-2">
            <span className="font-heading text-6xl font-extrabold tracking-tight text-primary">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-balance">
              The page, route, or repository you are looking for doesn't exist, has been moved, or is temporarily unavailable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              size="sm"
              className="w-full sm:w-auto"
              render={<Link href="/" />}
            >
              <Home className="mr-1.5 size-4" />
              Return Home
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/dashboard" />}
            >
              <FolderGit2 className="mr-1.5 size-4" />
              Dashboard
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="w-full sm:w-auto text-muted-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
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
          </div>
        </div>
      </footer>
    </div>
  );
}
