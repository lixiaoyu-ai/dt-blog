import "server-only"

import { createHash } from "node:crypto"
import { readdir, readFile, realpath } from "node:fs/promises"
import path from "node:path"

const imageTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
}

function imagePathSegments(relativePath: string) {
  const segments = relativePath.replace(/^\.\//, "").split("/")
  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        /[\\\0?#]/.test(segment)
    ) ||
    !imageTypes[path.extname(segments.at(-1) ?? "").toLowerCase()]
  ) {
    return undefined
  }
  return segments
}

export function getPostAssetUrl(slug: string, relativePath: string) {
  const segments = imagePathSegments(relativePath)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !segments) {
    throw new Error(
      "图片必须使用文章目录内的相对路径，例如 ./cover.svg 或 ./images/photo.webp"
    )
  }
  return `/posts/${slug}/assets/${segments.map(encodeURIComponent).join("/")}`
}

export function getPostMarkdownImageUrl(slug: string, relativeUrl: string) {
  let relativePath: string
  try {
    // Markdown already URL-encodes spaces and non-ASCII filename characters.
    relativePath = decodeURIComponent(relativeUrl)
  } catch {
    relativePath = relativeUrl
  }
  return getPostAssetUrl(slug, relativePath)
}

export async function getPostImagePaths(articleDirectory: string) {
  const images: string[][] = []

  async function visit(segments: string[]) {
    const entries = await readdir(path.join(articleDirectory, ...segments), {
      withFileTypes: true,
    })

    for (const entry of entries.sort((left, right) =>
      left.name.localeCompare(right.name)
    )) {
      if (entry.name.startsWith(".")) continue
      const assetPath = [...segments, entry.name]
      if (entry.isDirectory()) {
        await visit(assetPath)
      } else if (entry.isFile() && imagePathSegments(assetPath.join("/"))) {
        images.push(assetPath)
      }
    }
  }

  await visit([])
  return images
}

export async function readPostImage(
  articleDirectory: string,
  assetPath: string[]
) {
  if (assetPath.some((segment) => segment.includes("/"))) return undefined
  const segments = imagePathSegments(assetPath.join("/"))
  if (!segments) return undefined

  try {
    const root = await realpath(articleDirectory)
    const filename = await realpath(path.join(root, ...segments))
    if (!filename.startsWith(`${root}${path.sep}`)) return undefined
    const contentType = imageTypes[path.extname(filename).toLowerCase()]
    if (!contentType) return undefined

    const data = await readFile(filename)
    return {
      data,
      contentType,
      etag: `"${createHash("sha256").update(data).digest("hex")}"`,
    }
  } catch (error) {
    if (
      ["ENOENT", "ENOTDIR", "EISDIR"].includes(
        (error as NodeJS.ErrnoException).code ?? ""
      )
    ) {
      return undefined
    }
    throw error
  }
}
