import type { ComponentProps } from "react"
import { getPostMarkdownImageUrl } from "@/lib/post-assets"

type ArticleImageProps = ComponentProps<"img"> & { slug: string }

export default function ArticleImage({
  slug,
  src,
  alt,
  loading = "lazy",
  ...props
}: ArticleImageProps) {
  const source =
    typeof src === "string" && !/^(?:\/|https?:|data:)/i.test(src)
      ? getPostMarkdownImageUrl(slug, src)
      : src

  // Markdown images do not require authors to specify intrinsic dimensions.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={source} alt={alt ?? ""} loading={loading} />
}
