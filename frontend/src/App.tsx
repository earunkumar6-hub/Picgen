import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ImageStudio } from './pages/ImageStudio'
import { PromptBuilder } from './pages/PromptBuilder'
import { Templates } from './pages/Templates'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="builder" element={<PromptBuilder />} />
        <Route path="studio" element={<ImageStudio />} />
        <Route path="templates" element={<Templates />} />
      </Route>
    </Routes>
  )
}

export default App
