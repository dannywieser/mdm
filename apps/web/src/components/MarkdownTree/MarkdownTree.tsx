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

import { focusRing } from "../../theme/focusRing"
import { FadeImage } from "../FadeImage"
import { MarkdownHeading } from "./MarkdownHeading"
import type { MarkdownTreeProps } from "./MarkdownTree.types"

const isExternalLink = (url: string): boolean => /^(?:https?:)?\/\//.test(url)

export const MarkdownTree = ({ content }: MarkdownTreeProps) => (
  <>{renderNode(content, "root")}</>
)

type NodeRenderer = (node: MarkdownNode, key: string, children: ReactNode[]) => ReactNode

const nodeRenderers: Partial<Record<string, NodeRenderer>> = {
  root: (_, key, children) => <Fragment key={key}>{children}</Fragment>,
  heading: (node, key, children) => (
    <MarkdownHeading key={key} depth={node.depth}>{children}</MarkdownHeading>
  ),
  paragraph: (_, key, children) => <Text key={key} lineHeight="tall">{children}</Text>,
  text: (node, key) => {
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
    return <Fragment key={key}>{renderTextWithLineBreaks(node.value ?? "", key)}</Fragment>
  },
  strong: (_, key, children) => <Text as="strong" key={key} fontWeight="semibold">{children}</Text>,
  emphasis: (_, key, children) => <Text as="em" key={key}>{children}</Text>,
  delete: (_, key, children) => <Text as="del" key={key}>{children}</Text>,
  inlineCode: (node, key) => (
    <Code key={key} borderRadius="sm" px="1.5" py="0.5">{node.value ?? ""}</Code>
  ),
  code: (node, key) => (
    <CodeBlock.Root key={key} code={node.value ?? ""} my="4">
      <CodeBlock.Content>
        <CodeBlock.Code><CodeBlock.CodeText /></CodeBlock.Code>
      </CodeBlock.Content>
    </CodeBlock.Root>
  ),
  blockquote: (_, key, children) => (
    <Blockquote.Root key={key} my="4">
      <Blockquote.Content>{children}</Blockquote.Content>
    </Blockquote.Root>
  ),
  list: (node, key, children) => (
    <List.Root
      as={node.ordered ? "ol" : "ul"}
      key={key}
      ps="6"
      mb="4"
      listStyleType={node.ordered ? "decimal" : "disc"}
    >
      {children}
    </List.Root>
  ),
  listItem: (node, key, children) => {
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
    return <List.Item key={key} mb="1">{children}</List.Item>
  },
  link: (node, key, children) => {
    const href = node.url ?? ""
    return (
      <Link
        key={key}
        href={href}
        color="app.accent"
        textDecoration="underline"
        target={isExternalLink(href) ? "_blank" : undefined}
        rel={isExternalLink(href) ? "noreferrer" : undefined}
        {...focusRing}
      >
        {children}
      </Link>
    )
  },
  image: (node, key) => (
    <FadeImage
      key={key}
      src={node.url}
      alt={node.alt ?? ""}
      borderRadius="md"
      maxW="full"
      minH="12"
      my="4"
    />
  ),
  thematicBreak: (_, key) => <Separator key={key} my="6" />,
  break: (_, key) => <br key={key} />,
  table: (_, key, children) => (
    <Box as="table" key={key} width="full" borderCollapse="collapse" my="4">{children}</Box>
  ),
  tableRow: (_, key, children) => <Box as="tr" key={key}>{children}</Box>,
  tableCell: (_, key, children) => (
    <Box as="td" key={key} borderWidth="1px" borderColor="app.border" px="3" py="2" textAlign="left">
      {children}
    </Box>
  ),
}

const renderNode = (node: MarkdownNode | undefined, key: string): ReactNode => {
  if (!node) return null
  const children = renderChildren(node)
  const renderer = nodeRenderers[node.type]
  return renderer ? renderer(node, key, children) : <Fragment key={key}>{children}</Fragment>
}

const renderTextWithLineBreaks = (value: string, key: string): ReactNode[] =>
  value.split("\n").flatMap((line, index, lines) =>
    index < lines.length - 1
      ? [line, <br key={`${key}-break-${index}`} />]
      : [line],
  )

const renderChildren = (node: MarkdownNode): ReactNode[] =>
  (node.children ?? []).map((childNode, index) =>
    renderNode(childNode, `${node.type}-${index}`),
  )
