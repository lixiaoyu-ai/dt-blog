# Deep Thoughts

使用 Next.js App Router、Tailwind CSS 和 shadcn/ui 的纯静态个人博客。文章保存在仓库的 `content/posts/`，使用 `@next/mdx` 编译，支持在正文中使用 React 组件。页面与图片在构建时生成，部署后无需运行 Next.js 服务或连接数据库。

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。图表示例位于 `/posts/mdx-and-charts`，Markdown 排版样张位于 `/posts/markdown-typeset`。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 静态部署与预览

`pnpm build` 生成完整的 `out/` 目录，将其中的全部文件部署到静态托管或 CDN 即可。不要只上传 HTML，`_next/` 中的 JS、CSS、字体及页面导航资源也需要保留。

```bash
pnpm build
pnpm start
```

`pnpm start` 仅用于本地预览 `out/`，默认地址为 `http://localhost:4173`。它提供静态文件与 404 页面，不执行 Next.js 渲染；线上可直接由托管平台提供静态文件。

- 首页是 `/`，后续页为 `/page/2/`、`/page/3/`，每页 6 篇；只生成实际存在的分页，越界或未知路径返回 404。
- `trailingSlash: true` 将页面导出为目录内的 `index.html`，方便静态托管直接访问深层页面；静态主机需支持目录首页，并将找不到的路径返回 `404.html` 和 404 状态码。
- 图片通过静态 `GET` 路由在构建时输出到 `out/post-assets/<slug>/`，其中 `<slug>` 包含文章的分类路径。开发与部署使用相同的资源地址。
- 只导出已发布文章中的图片，支持子目录与中文文件名。原始 MDX、JSON、隐藏文件、符号链接和草稿文章的图片不会作为独立资源导出。MDX 引用的图表数据会随页面打包给浏览器。
- 默认的运行时图片优化已关闭；大图建议在放入文章目录前压缩并调整尺寸。
- 文章正文、归档、目录与代码高亮在构建时完成；图表、菜单、复制代码和主题切换继续在浏览器中运行。
- 内容更新后需要重新构建、发布 `out/`。旧的 `?page=2` 不再作为分页入口。

首页与分页由 `app/[[...pagination]]/page.tsx` 统一生成，只有一页时也直接使用首页，无需额外的 `/page/1` 页面。文章详情由 `app/posts/[...slug]/page.tsx` 生成。

## 新增文章

在 `content/posts/` 下按分类建目录，每层目录名使用小写英文、数字和连字符。扫描遇到 `index.mdx` 就把该目录识别为一篇文章，其子目录用于存放这篇文章的资源。文章 URL 取完整目录路径，例如 `content/posts/engineering/typescript/my-first-post/index.mdx` 对应 `/posts/engineering/typescript/my-first-post/`。

```text
content/posts/engineering/typescript/my-first-post/
├── index.mdx
├── cover.webp
├── chart-data.json
└── images/
    └── screenshot.webp
```

文章顶部填写 frontmatter：

```mdx
---
title: "我的第一篇文章"
description: "一两句话介绍文章内容，用于首页卡片和页面描述。"
publishedAt: "2026-11-08"
tags: ["写作", "MDX"]
cover: "./cover.webp"
draft: true
---

## 第一个小节

这里开始写正文。

![配图说明](./images/screenshot.webp)
```

- `title`、`description`、`publishedAt`、`tags`、`cover` 和 `draft` 为必填项。
- 日期使用带引号的 `YYYY-MM-DD`；可选 `updatedAt`，不能早于发布日期。
- 正文、封面、配图、图表数据和专用组件都放在同一个文章目录。复制或移动整个目录即可带走文章的全部资源。
- `cover` 使用文章内相对路径，例如 `./cover.webp`；正文图片同样使用 `![说明](./images/screenshot.webp)`。
- 图片支持 PNG、JPEG、WebP、AVIF、GIF 和 SVG，可以按需建立 `images/` 等子目录。
- 详情页自动显示文章主标题，正文从 `##` 开始。
- `draft: true` 的文章不会出现在首页、归档或正式详情路由中。本地预览时可临时设为 `false`，发布时保持为 `false`。
- 列表按发布日期降序排列，同一天按 slug 排序。首页每页 6 篇，后续页使用 `/page/2/` 等路径。
- 新增或修改文章后重新构建、部署；当前没有独立的在线内容后台。

`lib/posts.ts` 统一读取元信息。首页卡片、分页、归档和详情页都使用这些数据，不需要手工维护文章索引。

## 文章归档

`/archives` 按 `publishedAt` 的年份、月份展示时间轴，文章从新到旧排列，同一天按 slug 排序。只展示有文章的年份和月份，并统计文章数量；多个年份时，桌面端会显示年份跳转导航。

页面布局在 `app/archives/page.tsx`，分组逻辑在 `lib/post-archives.ts`。新增文章后无需修改归档页面，重新构建即可更新。

## 在文章中使用图表

`ArticleChart` 已在根目录的 `mdx-components.tsx` 注册，可以直接在 MDX 中使用：

```mdx
import chartData from "./chart-data.json"

<ArticleChart
  title="每周阅读量"
  description="演示数据 · 单位：次"
  data={chartData}
  xKey="day"
  yKey="views"
  xLabel="日期"
  yLabel="阅读量"
/>
```

`chart-data.json` 是对象数组，`xKey` 对应分类字段，`yKey` 对应数值字段：

```json
[
  { "day": "周一", "views": 120 },
  { "day": "周二", "views": 180 }
]
```

图表使用 Recharts，支持提示框、键盘操作、深色模式和可展开的数据表。交互代码放在 `components/mdx/article-chart.tsx`，文章正文在构建时生成静态 HTML。

## 文章详情目录

文章详情页会自动显示正文标题目录：桌面端在右侧保持可见，手机与平板使用 shadcn `Collapsible`，默认收起；长目录使用 `ScrollArea`，点击标题后跳转到正文，手机端同时收起面板。滚动阅读时会标记当前章节，并在长目录内保持该条目可见。

目录在 MDX 编译时由 `@stefanprobst/rehype-extract-toc` 及其 `/mdx` 插件导出为 `tableOfContents`，与 `rehype-slug` 共用真实标题 ID，支持中文、重复标题、行内格式和一到六级标题。代码围栏和自动生成的脚注标题不会进入目录；没有标题的文章不显示目录，也不预留侧栏。无需在 MDX 正文中手写目录，`tableOfContents` 为插件保留的导出名称。

配置在 `next.config.ts`，目录数据整理在 `lib/post-toc.ts`，交互与布局在 `components/post-table-of-contents/index.tsx` 和 `app/posts/[...slug]/page.tsx`。

## 扩展正文组件

公共组件放进 `components/mdx/`，在 `mdx-components.tsx` 中注册即可供文章复用。仅一篇文章使用的组件也可以放在该文章目录下，通过 MDX 的 `import` 引入。需要交互的组件在自己的 TSX 文件顶部添加 `"use client"`。

文章与关于页的 Markdown 正文统一使用 [shadcn Typeset](https://ui.shadcn.com/docs/typeset)，支持标题、段落、列表、引用、链接、行内代码、图片和任务列表。Markdown 表格使用 shadcn Table，标题锚点仍由 MDX 编译配置生成。

官方样式保存在 `app/typeset.css`，通过 `app/globals.css` 引入。博客预设 `.typeset-blog` 也在 `app/globals.css`：调整 `--typeset-size`、`--typeset-leading`、`--typeset-flow` 即可统一修改字号、行高和段落间距。页面只需用 `className="typeset typeset-blog"` 包裹正文，阅读宽度由页面布局控制。

`mdx-components.tsx` 只保留功能映射：图表、代码块，以及 shadcn Table 系列组件。表格的 `table`、`thead`、`tbody`、`tfoot`、`tr`、`th`、`td`、`caption` 分别映射到对应组件，保留 Markdown 的列对齐，使用 Table 自带容器横向滚动，并可用键盘聚焦表格。文章图片的相对路径解析由详情页接入。自定义交互组件可在最外层添加 `not-typeset` 或 `data-not-typeset`，避免正文样式影响内部 UI；`ArticleChart` 已添加隔离，shadcn CodeBlock 与 Table 通过官方的 `data-slot` 规则自动隔离。

Markdown 围栏代码块使用 [shadcn/ui CodeBlock](https://ui.shadcn.com/docs/components/base/code-block)，通过 `lineNumbers` 显示行号，并提供复制按钮；长代码可横向滚动，行号不参与复制。官方组件在 `components/ui/code-block.tsx`，`components/mdx/code-block.tsx` 负责将 MDX 代码文本和语言标签接到组件上。

语法高亮使用 CodeBlock 配套的 `highlightCode`（Shiki），在构建时生成彩色代码，浏览器无需加载高亮引擎。围栏标注 `mdx`、`json`、`ts`、`tsx`、`js`、`bash` 等语言即可自动高亮，浅色与深色模式分别使用 GitHub Light / Dark 主题；未标注或不支持的语言按纯文本显示，仍保留行号和复制功能。支持的语言及别名在 `lib/highlighter.tsx` 中维护。

正文排版已接入 Typeset；下列独立组件仍可根据 MDX 内容的需要选用：

| Markdown 内容                          | shadcn 官方方案                                                   | 适用范围                                                            |
| -------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| 标题、段落、列表、引用、行内代码、链接 | [Typeset](https://ui.shadcn.com/docs/typeset)                     | 已统一接入正文容器，不需要为每种 HTML 元素创建组件。                |
| 表格                                   | [Table](https://ui.shadcn.com/docs/components/base/table)         | 已接入 Markdown 标签映射，使用组件自带的行、单元格样式与滚动容器。  |
| 分隔线                                 | [Separator](https://ui.shadcn.com/docs/components/base/separator) | 独立的分隔组件；正文中的 Markdown 水平线由 Typeset 统一处理。       |
| 提示、警告                             | [Alert](https://ui.shadcn.com/docs/components/base/alert)         | 适合在 MDX 中显式插入提示，不宜把普通引用全部转换成警告。           |
| 任务列表                               | [Checkbox](https://ui.shadcn.com/docs/components/base/checkbox)   | 文档中应保持只读；目前 GFM 生成的原生禁用复选框可直接表达完成状态。 |

MDX 编译配置位于 `next.config.ts`。remark/rehype 插件使用字符串名称，兼容 Turbopack。生产环境的内容读取仅在构建时执行，首页读取元信息时不导入 MDX 正文。

## 修改关于页

`/about` 的作者介绍保存在 `content/pages/about/index.mdx`，可以直接修改 Markdown 文案。页面布局在 `app/about/page.tsx`；修改二级标题时，同步更新该文件中的 `sections` 目录项。右侧的文章入口自动读取最新发布的文章。
