"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navigationItems = [
  { label: "首页", href: "/" },
  { label: "归档", href: "/archives" },
  { label: "关于", href: "/about" },
]

const brandClassName =
  "rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"

export default function BlogHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/"
  const activeHref = normalizedPathname.startsWith("/page/")
    ? "/"
    : normalizedPathname

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)")

    function closeMenuOnDesktop() {
      if (desktop.matches) setIsMenuOpen(false)
    }

    desktop.addEventListener("change", closeMenuOnDesktop)
    return () => desktop.removeEventListener("change", closeMenuOnDesktop)
  }, [])

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:h-18 md:justify-start md:gap-10">
        <Link href="/" className={brandClassName}>
          Deep Thoughts
        </Link>

        <nav aria-label="主导航" className="hidden md:block">
          <ul className="flex items-center gap-2">
            {navigationItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-muted aria-[current=page]:font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm text-muted-foreground">
                    {item.label}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      即将上线
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger
              aria-label="打开导航菜单"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 md:hidden [&_svg]:size-5"
                />
              }
            >
              <MenuIcon aria-hidden="true" />
            </SheetTrigger>

            <SheetContent
              side="top"
              showCloseButton={false}
              className="max-h-svh gap-0 overflow-y-auto overscroll-contain rounded-b-md shadow-sm duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full motion-reduce:transition-none"
            >
              <SheetHeader className="h-16 shrink-0 flex-row items-center justify-between px-6 py-0">
                <SheetTitle className="sr-only">站点导航</SheetTitle>
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/" />}
                  className={brandClassName}
                >
                  Deep Thoughts
                </SheetClose>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <SheetClose
                    aria-label="关闭导航菜单"
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 [&_svg]:size-5"
                      />
                    }
                  >
                    <XIcon aria-hidden="true" />
                  </SheetClose>
                </div>
              </SheetHeader>

              <nav aria-label="主导航" className="px-6 pt-2 pb-4">
                <ul className="divide-y">
                  {navigationItems.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <SheetClose
                          nativeButton={false}
                          render={<Link href={item.href} />}
                          aria-current={
                            activeHref === item.href ? "page" : undefined
                          }
                          className="group flex min-h-18 items-center justify-between gap-4 rounded-sm text-xl font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                        >
                          {item.label}
                          <ArrowRightIcon
                            aria-hidden="true"
                            className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                          />
                        </SheetClose>
                      ) : (
                        <div className="flex min-h-18 items-center justify-between gap-4 text-muted-foreground">
                          <span className="text-xl font-medium tracking-tight">
                            {item.label}
                          </span>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            即将上线
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <SheetDescription className="border-t px-6 py-5 text-sm leading-relaxed">
                记录技术、生活与思考。
              </SheetDescription>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
