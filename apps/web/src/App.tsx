import { Component, Suspense, type ReactNode } from "react"
import { Box } from "@chakra-ui/react"
import { Outlet, Route, Routes } from "react-router-dom"

import { AppError } from "./components/AppError/AppError"
import { HabitDetail } from "./components/HabitDetail/HabitDetail"
import { Header, HeaderSkeleton } from "./components/Header/Header"
import { Home } from "./components/Home/Home"
import { HomeStats } from "./components/HomeStats/HomeStats"
import { LoadingScreen } from "./components/LoadingScreen/LoadingScreen"
import { NotesView } from "./components/NotesView/NotesView"
import { PaletteView } from "./components/PaletteView/PaletteView"

function LoadingLayout() {
  return (
    <>
      <HeaderSkeleton />
      <LoadingScreen />
    </>
  )
}

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
    <Box minH="100dvh">
      <ErrorBoundary>
        <Suspense fallback={<LoadingLayout />}>
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
        <Route path="/tracking/:habitId" element={<HabitDetail />} />
        <Route path="/notes/:view" element={<NotesView />} />
        <Route path="/stats" element={<HomeStats />} />
        <Route path="/colors" element={<PaletteView />} />
      </Route>
    </Routes>
  )
}

export default App
