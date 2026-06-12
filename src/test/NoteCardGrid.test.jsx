import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NoteCardGrid from '../component/NoteCardGrid/NoteCardGrid'
import * as notesApi from '../api/notesApi'

vi.mock('../api/notesApi')

const mockNotes = [
  {
    id: '1',
    title: 'First Note',
    note: 'Content one',
    user: 'alice',
    tags: ['react'],
    topics: null,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Second Note',
    note: 'Content two',
    user: 'bob',
    tags: [],
    topics: null,
    createdAt: '2026-06-02T10:00:00Z',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  notesApi.fetchNotes.mockResolvedValue(mockNotes)
})

describe('NoteCardGrid', () => {
  it('shows a loading spinner on mount', () => {
    notesApi.fetchNotes.mockReturnValue(new Promise(() => {})) // never resolves
    render(<NoteCardGrid />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders notes after loading', async () => {
    render(<NoteCardGrid />)
    await waitFor(() => expect(screen.getByText('First Note')).toBeInTheDocument())
    expect(screen.getByText('Second Note')).toBeInTheDocument()
  })

  it('shows empty state when there are no notes', async () => {
    notesApi.fetchNotes.mockResolvedValue([])
    render(<NoteCardGrid />)
    await waitFor(() => expect(screen.getByText(/no notes yet/i)).toBeInTheDocument())
  })

  it('shows an error alert when fetchNotes fails', async () => {
    notesApi.fetchNotes.mockRejectedValue(new Error('Network error'))
    render(<NoteCardGrid />)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })

  it('opens the create dialog when "Create Note" is clicked', async () => {
    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))
    fireEvent.click(screen.getByText('Create Note'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/create note/i, { selector: 'h2' })).toBeInTheDocument()
  })

  it('creates a note and adds it to the grid', async () => {
    const user = userEvent.setup()
    const newNote = { id: '3', title: 'New Note', note: 'New content', user: 'carol', tags: [], topics: null, createdAt: new Date().toISOString() }
    notesApi.createNote.mockResolvedValue(newNote)

    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))

    await user.click(screen.getByText('Create Note'))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/title/i, { selector: 'input' }), 'New Note')
    await user.type(within(dialog).getByLabelText(/note/i, { selector: 'textarea' }), 'New content')
    await user.type(within(dialog).getByLabelText(/username/i, { selector: 'input' }), 'carol')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() => expect(screen.getByText('New Note')).toBeInTheDocument())
    expect(notesApi.createNote).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Note', note: 'New content', user: 'carol' }))
  })

  it('opens the edit dialog pre-populated with note data', async () => {
    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('First Note')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Content one')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alice')).toBeInTheDocument()
  })

  it('saves an edited note and updates the grid', async () => {
    const user = userEvent.setup()
    const updated = { ...mockNotes[0], title: 'Updated Title' }
    notesApi.updateNote.mockResolvedValue(updated)

    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    const titleInput = screen.getByDisplayValue('First Note')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(screen.getByText('Updated Title')).toBeInTheDocument())
    expect(notesApi.updateNote).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Updated Title' }))
  })

  it('opens the delete confirm dialog', async () => {
    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/are you sure/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/first note/i)).toBeInTheDocument()
  })

  it('deletes a note and removes it from the grid', async () => {
    notesApi.deleteNote.mockResolvedValue()

    render(<NoteCardGrid />)
    await waitFor(() => screen.getByText('First Note'))

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(screen.queryByText('First Note')).not.toBeInTheDocument())
    expect(notesApi.deleteNote).toHaveBeenCalledWith('1')
  })
})
