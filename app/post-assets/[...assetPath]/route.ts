import path from "node:path"

import { getAllPosts } from "@/lib/posts"
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
        throw new Error(
          `content/posts/${post.slug}/index.mdx: cover image not found`
        )
      }
      const slugSegments = post.slug.split("/")
      return images.map((assetPath) => ({
        assetPath: [...slugSegments, ...assetPath],
      }))
    })
  )
  return params.flat()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetPath: string[] }> }
) {
  const { assetPath } = await params
  if (assetPath.some((segment) => segment.includes("/"))) {
    return new Response(null, { status: 404 })
  }

  // Post directories are leaves, so only one published slug can own this path.
  const requestedPath = assetPath.join("/")
  const post = (await getAllPosts()).find(({ slug }) =>
    requestedPath.startsWith(`${slug}/`)
  )
  if (!post) return new Response(null, { status: 404 })

  const image = await readPostImage(
    path.join(process.cwd(), "content", "posts", post.slug),
    assetPath.slice(post.slug.split("/").length)
  )
  if (!image) return new Response(null, { status: 404 })

  const headers = {
    "Content-Type": image.contentType,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  }
  return new Response(new Uint8Array(image.data), { headers })
}
