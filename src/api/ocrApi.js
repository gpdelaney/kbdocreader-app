/**
 * textType: 'block_letter' | 'cursive_letter'
 * file: File object (image or PDF)
 */
export async function uploadFile(textType, file) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf')
  const endpoint = `/v1/${textType}/${isPdf ? 'pdf' : 'file'}`

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json() // { text: string }
}
