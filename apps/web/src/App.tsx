import { Route, Routes } from 'react-router-dom'

import { NotesList } from './components/NotesList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<NotesList />} />
    </Routes>
  )
}

export default App
