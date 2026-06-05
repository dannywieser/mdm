import { Component, Suspense, type ReactNode } from "react"
import { Box } from "@chakra-ui/react"
import { Outlet, Route, Routes } from "react-router-dom"

import { AppError } from "./components/AppError/AppError"
import { Header } from "./components/Header/Header"
import { Home } from "./components/Home/Home"
import { LoadingScreen } from "./components/LoadingScreen/LoadingScreen"
import { NotesView } from "./components/NotesView/NotesView"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? (
      <AppError message="something went wrong" />
    ) : (
      this.props.children
    )
  }
}

function AppLayout() {
  return (
    <Box h="100vh" overflow="auto">
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Header />
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </Box>
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
