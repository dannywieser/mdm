import { Box, StatLabel, StatRoot, StatValueText } from "@chakra-ui/react"

import { Link } from "react-router-dom"
import type { ViewSummary } from "../../types/views"
import { HomeNotesReviewCard } from "../HomeNotesReviewCard"

export function HomeViewCard({ view }: { view: ViewSummary }) {
  if (view.count === 0) {
    return null
  }
  if (view.component === "NotesReview") {
    return <HomeNotesReviewCard view={view} />
  }
  return (
    <Box
      key={view.id}
      borderRadius="md"
      _focusWithin={{
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: "app.accent",
        outlineOffset: "2px",
      }}
    >
      <Link
        style={{ textDecoration: "none", outline: "none" }}
        to={`/notes/${view.id}`}
      >
        <StatRoot
          borderColor="app.border"
          borderRadius="md"
          borderWidth="1px"
          backgroundColor="app.panelBackground"
          px={3}
          py={2}
          size="sm"
          _hover={{ borderColor: "app.borderHover" }}
        >
          <StatLabel>{view.name}</StatLabel>
          <StatValueText>{view.count}</StatValueText>
        </StatRoot>
      </Link>
    </Box>
  )
}
