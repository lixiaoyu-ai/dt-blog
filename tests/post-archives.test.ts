import assert from "node:assert/strict"
import { test } from "node:test"

import { groupPostsByYear } from "../lib/post-archives"
import type { PostMetadata } from "../lib/posts"

function post(
  slug: string,
  publishedAt: string,
  overrides: Partial<PostMetadata> = {}
): PostMetadata {
  return {
    slug,
    title: slug,
    description: "归档测试文章",
    publishedAt,
    cover: `/posts/${slug}/assets/cover.svg`,
    tags: [],
    draft: false,
    ...overrides,
  }
}

test("跨年、跨月分组并按发布日期降序，同日按 slug 排序", () => {
  const posts = [
    post("old-december", "2025-12-31", { updatedAt: "2026-11-09" }),
    post("zeta", "2026-11-08"),
    post("old-january", "2025-01-01"),
    post("alpha", "2026-11-08"),
    post("january", "2026-01-01"),
    post("earlier-day", "2026-11-01"),
    post("draft", "2027-01-01", { draft: true }),
  ]
  const originalOrder = posts.map(({ slug }) => slug)
  const years = groupPostsByYear(posts)

  assert.deepEqual(
    years.map(({ year, postCount, months }) => ({
      year,
      postCount,
      months: months.map(({ month, posts: monthPosts }) => ({
        month,
        slugs: monthPosts.map(({ slug }) => slug),
      })),
    })),
    [
      {
        year: "2026",
        postCount: 4,
        months: [
          { month: "11", slugs: ["alpha", "zeta", "earlier-day"] },
          { month: "01", slugs: ["january"] },
        ],
      },
      {
        year: "2025",
        postCount: 2,
        months: [
          { month: "12", slugs: ["old-december"] },
          { month: "01", slugs: ["old-january"] },
        ],
      },
    ]
  )
  assert.deepEqual(
    posts.map(({ slug }) => slug),
    originalOrder
  )
})

test("空列表与全部为草稿时都不生成年份或月份", () => {
  assert.deepEqual(groupPostsByYear([]), [])
  assert.deepEqual(
    groupPostsByYear([post("draft", "2026-11-08", { draft: true })]),
    []
  )
})
