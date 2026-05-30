import { Box } from '@chakra-ui/react'

export const LoadingScreen = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    width="100%"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="96"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="notebook-loader"
      aria-label="Loading"
      role="img"
    >
      <rect className="path-rect" width="16" height="20" x="4" y="2" rx="2" />
      <path className="path-vline" d="M16 2v20" />
      <path className="path-hline1" d="M2 6h4" />
      <path className="path-hline2" d="M2 10h4" />
      <path className="path-hline3" d="M2 14h4" />
      <path className="path-hline4" d="M2 18h4" />
    </svg>
  </Box>
)
