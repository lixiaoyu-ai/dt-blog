import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import BlogHeader from "@/components/blog-header"
import BlogFooter from "@/components/blog-footer"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: { default: "Deep Thoughts", template: "%s · Deep Thoughts" },
  description: "Notes on technology, life, and ideas.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body id="top" className="flex min-h-svh flex-col">
        <ThemeProvider>
          <BlogHeader />
          <main className="flex-1">{children}</main>
          <BlogFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
