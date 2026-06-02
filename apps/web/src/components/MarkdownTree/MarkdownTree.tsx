import {
  Box,
  Code,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Separator,
  Text,
} from "@chakra-ui/react"
import type { MarkdownNode } from "markdown"
import { CircleCheck, CircleDashed } from "lucide-react"
import { Fragment, type ReactNode } from "react"

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
    case "heading": {
      const depth = Math.min(Math.max(node.depth ?? 1, 1), 6)
      const headingTagByDepth: Record<number, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
        1: "h1",
        2: "h2",
        3: "h3",
        4: "h4",
        5: "h5",
        6: "h6",
      }
      const sizeByDepth: Record<number, "2xl" | "xl" | "lg" | "md" | "sm" | "xs"> = {
        1: "2xl",
        2: "xl",
        3: "lg",
        4: "md",
        5: "sm",
        6: "xs",
      }

      return (
        <Heading key={key} as={headingTagByDepth[depth]} size={sizeByDepth[depth]} mt="6" mb="3">
          {children}
        </Heading>
      )
    }
    case "paragraph":
      return (
        <Text key={key} mb="4" lineHeight="tall">
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
        <Box as="pre" key={key} bg="bg.muted" borderRadius="md" overflowX="auto" p="4" my="4">
          <Code bg="transparent" p="0">
            {node.value ?? ""}
          </Code>
        </Box>
      )
    case "blockquote":
      return (
        <Box
          as="blockquote"
          key={key}
          borderInlineStartWidth="4px"
          borderColor="border.emphasized"
          color="fg.muted"
          pl="4"
          py="1"
          my="4"
        >
          {children}
        </Box>
      )
    case "list":
      return (
        <Box
          as={node.ordered ? "ol" : "ul"}
          key={key}
          pl={node.ordered ? "6" : "6"}
          mb="4"
          listStyleType={node.ordered ? "decimal" : "disc"}
        >
          {children}
        </Box>
      )
    case "listItem": {
      if (typeof node.checked === "boolean") {
        return (
          <HStack as="li" key={key} align="flex-start" gap="2" listStyleType="none" mb="1">
            <Icon
              as={node.checked ? CircleCheck : CircleDashed}
              boxSize="4"
              color={node.checked ? "green.600" : "fg.muted"}
              mt="0.5"
              flexShrink={0}
            />
            <Box flex="1">{children}</Box>
          </HStack>
        )
      }

      return (
        <Box as="li" key={key} mb="1">
          {children}
        </Box>
      )
    }
    case "link": {
      const href = node.url ?? ""
      return (
        <Link
          key={key}
          href={href}
          color="colorPalette.fg"
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
        <Image
          key={key}
          src={node.url}
          alt={node.alt ?? ""}
          borderRadius="md"
          my="4"
          maxW="full"
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
      return <Box as="tr" key={key}>{children}</Box>
    case "tableCell":
      return (
        <Box
          as="td"
          key={key}
          borderWidth="1px"
          borderColor="border.subtle"
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
  (node.children ?? []).map((childNode, index) => renderNode(childNode, `${node.type}-${index}`))
