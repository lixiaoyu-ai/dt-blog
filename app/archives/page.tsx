import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { groupPostsByYear } from "@/lib/post-archives"
import { formatPostDate, getAllPosts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "归档",
  description: "按年份与月份翻阅 Deep Thoughts 的全部文章。",
}

export default async function ArchivesPage() {
  const posts = await getAllPosts()
  const years = groupPostsByYear(posts)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          文章归档
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          共 {posts.length} 篇文章，按年份与月份整理。
        </p>
      </header>

      {years.length > 0 ? (
        <div className="mt-12 grid items-start gap-12 md:grid-cols-[minmax(0,1fr)_160px] lg:gap-20">
          <div className="min-w-0 space-y-14 sm:space-y-16">
            {years.map(({ year, postCount, months }) => (
              <section
                key={year}
                id={`year-${year}`}
                aria-labelledby={`heading-${year}`}
                className="scroll-mt-8 sm:grid sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-8"
              >
                <header className="mb-6 flex items-baseline gap-3 sm:mb-0 sm:block">
                  <h2
                    id={`heading-${year}`}
                    className="text-3xl font-semibold tracking-tight tabular-nums"
                  >
                    {year}
                  </h2>
                  <p className="text-sm text-muted-foreground sm:mt-2">
                    {postCount} 篇
                  </p>
                </header>

                <ol className="relative min-w-0 before:absolute before:top-3 before:bottom-0 before:left-1 before:w-px before:bg-border">
                  {months.map(({ month, posts: monthPosts }) => (
                    <li
                      key={month}
                      className="relative pb-8 pl-7 last:pb-2 sm:pl-8"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-2 left-0 size-[9px] rounded-full border border-muted-foreground bg-background ring-4 ring-background"
                      />
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-base font-medium">
                          {Number(month)} 月
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {monthPosts.length} 篇
                        </span>
                      </div>

                      <ol className="mt-3 space-y-1">
                        {monthPosts.map((post) => (
                          <li key={post.slug}>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="group -mx-3 flex min-h-14 items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-4"
                            >
                              <time
                                dateTime={post.publishedAt}
                                title={formatPostDate(post.publishedAt)}
                                className="w-10 shrink-0 text-sm leading-7 text-muted-foreground tabular-nums"
                              >
                                {post.publishedAt.slice(8)} 日
                              </time>
                              <span className="min-w-0 flex-1 text-base leading-7 font-medium [overflow-wrap:anywhere]">
                                {post.title}
                              </span>
                              <ArrowRightIcon
                                aria-hidden="true"
                                className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                              />
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          {years.length > 1 && (
            <nav
              aria-label="按年份跳转"
              className="sticky top-8 hidden border-l pl-5 md:block"
            >
              <h2 className="text-sm font-medium">按年份</h2>
              <ul className="mt-3 space-y-1">
                {years.map(({ year, postCount }) => (
                  <li key={year}>
                    <a
                      href={`#year-${year}`}
                      className="flex min-h-11 items-center justify-between gap-4 rounded-sm text-sm text-muted-foreground tabular-nums transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      <span>{year}</span>
                      <span className="text-xs">{postCount} 篇</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      ) : (
        <p className="py-16 text-sm text-muted-foreground">
          还没有发布文章，敬请期待。
        </p>
      )}
    </div>
  )
}
