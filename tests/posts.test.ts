import assert from "node:assert/strict"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test, type TestContext } from "node:test"

import {
  getAllPosts,
  getPostBySlug,
  readPostsFromDirectory,
} from "../lib/posts"

const metadata = {
  title: "示例文章",
  description: "用于验证文章读取的内容。",
  publishedAt: "2026-11-08",
  cover: "./cover.svg",
  tags: ["MDX"],
  draft: false,
}

async function fixture(
  t: TestContext,
  posts: Record<string, Record<string, unknown>>
) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dt-blog-posts-"))
  t.after(() => rm(directory, { recursive: true, force: true }))
  await Promise.all(
    Object.entries(posts).map(async ([slug, data]) => {
      const folder = path.join(directory, slug)
      await mkdir(folder, { recursive: true })
      await writeFile(
        path.join(folder, "index.mdx"),
        `---\n${JSON.stringify(data)}\n---\n\n## 正文\n`
      )
    })
  )
  return directory
}

test("Reads metadata, filters drafts, and sorts by date and slug", async (t) => {
  const directory = await fixture(t, {
    zeta: metadata,
    alpha: { ...metadata, title: "另一篇文章" },
    older: { ...metadata, publishedAt: "2026-11-01" },
    draft: { ...metadata, draft: true },
  })
  await writeFile(path.join(directory, ".gitkeep"), "")
  const posts = await readPostsFromDirectory(directory)
  assert.deepEqual(
    posts.map((post) => post.slug),
    ["alpha", "zeta", "older"]
  )
  assert.equal(posts[0].title, "另一篇文章")
  assert.equal(posts[0].description, metadata.description)
  assert.equal(posts[0].cover, "/post-assets/alpha/cover.svg")
})

test("Discovers nested posts and stops scanning once a directory contains index.mdx", async (t) => {
  const directory = await fixture(t, {
    "notes/typescript/intro": metadata,
    "tutorials/intro": metadata,
    "notes/typescript/intro/images/ignored": { ...metadata, title: "" },
    "notes/drafts/hidden": { ...metadata, draft: true },
  })
  await mkdir(path.join(directory, "empty"))

  const posts = await readPostsFromDirectory(directory)
  assert.deepEqual(
    posts.map((post) => post.slug),
    ["notes/typescript/intro", "tutorials/intro"]
  )
  assert.equal(posts[0].cover, "/post-assets/notes/typescript/intro/cover.svg")
})

test("Returns an empty list when there are no posts", async (t) => {
  const directory = await fixture(t, {})
  assert.deepEqual(await readPostsFromDirectory(directory), [])
  assert.deepEqual(
    await readPostsFromDirectory(path.join(directory, "missing")),
    []
  )
})

test("Reports invalid metadata with the post path and field name", async (t) => {
  for (const [field, value] of [
    ["publishedAt", "2026-02-30"],
    ["title", ""],
    ["draft", "false"],
    ["tags", "MDX"],
    ["cover", "../secret.png"],
  ] as const) {
    const directory = await fixture(t, {
      "category/example": { ...metadata, [field]: value },
    })
    await assert.rejects(
      () => readPostsFromDirectory(directory),
      new RegExp(`content/posts/category/example/index.mdx: ${field}`)
    )
  }
})

test("Normalizes tags and requires the update date to follow publication", async (t) => {
  const directory = await fixture(t, {
    example: {
      ...metadata,
      tags: [" MDX ", "MDX", "图表"],
      updatedAt: "2026-11-09",
    },
  })
  const [post] = await readPostsFromDirectory(directory)
  assert.equal(post.updatedAt, "2026-11-09")
  assert.deepEqual(post.tags, ["MDX", "图表"])

  const invalid = await fixture(t, {
    example: { ...metadata, updatedAt: "2026-11-01" },
  })
  await assert.rejects(
    () => readPostsFromDirectory(invalid),
    /updatedAt must be on or after publishedAt/
  )
})

test("Rejects post slugs with characters other than lowercase letters, numbers, and hyphens", async (t) => {
  const directory = await fixture(t, { "Invalid Slug": metadata })
  await assert.rejects(
    () => readPostsFromDirectory(directory),
    /Invalid post directory name "Invalid Slug"/
  )
})

test("Reads published examples and rejects unknown slugs and path traversal", async () => {
  const posts = await getAllPosts()
  assert(posts.some((post) => post.slug === "mdx-and-charts"))
  assert.equal((await getPostBySlug("mdx-and-charts"))?.draft, false)
  assert.equal(await getPostBySlug("missing-post"), undefined)
  assert.equal(await getPostBySlug("../mdx-and-charts"), undefined)
})
