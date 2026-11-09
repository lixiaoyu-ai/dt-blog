const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isPostSlug(slug: string) {
  return slug.split("/").every((segment) => segmentPattern.test(segment))
}
