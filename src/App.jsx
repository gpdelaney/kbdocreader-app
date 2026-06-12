import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Header from './component/Header/Header'
import FileUpload from './component/FileUpload/FileUpload.jsx'
import NoteCardGrid from './component/NoteCardGrid/NoteCardGrid.jsx'

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/notes" element={<NoteCardGrid />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  )
}

export default App
