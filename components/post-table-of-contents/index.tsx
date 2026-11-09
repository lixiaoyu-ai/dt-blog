"use client"

import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { ChevronDownIcon, ListIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ArticleHeading } from "@/lib/post-toc"
import { cn } from "@/lib/utils"

export default function PostTableOfContents({
  headings,
}: {
  headings: ArticleHeading[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")
  const container = useRef<HTMLElement>(null)
  const baseDepth = Math.min(...headings.map((heading) => heading.depth))

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element) => element !== null)
    let frame: number | undefined

    function updateActiveHeading() {
      frame = undefined
      let current = elements[0]?.id ?? ""

      for (const element of elements) {
        if (element.getBoundingClientRect().top > 48) break
        current = element.id
      }

      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        current = elements.at(-1)?.id ?? current
      }

      setActiveId(current)
    }

    function scheduleUpdate() {
      frame ??= window.requestAnimationFrame(updateActiveHeading)
    }

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [headings])

  useEffect(() => {
    const links = container.current?.querySelectorAll<HTMLElement>(
      'a[aria-current="location"]'
    )
    for (const link of links ?? []) {
      const viewport = link.closest<HTMLElement>(
        '[data-slot="scroll-area-viewport"]'
      )
      if (!viewport || viewport.clientHeight === 0) continue

      const linkRect = link.getBoundingClientRect()
      const viewportRect = viewport.getBoundingClientRect()
      if (linkRect.top < viewportRect.top) {
        viewport.scrollTop += linkRect.top - viewportRect.top
      } else if (linkRect.bottom > viewportRect.bottom) {
        viewport.scrollTop += linkRect.bottom - viewportRect.bottom
      }
    }
  }, [activeId, isOpen])

  function renderLinks(mobile = false) {
    return (
      <ul className="space-y-1 py-1 pr-3">
        {headings.map(({ id, title, depth }) => (
          <li key={id}>
            <a
              href={`#${encodeURIComponent(id)}`}
              aria-current={activeId === id ? "location" : undefined}
              className="flex min-h-11 items-center rounded-md py-2 pr-2 text-sm leading-6 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=location]:bg-muted aria-[current=location]:font-medium aria-[current=location]:text-foreground lg:min-h-9 lg:py-1"
              style={{ paddingInlineStart: 8 + (depth - baseDepth) * 12 }}
              onClick={() => {
                setActiveId(id)
                // Close before the native anchor jump measures the page layout.
                if (mobile) flushSync(() => setIsOpen(false))
              }}
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
            </a>
          </li>
        ))}
      </ul>
    )
  }

  if (headings.length === 0) return null

  return (
    <aside
      ref={container}
      className="mt-6 min-w-0 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-14"
    >
      <nav aria-label="Table of contents" className="hidden lg:block">
        <h2 className="mb-3 text-sm font-medium">Table of contents</h2>
        <ScrollArea className="[&_[data-slot=scroll-area-viewport]]:max-h-[calc(100svh-12rem)]">
          {renderLinks()}
        </ScrollArea>
      </nav>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="rounded-lg border bg-background lg:hidden"
      >
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              className="min-h-12 w-full justify-start gap-2 rounded-lg px-4"
            />
          }
        >
          <ListIcon aria-hidden="true" className="size-4" />
          Table of contents
          <span className="ml-auto text-xs text-muted-foreground">
            {headings.length} {headings.length === 1 ? "section" : "sections"}
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform duration-200 motion-reduce:transition-none",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t">
          <nav aria-label="Table of contents" className="p-3">
            <ScrollArea className="[&_[data-slot=scroll-area-viewport]]:max-h-[60svh]">
              {renderLinks(true)}
            </ScrollArea>
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </aside>
  )
}
