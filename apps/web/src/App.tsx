import { Box } from "@chakra-ui/react"
import { Outlet, Route, Routes } from "react-router-dom"

import { Header } from "./components/Header/Header"
import { Home } from "./components/Home/Home"
import { NotesList } from "./components/NotesList/NotesList"

const HEADER_CONTENT_OFFSET = 10

function AppLayout() {
  return (
    <Box h="100vh" overflow="auto" position="relative">
      <Header />
      <Box pt={HEADER_CONTENT_OFFSET}>
        <Outlet />
      </Box>
    </Box>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notes/:view" element={<NotesList />} />
      </Route>
    </Routes>
  )
}

export default App
