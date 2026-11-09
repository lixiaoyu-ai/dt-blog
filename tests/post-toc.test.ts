import assert from "node:assert/strict"
import { test } from "node:test"
import { evaluate } from "@mdx-js/mdx"
import type { Toc } from "@stefanprobst/rehype-extract-toc"
import extractToc from "@stefanprobst/rehype-extract-toc"
import exportToc from "@stefanprobst/rehype-extract-toc/mdx"
import * as runtime from "react/jsx-runtime"
import rehypeSlug from "rehype-slug"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"

import { getArticleHeadings } from "../lib/post-toc"

async function compileHeadings(source: string) {
  const compiled = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkFrontmatter, remarkGfm],
    rehypePlugins: [rehypeSlug, extractToc, exportToc],
  })
  return getArticleHeadings(compiled.tableOfContents as Toc)
}

test("从真实 MDX 编译结果生成目录，保留中文、行内格式和重复标题的锚点", async () => {
  const headings = await compileHeadings(
    [
      "---",
      'title: "不属于正文的标题"',
      "---",
      "",
      "## 中文 **标题** 与 `code`",
      "### [相关链接](/about)",
      "#### 深层详情",
      "## 中文 **标题** 与 `code`",
      "",
      "```md",
      "## 不属于目录的代码",
      "```",
      "",
      "正文包含脚注。[^note]",
      "",
      "[^note]: 脚注说明。",
    ].join("\n")
  )

  assert.deepEqual(headings, [
    { id: "中文-标题-与-code", title: "中文 标题 与 code", depth: 2 },
    { id: "相关链接", title: "相关链接", depth: 3 },
    { id: "深层详情", title: "深层详情", depth: 4 },
    { id: "中文-标题-与-code-1", title: "中文 标题 与 code", depth: 2 },
  ])
})

test("识别 Setext 标题和跳级标题，并保留一到六级标题", async () => {
  const headings = await compileHeadings(
    [
      "文章标题",
      "========",
      "",
      "二级标题",
      "--------",
      "",
      "##### 五级标题",
      "###### 六级标题",
      "",
      "## 另一部分",
    ].join("\n")
  )

  assert.deepEqual(
    headings.map(({ depth }) => depth),
    [1, 2, 5, 6, 2]
  )
  assert.deepEqual(
    headings.map(({ id }) => id),
    ["文章标题", "二级标题", "五级标题", "六级标题", "另一部分"]
  )
})

test("没有正文标题时返回空目录，围栏与 MDX 组件不会伪造标题", async () => {
  assert.deepEqual(
    await compileHeadings(
      [
        "普通正文。",
        "",
        "```md",
        "# 只是代码",
        "```",
        "",
        '<Example title="组件属性里的标题" />',
      ].join("\n")
    ),
    []
  )
})
