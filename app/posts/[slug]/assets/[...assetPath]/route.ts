import path from "node:path"

import { getAllPosts, getPostBySlug } from "@/lib/posts"
import {
  getPostAssetUrl,
  getPostImagePaths,
  readPostImage,
} from "@/lib/post-assets"

export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await getAllPosts()
  const params = await Promise.all(
    posts.map(async (post) => {
      const images = await getPostImagePaths(
        path.join(process.cwd(), "content", "posts", post.slug)
      )
      if (
        !images.some(
          (assetPath) =>
            getPostAssetUrl(post.slug, assetPath.join("/")) === post.cover
        )
      ) {
        throw new Error(`content/posts/${post.slug}/index.mdx: 封面图片不存在`)
      }
      return images.map((assetPath) => ({ slug: post.slug, assetPath }))
    })
  )
  return params.flat()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; assetPath: string[] }> }
) {
  const { slug, assetPath } = await params
  if (!(await getPostBySlug(slug))) return new Response(null, { status: 404 })

  const image = await readPostImage(
    path.join(process.cwd(), "content", "posts", slug),
    assetPath
  )
  if (!image) return new Response(null, { status: 404 })

  const headers = {
    "Content-Type": image.contentType,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  }
  return new Response(new Uint8Array(image.data), { headers })
}
