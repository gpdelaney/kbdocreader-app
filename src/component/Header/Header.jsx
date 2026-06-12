import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import GridViewIcon from '@mui/icons-material/GridView'
import { NavLink } from 'react-router-dom'

function Header() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <DescriptionIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          KB Doc Reader
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={NavLink}
            to="/upload"
            color="inherit"
            startIcon={<CloudUploadIcon />}
            sx={{
              opacity: 0.75,
              '&.active': { opacity: 1, borderBottom: '2px solid white' },
            }}
          >
            Upload
          </Button>

          <Button
            component={NavLink}
            to="/notes"
            color="inherit"
            startIcon={<GridViewIcon />}
            sx={{
              opacity: 0.75,
              '&.active': { opacity: 1, borderBottom: '2px solid white' },
            }}
          >
            Notes
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
