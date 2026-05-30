import { Route, Routes } from "react-router-dom"

import { TerminalLayout } from "./components"

function App() {
  return (
    <Routes>
      <Route path="/" element={<TerminalLayout />} />
    </Routes>
  )
}

export default App
