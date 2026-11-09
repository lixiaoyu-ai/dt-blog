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
      await mkdir(folder)
      await writeFile(
        path.join(folder, "index.mdx"),
        `---\n${JSON.stringify(data)}\n---\n\n## 正文\n`
      )
    })
  )
  return directory
}

test("读取元信息，过滤草稿，并按日期及 slug 稳定排序", async (t) => {
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
  assert.equal(posts[0].cover, "/posts/alpha/assets/cover.svg")
})

test("没有文章时返回空列表", async (t) => {
  const directory = await fixture(t, {})
  assert.deepEqual(await readPostsFromDirectory(directory), [])
  assert.deepEqual(
    await readPostsFromDirectory(path.join(directory, "missing")),
    []
  )
})

test("校验真实日期、必填字段和草稿标记，错误包含文章路径", async (t) => {
  for (const [field, value] of [
    ["publishedAt", "2026-02-30"],
    ["title", ""],
    ["draft", "false"],
    ["tags", "MDX"],
    ["cover", "../secret.png"],
  ] as const) {
    const directory = await fixture(t, {
      example: { ...metadata, [field]: value },
    })
    await assert.rejects(
      () => readPostsFromDirectory(directory),
      new RegExp(`content/posts/example/index.mdx: ${field}`)
    )
  }
})

test("保留更新时间并规范化标签，更新时间不能早于发布日期", async (t) => {
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
  await assert.rejects(() => readPostsFromDirectory(invalid), /updatedAt/)
})

test("目录 slug 保持小写英文和连字符", async (t) => {
  const directory = await fixture(t, { "Invalid Slug": metadata })
  await assert.rejects(() => readPostsFromDirectory(directory), /Invalid Slug/)
})

test("仓库示例可读取，未知 slug 和路径穿越不能读取文章", async () => {
  const posts = await getAllPosts()
  assert(posts.some((post) => post.slug === "mdx-and-charts"))
  assert.equal((await getPostBySlug("mdx-and-charts"))?.draft, false)
  assert.equal(await getPostBySlug("missing-post"), undefined)
  assert.equal(await getPostBySlug("../mdx-and-charts"), undefined)
})
