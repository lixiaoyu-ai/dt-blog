import type { PostMetadata } from "./posts"

export type PostArchiveMonth = {
  month: string
  posts: PostMetadata[]
}

export type PostArchiveYear = {
  year: string
  postCount: number
  months: PostArchiveMonth[]
}

export function groupPostsByYear(
  posts: readonly PostMetadata[]
): PostArchiveYear[] {
  const sortedPosts = posts
    .filter((post) => !post.draft)
    .sort(
      (left, right) =>
        right.publishedAt.localeCompare(left.publishedAt) ||
        left.slug.localeCompare(right.slug)
    )
  const years: PostArchiveYear[] = []

  for (const post of sortedPosts) {
    const year = post.publishedAt.slice(0, 4)
    const month = post.publishedAt.slice(5, 7)
    let yearGroup = years.at(-1)

    if (!yearGroup || yearGroup.year !== year) {
      yearGroup = { year, postCount: 0, months: [] }
      years.push(yearGroup)
    }

    let monthGroup = yearGroup.months.at(-1)
    if (!monthGroup || monthGroup.month !== month) {
      monthGroup = { month, posts: [] }
      yearGroup.months.push(monthGroup)
    }

    monthGroup.posts.push(post)
    yearGroup.postCount += 1
  }

  return years
}
