import type { MDXComponents } from "mdx/types"
import ArticleChart from "@/components/mdx/article-chart"
import MdxCodeBlock from "@/components/mdx/code-block"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const components = {
  ArticleChart,
  pre: MdxCodeBlock,
  table: ({ className, ...props }) => (
    <Table
      aria-label="文章表格"
      tabIndex={0}
      {...props}
      className={cn(
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
    />
  ),
  thead: TableHeader,
  tbody: TableBody,
  tfoot: TableFooter,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  caption: TableCaption,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
