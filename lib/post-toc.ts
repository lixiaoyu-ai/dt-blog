import type { Toc } from "@stefanprobst/rehype-extract-toc"

export type ArticleHeading = {
  id: string
  title: string
  depth: number
}

export function getArticleHeadings(tableOfContents: Toc): ArticleHeading[] {
  const headings: ArticleHeading[] = []

  function collect(entries: Toc) {
    for (const entry of entries) {
      // GFM adds this hidden heading for footnotes, outside the article outline.
      if (entry.id && entry.id !== "footnote-label" && entry.value.trim()) {
        headings.push({
          id: entry.id,
          title: entry.value.trim(),
          depth: entry.depth,
        })
      }
      if (entry.children) collect(entry.children)
    }
  }

  collect(tableOfContents)
  return headings
}
