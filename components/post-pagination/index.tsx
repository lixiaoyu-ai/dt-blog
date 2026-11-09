import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { getPostPageHref } from "@/lib/post-pagination"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

type PostPaginationProps = {
  currentPage: number
  totalPages: number
}

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start",
      ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index),
    ]
  }

  return [
    1,
    "start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end",
    totalPages,
  ]
}

const edgeClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium"

export default function PostPagination({
  currentPage,
  totalPages,
}: PostPaginationProps) {
  const pageCount = Math.max(1, Math.trunc(totalPages))
  const page = Math.min(pageCount, Math.max(1, Math.trunc(currentPage)))
  const pageItems = getPageItems(page, pageCount)

  return (
    <Pagination aria-label="文章列表分页" className="mt-8 block border-t pt-6">
      <PaginationContent className="grid w-full grid-cols-[1fr_auto_1fr] gap-2">
        <PaginationItem className="justify-self-start">
          {page > 1 ? (
            <PaginationLink
              href={getPostPageHref(page - 1)}
              size="default"
              aria-label="上一页"
              rel="prev"
              className={edgeClassName}
            >
              <ChevronLeftIcon aria-hidden="true" />
              上一页
            </PaginationLink>
          ) : (
            <span
              role="link"
              aria-disabled="true"
              className={`${edgeClassName} text-muted-foreground opacity-50`}
            >
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
              上一页
            </span>
          )}
        </PaginationItem>

        <PaginationItem>
          <p className="text-center text-sm tabular-nums sm:hidden">
            <span className="sr-only">第</span>
            <span className="font-medium">{page}</span>
            <span className="mx-2 text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="sr-only">页，共</span>
            <span className="text-muted-foreground">{pageCount}</span>
            <span className="sr-only">页</span>
          </p>

          <ol aria-label="页码" className="hidden items-center gap-1 sm:flex">
            {pageItems.map((item) => (
              <li key={item}>
                {typeof item === "number" ? (
                  item === page ? (
                    <span
                      aria-current="page"
                      className="inline-flex size-11 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background tabular-nums"
                    >
                      <span className="sr-only">第</span>
                      {item}
                      <span className="sr-only">页，当前页</span>
                    </span>
                  ) : (
                    <PaginationLink
                      href={getPostPageHref(item)}
                      aria-label={`前往第 ${item} 页`}
                      className="size-11 rounded-lg tabular-nums"
                    >
                      {item}
                    </PaginationLink>
                  )
                ) : (
                  <PaginationEllipsis className="size-11" />
                )}
              </li>
            ))}
          </ol>
        </PaginationItem>

        <PaginationItem className="justify-self-end">
          {page < pageCount ? (
            <PaginationLink
              href={getPostPageHref(page + 1)}
              size="default"
              aria-label="下一页"
              rel="next"
              className={edgeClassName}
            >
              下一页
              <ChevronRightIcon aria-hidden="true" />
            </PaginationLink>
          ) : (
            <span
              role="link"
              aria-disabled="true"
              className={`${edgeClassName} text-muted-foreground opacity-50`}
            >
              下一页
              <ChevronRightIcon aria-hidden="true" className="size-4" />
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
