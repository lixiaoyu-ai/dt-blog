import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PostCard from "@/components/post-card"
import PostPagination from "@/components/post-pagination"
import { getAllPosts } from "@/lib/posts"
import {
  getPostPageParams,
  getTotalPostPages,
  parsePostPage,
  postsPerPage,
} from "@/lib/post-pagination"

type PageProps = {
  params: Promise<{ pagination?: string[] }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getPostPageParams((await getAllPosts()).length)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = parsePostPage((await params).pagination)
  return page && page > 1 ? { title: `文章列表 · 第 ${page} 页` } : {}
}

export default async function Page({ params }: PageProps) {
  const posts = await getAllPosts()
  const currentPage = parsePostPage((await params).pagination)
  const totalPages = getTotalPostPages(posts.length)

  if (currentPage === undefined || currentPage > totalPages) {
    notFound()
  }

  const visiblePosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">最新文章</h1>
        <p className="text-sm text-muted-foreground">{posts.length} 篇文章</p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} preload={index === 0} />
        ))}
        {posts.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-muted-foreground">
            还没有发布文章，敬请期待。
          </p>
        )}
      </div>
      {posts.length > 0 && (
        <PostPagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  )
}
