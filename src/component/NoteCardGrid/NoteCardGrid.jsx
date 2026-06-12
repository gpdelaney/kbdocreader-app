import { useState, useEffect, useCallback } from 'react'
import {
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import NoteCard from '../NoteCard/NoteCard'
import { fetchNotes, createNote, updateNote, deleteNote } from '../../api/notesApi'

const EMPTY_FORM = { title: '', note: '', user: '', tagInput: '', tags: [], images: [] }

function noteToForm(note) {
  return { title: note.title, note: note.note, user: note.user, tagInput: '', tags: note.tags ?? [], images: [] }
}

function NoteCardGrid() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  // Delete confirm dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingNote, setDeletingNote] = useState(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setNotes(await fetchNotes())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotes() }, [loadNotes])

  // ── Shared form helpers ──────────────────────────────────────────────────

  const makeHandleChange = (setForm) => (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const makeHandleAddTag = (setForm, form) => (e) => {
    if ((e.key === 'Enter' || e.key === ',') && form.tagInput.trim()) {
      e.preventDefault()
      const tag = form.tagInput.trim().replace(/,$/, '')
      setForm(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
        tagInput: '',
      }))
    }
  }

  const makeHandleRemoveTag = (setForm) => (tag) =>
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  // ── Create ───────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setSaving(true)
    try {
      const created = await createNote({ title: createForm.title, note: createForm.note, user: createForm.user, tags: createForm.tags, images: createForm.images })
      setNotes(prev => [created, ...prev])
      setCreateOpen(false)
      setCreateForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  const handleEditOpen = (note) => {
    setEditingNote(note)
    setEditForm(noteToForm(note))
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    setSaving(true)
    try {
      const updated = await updateNote(editingNote.id, { title: editForm.title, note: editForm.note, user: editForm.user, tags: editForm.tags, images: editForm.images })
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
      setEditOpen(false)
      setEditingNote(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteOpen = (note) => {
    setDeletingNote(note)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setSaving(true)
    try {
      await deleteNote(deletingNote.id)
      setNotes(prev => prev.filter(n => n.id !== deletingNote.id))
      setDeleteOpen(false)
      setDeletingNote(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  const isValid = (form) => form.title.trim() && form.note.trim() && form.user.trim()

  const renderTagField = (form, setForm) => (
    <Box>
      <TextField
        label="Tags (press Enter or comma to add)"
        name="tagInput"
        value={form.tagInput}
        onChange={makeHandleChange(setForm)}
        onKeyDown={makeHandleAddTag(setForm, form)}
        fullWidth
      />
      {form.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
          {form.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" onDelete={() => makeHandleRemoveTag(setForm)(tag)} />
          ))}
        </Box>
      )}
    </Box>
  )

  const handleAddImages = (setForm) => (e) => {
    const incoming = Array.from(e.target.files)
    setForm(prev => {
      const existing = prev.images.map(f => f.name)
      const deduped = incoming.filter(f => !existing.includes(f.name))
      return { ...prev, images: [...prev.images, ...deduped] }
    })
    e.target.value = ''
  }

  const handleRemoveImage = (setForm, name) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(f => f.name !== name) }))
  }

  const renderFormFields = (form, setForm) => (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <TextField label="Title" name="title" value={form.title} onChange={makeHandleChange(setForm)} fullWidth required />
      <TextField label="Note" name="note" value={form.note} onChange={makeHandleChange(setForm)} fullWidth required multiline rows={4} />
      <TextField label="Username" name="user" value={form.user} onChange={makeHandleChange(setForm)} fullWidth required />
      {renderTagField(form, setForm)}

      {/* File attachments */}
      <Box>
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<AttachFileIcon />}
        >
          Attach Images
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            multiple
            hidden
            onChange={handleAddImages(setForm)}
          />
        </Button>
        {form.images.length > 0 && (
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {form.images.map(file => (
              <Box
                key={file.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                }}
              >
                <Typography variant="caption" noWrap sx={{ maxWidth: 320 }}>
                  {file.name} <Box component="span" sx={{ color: 'text.disabled' }}>({(file.size / 1024).toFixed(1)} KB)</Box>
                </Typography>
                <CloseIcon
                  fontSize="small"
                  sx={{ cursor: 'pointer', color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                  onClick={() => handleRemoveImage(setForm, file.name)}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  )

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Notes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create Note
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" color="text.disabled">No notes yet — create your first one!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {notes.map((note, index) => (
            <Grid key={note.id ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
              <NoteCard
                title={note.title}
                description={note.topics}
                noteText={note.note}
                userName={note.user}
                createdAt={note.createdAt}
                tags={note.tags}
                onEdit={() => handleEditOpen(note)}
                onDelete={() => handleDeleteOpen(note)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Note</DialogTitle>
        <DialogContent>{renderFormFields(createForm, setCreateForm)}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!isValid(createForm) || saving}
            startIcon={saving && <CircularProgress size={16} />}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>{renderFormFields(editForm, setEditForm)}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={!isValid(editForm) || saving}
            startIcon={saving && <CircularProgress size={16} />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deletingNote?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={saving}
            startIcon={saving && <CircularProgress size={16} />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NoteCardGrid
