"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="切换明暗模式"
      aria-keyshortcuts="D"
      title="切换明暗模式（D）"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="size-11 text-muted-foreground hover:text-foreground [&_svg]:size-5"
    >
      <MoonIcon aria-hidden="true" className="dark:hidden" />
      <SunIcon aria-hidden="true" className="hidden dark:block" />
    </Button>
  )
}
