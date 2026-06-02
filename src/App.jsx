import { Container, Box, Typography } from '@mui/material'
import FileUpload from './component/FileUpload/FileUpload.jsx'

function App() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          KB Doc Reader
        </Typography>
      </Box>
      <FileUpload />
    </Container>
  )
}

export default App
