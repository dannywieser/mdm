import { Box } from "@chakra-ui/react"
import { Outlet, Route, Routes } from "react-router-dom"

import { Header } from "./components/Header/Header"
import { Home } from "./components/Home/Home"
import { NotesList } from "./components/NotesList/NotesList"
import { NotesReview } from "./components/NotesReview/NotesReview"

function AppLayout() {
  return (
    <Box h="100vh" overflow="auto">
      <Header />
      <Outlet />
    </Box>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notes/:view" element={<NotesList />} />
        <Route path="/notes/:view/review" element={<NotesReview />} />
      </Route>
    </Routes>
  )
}

export default App
