import { isValidElement, type ComponentProps } from "react"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { highlightCode } from "@/lib/highlighter"

export default async function MdxCodeBlock({
  children,
  className,
  ...props
}: ComponentProps<"pre">) {
  const codeProps = isValidElement<ComponentProps<"code">>(children)
    ? children.props
    : undefined
  const source =
    typeof codeProps?.children === "string" ? codeProps.children : undefined
  const language = codeProps?.className?.match(/\blanguage-(\S+)/)?.[1]
  const highlightedLines =
    source !== undefined && language
      ? await highlightCode(source.replace(/\n$/, ""), language)
      : null

  return (
    <CodeBlock className="my-6">
      {source !== undefined && (
        <CodeBlockHeader>
          <CodeBlockTitle>{language?.toUpperCase() ?? "代码"}</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton
              value={source}
              aria-label="复制代码"
              title="复制代码"
              className="size-11"
            />
          </CodeBlockActions>
        </CodeBlockHeader>
      )}
      <CodeBlockContent
        role="region"
        aria-label="代码块"
        {...props}
        className={className}
        lineNumbers={source !== undefined}
      >
        {highlightedLines
          ? highlightedLines.map((line, index) => (
              <CodeBlockLine key={index}>{line}</CodeBlockLine>
            ))
          : (source ?? children)}
      </CodeBlockContent>
    </CodeBlock>
  )
}
