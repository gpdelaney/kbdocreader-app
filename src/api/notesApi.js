const BASE = '/v1'

export async function fetchNotes() {
  const res = await fetch(`${BASE}/notes`)
  if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`)
  return res.json()
}

export async function fetchNote(id) {
  const res = await fetch(`${BASE}/note/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch note: ${res.status}`)
  return res.json()
}

export async function createNote({ title, note, user, tags = [], images = [] }) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('note', note)
  formData.append('user', user)
  tags.forEach(tag => formData.append('tags', tag))
  images.forEach(img => formData.append('images', img))

  const res = await fetch(`${BASE}/note`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Failed to create note: ${res.status}`)
  return res.json()
}

export async function updateNote(id, { title, note, user, tags = [], images = [] }) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('note', note)
  formData.append('user', user)
  tags.forEach(tag => formData.append('tags', tag))
  images.forEach(img => formData.append('images', img))

  const res = await fetch(`${BASE}/note/${id}`, {
    method: 'PUT',
    body: formData,
  })
  if (!res.ok) throw new Error(`Failed to update note: ${res.status}`)
  return res.json()
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE}/note/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete note: ${res.status}`)
}
