import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import matter from "gray-matter"
import { getPostAssetUrl } from "./post-assets"

export type PostMetadata = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  cover: string
  tags: string[]
  draft: boolean
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const postsDirectory = path.join(process.cwd(), "content", "posts")

function parseMetadata(
  slug: string,
  data: Record<string, unknown>
): PostMetadata {
  function invalid(field: string, message: string): never {
    throw new Error(`content/posts/${slug}/index.mdx: ${field} ${message}`)
  }

  function text(field: string): string {
    const value = data[field]
    if (typeof value !== "string" || !value.trim()) {
      return invalid(field, "必须是非空字符串")
    }
    return value.trim()
  }

  function date(field: string): string {
    const value = text(field)
    const parsed = new Date(`${value}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    ) {
      return invalid(field, '必须是有效日期，格式为 "YYYY-MM-DD"（请加引号）')
    }
    return value
  }

  let cover: string
  try {
    cover = getPostAssetUrl(slug, text("cover"))
  } catch {
    invalid("cover", "必须是文章目录内的图片相对路径，例如 ./cover.svg")
  }
  if (typeof data.draft !== "boolean") {
    invalid("draft", "必须是 true 或 false")
  }
  if (
    !Array.isArray(data.tags) ||
    !data.tags.every((tag) => typeof tag === "string" && tag.trim())
  ) {
    invalid("tags", "必须是字符串数组")
  }

  const publishedAt = date("publishedAt")
  const updatedAt = data.updatedAt === undefined ? undefined : date("updatedAt")
  if (updatedAt && updatedAt < publishedAt) {
    invalid("updatedAt", "不能早于 publishedAt")
  }

  return {
    slug,
    title: text("title"),
    description: text("description"),
    publishedAt,
    ...(updatedAt && { updatedAt }),
    cover,
    tags: [...new Set((data.tags as string[]).map((tag) => tag.trim()))],
    draft: data.draft as boolean,
  }
}

export async function readPostsFromDirectory(
  directory: string
): Promise<PostMetadata[]> {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        if (!slugPattern.test(entry.name)) {
          throw new Error(
            `文章目录名称必须使用小写英文、数字和连字符：${entry.name}`
          )
        }
        const source = await readFile(
          path.join(directory, entry.name, "index.mdx"),
          "utf8"
        )
        return parseMetadata(entry.name, matter(source).data)
      })
  )

  return posts
    .filter((post) => !post.draft)
    .sort(
      (left, right) =>
        right.publishedAt.localeCompare(left.publishedAt) ||
        left.slug.localeCompare(right.slug)
    )
}

export const getAllPosts = cache(() => readPostsFromDirectory(postsDirectory))

export async function getPostBySlug(slug: string) {
  if (!slugPattern.test(slug)) return undefined
  return (await getAllPosts()).find((post) => post.slug === slug)
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
