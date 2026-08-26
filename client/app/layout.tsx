import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Slab, Public_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/providers/theme-provider';
import QueryProvider from "@/components/providers/query-provider";

const publicSansHeading = Public_Sans({ subsets: ['latin'], variable: '--font-heading' });

const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-serif' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Get Dev Node",
  description: "Get Dev Node build by developer for developer!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-serif", robotoSlab.variable, publicSansHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
