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
      aria-label="Toggle color theme"
      aria-keyshortcuts="D"
      title="Toggle color theme (D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="size-11 text-muted-foreground hover:text-foreground [&_svg]:size-5"
    >
      <MoonIcon aria-hidden="true" className="dark:hidden" />
      <SunIcon aria-hidden="true" className="hidden dark:block" />
    </Button>
  )
}
