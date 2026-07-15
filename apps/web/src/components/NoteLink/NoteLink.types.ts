import type { LinkProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

export interface NoteLinkProps extends Omit<LinkProps, "asChild" | "href"> {
  note: { id: string; obsidianUrl: string }
  children: ReactNode
}
