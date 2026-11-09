import type { Metadata } from "next"
import type { ComponentProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { formatPostDate, getAllPosts, getPostBySlug } from "@/lib/posts"
import { getArticleHeadings } from "@/lib/post-toc"
import { cn } from "@/lib/utils"
import ArticleImage from "@/components/mdx/article-image"
import PostTableOfContents from "@/components/post-table-of-contents"

type PostPageProps = {
  params: Promise<{ slug: string[] }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug.split("/") }))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug.join("/"))
  if (!post) notFound()

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      tags: post.tags,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug.join("/"))
  if (!post) notFound()

  const { default: Content, tableOfContents } = await import(
    `@/content/posts/${post.slug}/index.mdx`
  )
  const headings = getArticleHeadings(tableOfContents)

  return (
    <article
      className={cn(
        "mx-auto grid w-full max-w-3xl items-start px-4 py-8 sm:px-6 sm:py-12",
        headings.length > 0 &&
          "lg:max-w-6xl lg:grid-cols-[minmax(0,720px)_224px] lg:justify-center lg:gap-x-16"
      )}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Back to posts
        </Link>

        <header className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt)}
            </time>
            {post.updatedAt && (
              <span>
                Updated on{" "}
                <time dateTime={post.updatedAt}>
                  {formatPostDate(post.updatedAt)}
                </time>
              </span>
            )}
          </div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-base leading-8 text-muted-foreground">
            {post.description}
          </p>
          <ul aria-label="Post tags" className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        </header>

        <Image
          src={post.cover}
          alt=""
          width={1200}
          height={675}
          preload
          sizes="(min-width: 768px) 720px, 100vw"
          className="mt-8 aspect-video w-full rounded-lg object-cover"
        />
      </div>

      {headings.length > 0 && (
        <PostTableOfContents key={post.slug} headings={headings} />
      )}

      <div className="typeset typeset-blog mt-10 max-w-[75ch] min-w-0 lg:col-start-1 lg:row-start-2">
        <Content
          components={{
            img: (props: ComponentProps<"img">) => (
              <ArticleImage {...props} slug={post.slug} />
            ),
          }}
        />
      </div>
    </article>
  )
}
