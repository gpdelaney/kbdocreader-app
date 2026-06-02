import { Box, Paper, Typography, Stack, Divider } from '@mui/material'

function ParsedText({ data }) {
  if (!data) return null

  const renderContent = () => {
    if (typeof data === 'string') {
      return (
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: 1.6,
            color: 'text.primary',
          }}
        >
          {data}
        </Typography>
      )
    }

    if (data.text) {
      return (
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: 1.6,
            color: 'text.primary',
          }}
        >
          {data.text}
        </Typography>
      )
    }

    if (data.content) {
      return (
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: 1.6,
            color: 'text.primary',
          }}
        >
          {data.content}
        </Typography>
      )
    }

    if (typeof data === 'object') {
      return (
        <Stack spacing={2}>
          {Object.entries(data).map(([key, value]) => (
            <Box key={key}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textTransform: 'capitalize',
                }}
              >
                {key}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
                {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Stack>
      )
    }

    return (
      <Typography variant="body1" sx={{ color: 'text.primary' }}>
        {String(data)}
      </Typography>
    )
  }

  return (
    <Paper
      sx={{
        mt: 4,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Parsed Response
      </Typography>
      <Box
        sx={{
          backgroundColor: 'background.default',
          p: 2,
          borderRadius: 1,
          maxHeight: 600,
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {renderContent()}
      </Box>
    </Paper>
  )
}

export default ParsedText
