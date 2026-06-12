import {
  Box,
  Blockquote,
  Code,
  CodeBlock,
  HStack,
  Icon,
  Link,
  List,
  Separator,
  Text,
} from "@chakra-ui/react"
import type { MarkdownNode } from "markdown"
import { CircleCheck, CircleDashed } from "lucide-react"
import { Fragment, type ReactNode } from "react"

import { FadeImage } from "../FadeImage"
import { MarkdownHeading } from "./MarkdownHeading"
import type { MarkdownTreeProps } from "./MarkdownTree.types"

const isExternalLink = (url: string): boolean => /^(?:https?:)?\/\//.test(url)

export const MarkdownTree = ({ content }: MarkdownTreeProps) => (
  <>{renderNode(content, "root")}</>
)

const renderNode = (node: MarkdownNode | undefined, key: string): ReactNode => {
  if (!node) {
    return null
  }

  const children = renderChildren(node)

  switch (node.type) {
    case "root":
      return <Fragment key={key}>{children}</Fragment>
    case "heading":
      return (
        <MarkdownHeading key={key} depth={node.depth}>
          {children}
        </MarkdownHeading>
      )
    case "paragraph":
      return (
        <Text key={key} lineHeight="tall">
          {children}
        </Text>
      )
    case "text":
      if (node.wikilinkType === "unmatched") {
        return (
          <Text
            as="span"
            key={key}
            textDecoration="underline"
            textDecorationStyle="dashed"
            textUnderlineOffset="3px"
          >
            {node.value ?? ""}
          </Text>
        )
      }

      return <Fragment key={key}>{node.value ?? ""}</Fragment>
    case "strong":
      return (
        <Text as="strong" key={key} fontWeight="semibold">
          {children}
        </Text>
      )
    case "emphasis":
      return (
        <Text as="em" key={key}>
          {children}
        </Text>
      )
    case "delete":
      return (
        <Text as="del" key={key}>
          {children}
        </Text>
      )
    case "inlineCode":
      return (
        <Code key={key} borderRadius="sm" px="1.5" py="0.5">
          {node.value ?? ""}
        </Code>
      )
    case "code":
      return (
        <CodeBlock.Root key={key} code={node.value ?? ""} my="4">
          <CodeBlock.Content>
            <CodeBlock.Code>
              <CodeBlock.CodeText />
            </CodeBlock.Code>
          </CodeBlock.Content>
        </CodeBlock.Root>
      )
    case "blockquote":
      return (
        <Blockquote.Root key={key} my="4">
          <Blockquote.Content>{children}</Blockquote.Content>
        </Blockquote.Root>
      )
    case "list":
      return (
        <List.Root
          as={node.ordered ? "ol" : "ul"}
          key={key}
          ps="6"
          mb="4"
          listStyleType={node.ordered ? "decimal" : "disc"}
        >
          {children}
        </List.Root>
      )
    case "listItem": {
      if (typeof node.checked === "boolean") {
        return (
          <List.Item key={key} listStyleType="none" mb="1">
            <HStack align="flex-start" gap="2">
              <Icon
                as={node.checked ? CircleCheck : CircleDashed}
                boxSize="4"
                color={node.checked ? "app.successBackground" : "app.textMuted"}
                mt="0.5"
                flexShrink={0}
              />
              <Box flex="1">{children}</Box>
            </HStack>
          </List.Item>
        )
      }

      return (
        <List.Item key={key} mb="1">
          {children}
        </List.Item>
      )
    }
    case "link": {
      const href = node.url ?? ""
      return (
        <Link
          key={key}
          href={href}
          color="app.accent"
          textDecoration="underline"
          target={isExternalLink(href) ? "_blank" : undefined}
          rel={isExternalLink(href) ? "noreferrer" : undefined}
        >
          {children}
        </Link>
      )
    }
    case "image":
      return (
        <FadeImage
          key={key}
          src={node.url}
          alt={node.alt ?? ""}
          borderRadius="md"
          maxW="full"
          minH="12"
          my="4"
        />
      )
    case "thematicBreak":
      return <Separator key={key} my="6" />
    case "break":
      return <br key={key} />
    case "table":
      return (
        <Box as="table" key={key} width="full" borderCollapse="collapse" my="4">
          {children}
        </Box>
      )
    case "tableRow":
      return (
        <Box as="tr" key={key}>
          {children}
        </Box>
      )
    case "tableCell":
      return (
        <Box
          as="td"
          key={key}
          borderWidth="1px"
          borderColor="app.border"
          px="3"
          py="2"
          textAlign="left"
        >
          {children}
        </Box>
      )
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

const renderChildren = (node: MarkdownNode): ReactNode[] =>
  (node.children ?? []).map((childNode, index) =>
    renderNode(childNode, `${node.type}-${index}`),
  )
