import type { Metadata } from "next"
import type { ComponentProps } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import AboutContent from "@/content/pages/about/index.mdx"
import { getAllPosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "About",
  description:
    "About Lee and Deep Thoughts, a personal blog on technology, life, and ideas.",
}

const sections = [
  { title: "About this blog", href: "#关于这里" },
  { title: "What you'll find", href: "#你会读到什么" },
]

export default async function AboutPage() {
  const [latestPost] = await getAllPosts()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm text-muted-foreground">About</p>

      <div className="mt-6 grid items-start gap-12 md:grid-cols-[minmax(0,1fr)_200px] lg:gap-20">
        <article className="min-w-0">
          <div
            lang="zh-CN"
            className="typeset typeset-blog max-w-[75ch] [&>h1+p]:text-lg [&>h1+p]:text-muted-foreground"
          >
            <AboutContent
              components={{
                h1: (props: ComponentProps<"h1">) => (
                  <h1
                    className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl"
                    {...props}
                  />
                ),
              }}
            />
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Browse posts
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </article>

        <aside
          aria-label="About page navigation"
          className="border-t pt-6 md:sticky md:top-8 md:border-0 md:pt-1"
        >
          <nav aria-label="On this page" className="hidden md:block">
            <h2 className="text-sm font-medium">On this page</h2>
            <ul className="mt-3 space-y-1">
              {sections.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    className="inline-flex min-h-10 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="md:mt-8 md:border-t md:pt-6">
            <h2 className="text-sm font-medium">Start here</h2>
            <Link
              href={latestPost ? `/posts/${latestPost.slug}` : "/"}
              className="group mt-3 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <span className="text-sm leading-7">
                {latestPost?.title ?? "Browse all posts"}
              </span>
              <span className="mt-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {latestPost ? "Read this post" : "Go to home"}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </span>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
