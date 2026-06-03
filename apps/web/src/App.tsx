import { Box } from "@chakra-ui/react"
import { Outlet, Route, Routes } from "react-router-dom"

import { PageTitleProvider } from "./context/PageTitle/PageTitle"
import { Header } from "./components/Header/Header"
import { Home } from "./components/Home/Home"
import { NotesView } from "./components/NotesView/NotesView"

function AppLayout() {
  return (
    <PageTitleProvider>
      <Box h="100vh" overflow="auto">
        <Header />
        <Outlet />
      </Box>
    </PageTitleProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notes/:view" element={<NotesView />} />
      </Route>
    </Routes>
  )
}

export default App
