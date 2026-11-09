export const postsPerPage = 6

export function getTotalPostPages(postCount: number) {
  return Math.max(1, Math.ceil(postCount / postsPerPage))
}

export function getPostPageHref(page: number) {
  return page === 1 ? "/" : `/page/${page}`
}

export function getPostPageParams(postCount: number) {
  return Array.from({ length: getTotalPostPages(postCount) }, (_, index) => ({
    pagination: index === 0 ? [] : ["page", String(index + 1)],
  }))
}

export function parsePostPage(pagination?: string[]) {
  if (!pagination?.length) return 1
  if (
    pagination.length !== 2 ||
    pagination[0] !== "page" ||
    !/^[1-9]\d*$/.test(pagination[1])
  ) {
    return undefined
  }

  const page = Number(pagination[1])
  return Number.isSafeInteger(page) && page > 1 ? page : undefined
}
