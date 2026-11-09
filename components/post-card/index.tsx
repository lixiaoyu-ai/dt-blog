import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { formatPostDate, type PostMetadata } from "@/lib/posts"

export default function PostCard({
  post,
  preload = false,
}: {
  post: PostMetadata
  preload?: boolean
}) {
  return (
    <article className="h-full min-w-0">
      <Link
        href={`/posts/${post.slug}`}
        aria-labelledby={`post-${post.slug}-title`}
        className="group block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Card className="h-full gap-0 overflow-hidden rounded-lg p-0 transition-shadow group-hover:shadow-sm">
          <div className="relative aspect-video shrink-0 overflow-hidden">
            <Image
              src={post.cover}
              alt=""
              fill
              preload={preload}
              sizes="(min-width: 1152px) 352px, (min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 640px) calc((100vw - 72px) / 2), calc(100vw - 32px)"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">
            <h2
              id={`post-${post.slug}-title`}
              className="text-xl leading-snug font-semibold tracking-tight"
            >
              {post.title}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-2">
              <ul
                aria-label="文章标签"
                className="flex min-w-0 flex-1 flex-wrap gap-2"
              >
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <time
                dateTime={post.publishedAt}
                className="shrink-0 py-1 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
              >
                {formatPostDate(post.publishedAt)}
              </time>
            </div>
          </div>
        </Card>
      </Link>
    </article>
  )
}
