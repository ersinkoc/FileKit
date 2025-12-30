import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Playground from './pages/Playground'
import GettingStarted from './pages/docs/GettingStarted'
import Upload from './pages/docs/Upload'
import DropZonePage from './pages/docs/DropZone'
import Validation from './pages/docs/Validation'
import ChunkedUpload from './pages/docs/ChunkedUpload'
import Preview from './pages/docs/Preview'
import ReactGuide from './pages/docs/React'
import APIReference from './pages/docs/API'
import Examples from './pages/Examples'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="playground" element={<Playground />} />
        <Route path="docs/getting-started" element={<GettingStarted />} />
        <Route path="docs/upload" element={<Upload />} />
        <Route path="docs/dropzone" element={<DropZonePage />} />
        <Route path="docs/validation" element={<Validation />} />
        <Route path="docs/chunked" element={<ChunkedUpload />} />
        <Route path="docs/preview" element={<Preview />} />
        <Route path="docs/react" element={<ReactGuide />} />
        <Route path="docs/api" element={<APIReference />} />
        <Route path="examples" element={<Examples />} />
      </Route>
    </Routes>
  )
}
