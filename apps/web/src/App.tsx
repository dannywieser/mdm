import { Route, Routes } from 'react-router-dom'

import { Home } from './components/Home/Home'
import { NotesList } from './components/NotesList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notes/:view" element={<NotesList />} />
    </Routes>
  )
}

export default App
