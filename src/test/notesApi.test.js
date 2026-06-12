import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchNotes, fetchNote, createNote, updateNote, deleteNote } from '../api/notesApi'

const mockNote = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note',
  note: 'Test content',
  user: 'testuser',
  tags: ['tag1', 'tag2'],
  topics: null,
  createdAt: '2026-06-01T10:00:00Z',
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchNotes', () => {
  it('returns a list of notes on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockNote]),
    })

    const notes = await fetchNotes()
    expect(notes).toEqual([mockNote])
    expect(fetch).toHaveBeenCalledWith('/v1/notes')
  })

  it('throws when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchNotes()).rejects.toThrow('Failed to fetch notes: 500')
  })
})

describe('fetchNote', () => {
  it('fetches a single note by id', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNote),
    })

    const note = await fetchNote(mockNote.id)
    expect(note).toEqual(mockNote)
    expect(fetch).toHaveBeenCalledWith(`/v1/note/${mockNote.id}`)
  })

  it('throws on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(fetchNote('bad-id')).rejects.toThrow('Failed to fetch note: 404')
  })
})

describe('createNote', () => {
  it('posts the correct multipart form data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNote),
    })

    const result = await createNote({
      title: 'Test Note',
      note: 'Test content',
      user: 'testuser',
      tags: ['tag1', 'tag2'],
      images: [],
    })

    expect(result).toEqual(mockNote)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/v1/note')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('title')).toBe('Test Note')
    expect(options.body.get('note')).toBe('Test content')
    expect(options.body.get('user')).toBe('testuser')
    expect(options.body.getAll('tags')).toEqual(['tag1', 'tag2'])
  })

  it('appends image files to the form data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNote),
    })

    const file = new File(['content'], 'photo.png', { type: 'image/png' })
    await createNote({ title: 'T', note: 'N', user: 'U', tags: [], images: [file] })

    const formData = fetch.mock.calls[0][1].body
    const images = formData.getAll('images')
    expect(images).toHaveLength(1)
    expect(images[0].name).toBe('photo.png')
  })

  it('throws on error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    await expect(createNote({ title: 'T', note: 'N', user: 'U' })).rejects.toThrow('Failed to create note: 400')
  })
})

describe('updateNote', () => {
  it('sends a PUT request with updated fields', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockNote, title: 'Updated' }),
    })

    const result = await updateNote(mockNote.id, {
      title: 'Updated',
      note: 'Updated content',
      user: 'testuser',
      tags: [],
      images: [],
    })

    expect(result.title).toBe('Updated')
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe(`/v1/note/${mockNote.id}`)
    expect(options.method).toBe('PUT')
    expect(options.body.get('title')).toBe('Updated')
  })

  it('throws on error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(updateNote('bad-id', { title: 'T', note: 'N', user: 'U' })).rejects.toThrow('Failed to update note: 404')
  })
})

describe('deleteNote', () => {
  it('sends a DELETE request', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    await deleteNote(mockNote.id)
    expect(fetch).toHaveBeenCalledWith(`/v1/note/${mockNote.id}`, { method: 'DELETE' })
  })

  it('throws on error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(deleteNote(mockNote.id)).rejects.toThrow('Failed to delete note: 500')
  })
})
