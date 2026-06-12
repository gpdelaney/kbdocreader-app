import { useState, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress, ButtonGroup,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ParsedText from '../ParsedText/ParsedText'
import { uploadFile } from '../../api/ocrApi'
import { API_CONSTANTS } from '../../Constants/constants.js'

function FileUpload() {
  const [textType, setTexttype] = useState(API_CONSTANTS.CURSIVE_LETTER)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']
  const ACCEPTED_EXTENSIONS = ['.png', '.jpeg', '.jpg', '.pdf']

  const isValidFile = (file) => {
    return ACCEPTED_TYPES.includes(file.type) ||
           ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  const handleFile = (file) => {
    if (!file) return

    if (!isValidFile(file)) {
      setError('Please select a PNG, JPEG, or PDF file')
      return
    }

    setFile(file)
    setError(null)
    setResponse(null)
  }

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const data = await uploadFile(textType, file)
      setResponse(data)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setResponse(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Upload Document
      </Typography>

      <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ mb: 3 }}>
        <Button
          onClick={() => setTexttype(API_CONSTANTS.BLOCK_LETTER)}
          sx={{
            backgroundColor: textType === API_CONSTANTS.BLOCK_LETTER ? 'primary.dark' : 'primary.main',
            boxShadow: textType === API_CONSTANTS.BLOCK_LETTER ? 'inset 0 2px 6px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          Block Letters
        </Button>
        <Button
          onClick={() => setTexttype(API_CONSTANTS.CURSIVE_LETTER)}
          sx={{
            backgroundColor: textType === API_CONSTANTS.CURSIVE_LETTER ? 'primary.dark' : 'primary.main',
            boxShadow: textType === API_CONSTANTS.CURSIVE_LETTER ? 'inset 0 2px 6px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          Cursive Letters
        </Button>
      </ButtonGroup>

      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".png,.jpg,.jpeg,.pdf"
          style={{ display: 'none' }}
        />

        {file ? (
          <Stack alignItems="center" spacing={1}>
            <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={1}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Drag and drop your file here
            </Typography>
            <Typography variant="body2" color="textSecondary">
              or click to select
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              Supported: PNG, JPEG, PDF
            </Typography>
          </Stack>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {file && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
        </Stack>
      )}

      {response && <ParsedText data={response} />}
    </Box>
  )
}

export default FileUpload
