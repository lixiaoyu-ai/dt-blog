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
          <CodeBlockTitle>{language?.toUpperCase() ?? "Code"}</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton
              value={source}
              aria-label="Copy code"
              title="Copy code"
              className="size-11"
            />
          </CodeBlockActions>
        </CodeBlockHeader>
      )}
      <CodeBlockContent
        role="region"
        aria-label="Code block"
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
