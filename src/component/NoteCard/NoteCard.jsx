import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

/**
 * Parses a Postgres tsvector string into an array of unique lexemes.
 * e.g. "'brown':3 'cat':5 'quick':1" → ["brown", "cat", "quick"]
 */
function parseTsvector(tsvector) {
  if (!tsvector || typeof tsvector !== 'string') return []
  const matches = tsvector.match(/'([^']+)'(?::\d+[A-D]?(?:,\d+[A-D]?)*)*/g) ?? []
  return matches
    .map(m => m.match(/'([^']+)'/)?.[1])
    .filter(Boolean)
    .sort()
}

function NoteCard({ title, description, noteText, userName, createdAt, tags = [], onEdit, onDelete }) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  const lexemes = parseTsvector(description)

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        maxWidth: 480,
        width: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {title}
        </Typography>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {tags.map(tag => (
              <Chip key={tag} label={tag} size="small" color="secondary" />
            ))}
          </Box>
        )}


        <Divider sx={{ mb: 2 }} />

        {/* Note Text */}
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.7,
            mb: 3,
          }}
        >
          {noteText}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Footer: user + date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {userName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {formattedDate}
            </Typography>
          </Box>
        </Box>

      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5, pt: 0 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit} color="primary" aria-label="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={onDelete} color="error" aria-label="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>

    </Card>
  )
}

export default NoteCard
