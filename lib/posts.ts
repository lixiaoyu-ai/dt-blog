import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import matter from "gray-matter"
import { z } from "zod"
import { getPostAssetUrl } from "./post-assets"
import { isPostSlug } from "./post-slug"

const postsDirectory = path.join(process.cwd(), "content", "posts")
const coverError =
  "must be a relative image path within the post directory, such as ./cover.svg"
const tagsError = "must be an array of non-empty strings"

function nonEmptyText(error = "must be a non-empty string") {
  return z.string({ error }).trim().min(1, { error })
}

const postDate = nonEmptyText().pipe(
  z.iso.date({
    error:
      'must be a valid date in "YYYY-MM-DD" format. Quote the value in frontmatter.',
  })
)

const postMetadataSchema = z
  .object({
    slug: z.string(),
    title: nonEmptyText(),
    description: nonEmptyText(),
    publishedAt: postDate,
    updatedAt: postDate.optional(),
    cover: nonEmptyText(coverError),
    tags: z
      .array(nonEmptyText(tagsError), { error: tagsError })
      .transform((tags) => [...new Set(tags)]),
    draft: z.boolean({ error: "must be true or false" }),
  })
  .refine(
    ({ publishedAt, updatedAt }) =>
      updatedAt === undefined || updatedAt >= publishedAt,
    { path: ["updatedAt"], error: "must be on or after publishedAt" }
  )
  .transform(({ updatedAt, ...metadata }, ctx) => {
    try {
      return {
        ...metadata,
        ...(updatedAt && { updatedAt }),
        cover: getPostAssetUrl(metadata.slug, metadata.cover),
      }
    } catch {
      ctx.issues.push({
        code: "custom",
        path: ["cover"],
        message: coverError,
        input: metadata.cover,
      })
      return z.NEVER
    }
  })

export type PostMetadata = z.output<typeof postMetadataSchema>

function parseMetadata(
  slug: string,
  data: Record<string, unknown>
): PostMetadata {
  const result = postMetadataSchema.safeParse({ ...data, slug })
  if (!result.success) {
    const [issue] = result.error.issues
    throw new Error(
      `content/posts/${slug}/index.mdx: ${issue.path.join(".")} ${issue.message}`
    )
  }
  return result.data
}

async function readPostTree(
  directory: string,
  slug = ""
): Promise<PostMetadata[]> {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (!slug && (error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }

  if (
    slug &&
    entries.some((entry) => entry.name === "index.mdx" && entry.isFile())
  ) {
    const source = await readFile(path.join(directory, "index.mdx"), "utf8")
    return [parseMetadata(slug, matter(source).data)]
  }

  const branches = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        if (!isPostSlug(entry.name)) {
          throw new Error(
            `Invalid post directory name "${entry.name}". Use lowercase letters, numbers, and hyphens.`
          )
        }
        return readPostTree(
          path.join(directory, entry.name),
          slug ? `${slug}/${entry.name}` : entry.name
        )
      })
  )
  return branches.flat()
}

export async function readPostsFromDirectory(
  directory: string
): Promise<PostMetadata[]> {
  return (await readPostTree(directory))
    .filter((post) => !post.draft)
    .sort(
      (left, right) =>
        right.publishedAt.localeCompare(left.publishedAt) ||
        left.slug.localeCompare(right.slug)
    )
}

export const getAllPosts = cache(() => readPostsFromDirectory(postsDirectory))

export async function getPostBySlug(slug: string) {
  if (!isPostSlug(slug)) return undefined
  return (await getAllPosts()).find((post) => post.slug === slug)
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}

export function formatPostCount(count: number) {
  return `${count} ${count === 1 ? "post" : "posts"}`
}
