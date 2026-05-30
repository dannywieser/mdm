import { Route, Routes } from 'react-router-dom'

import { Terminal } from './components/Terminal'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Terminal />} />
    </Routes>
  )
}

export default App
