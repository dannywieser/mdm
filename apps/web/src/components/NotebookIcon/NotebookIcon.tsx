import { chakra } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"

import type { NotebookIconProps } from "./NotebookIcon.types"

const RECT_DASH_LENGTH = 72
const VLINE_DASH_LENGTH = 22
const HLINE_DASH_LENGTH = 6

const notebookRect = keyframes`
  0%   { stroke-dashoffset: ${RECT_DASH_LENGTH}; animation-timing-function: ease-out; }
  38%  { stroke-dashoffset: 0;  animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0;  animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${RECT_DASH_LENGTH}; }
`

const notebookVline = keyframes`
  0%   { stroke-dashoffset: ${VLINE_DASH_LENGTH}; }
  38%  { stroke-dashoffset: ${VLINE_DASH_LENGTH}; animation-timing-function: ease-out; }
  48%  { stroke-dashoffset: 0;  animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0;  animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${VLINE_DASH_LENGTH}; }
`

const notebookHline1 = keyframes`
  0%   { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
  48%  { stroke-dashoffset: ${HLINE_DASH_LENGTH}; animation-timing-function: ease-out; }
  54%  { stroke-dashoffset: 0; animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0; animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
`

const notebookHline2 = keyframes`
  0%   { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
  54%  { stroke-dashoffset: ${HLINE_DASH_LENGTH}; animation-timing-function: ease-out; }
  60%  { stroke-dashoffset: 0; animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0; animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
`

const notebookHline3 = keyframes`
  0%   { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
  60%  { stroke-dashoffset: ${HLINE_DASH_LENGTH}; animation-timing-function: ease-out; }
  66%  { stroke-dashoffset: 0; animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0; animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
`

const notebookHline4 = keyframes`
  0%   { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
  66%  { stroke-dashoffset: ${HLINE_DASH_LENGTH}; animation-timing-function: ease-out; }
  72%  { stroke-dashoffset: 0; animation-timing-function: linear; }
  88%  { stroke-dashoffset: 0; animation-timing-function: ease-in; }
  100% { stroke-dashoffset: ${HLINE_DASH_LENGTH}; }
`

const ANIMATION = "2.4s infinite"

export function NotebookIcon({
  animating = false,
  ariaLabel = "Notebook",
  size = 80,
}: NotebookIconProps) {
  return (
    <chakra.svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={ariaLabel}
      role="img"
    >
      <chakra.rect
        width="16"
        height="20"
        x="4"
        y="2"
        rx="2"
        strokeDasharray={animating ? RECT_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? RECT_DASH_LENGTH : undefined}
        animation={animating ? `${notebookRect} ${ANIMATION}` : undefined}
      />
      <chakra.path
        d="M16 2v20"
        strokeDasharray={animating ? VLINE_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? VLINE_DASH_LENGTH : undefined}
        animation={animating ? `${notebookVline} ${ANIMATION}` : undefined}
      />
      <chakra.path
        d="M2 6h4"
        strokeDasharray={animating ? HLINE_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? HLINE_DASH_LENGTH : undefined}
        animation={animating ? `${notebookHline1} ${ANIMATION}` : undefined}
      />
      <chakra.path
        d="M2 10h4"
        strokeDasharray={animating ? HLINE_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? HLINE_DASH_LENGTH : undefined}
        animation={animating ? `${notebookHline2} ${ANIMATION}` : undefined}
      />
      <chakra.path
        d="M2 14h4"
        strokeDasharray={animating ? HLINE_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? HLINE_DASH_LENGTH : undefined}
        animation={animating ? `${notebookHline3} ${ANIMATION}` : undefined}
      />
      <chakra.path
        d="M2 18h4"
        strokeDasharray={animating ? HLINE_DASH_LENGTH : undefined}
        strokeDashoffset={animating ? HLINE_DASH_LENGTH : undefined}
        animation={animating ? `${notebookHline4} ${ANIMATION}` : undefined}
      />
    </chakra.svg>
  )
}
