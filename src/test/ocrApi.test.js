import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadFile } from '../api/ocrApi'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('uploadFile', () => {
  const mockResponse = { text: 'extracted text' }

  it('posts to /file endpoint for image files', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const file = new File(['img'], 'scan.png', { type: 'image/png' })
    const result = await uploadFile('cursive_letter', file)

    expect(result).toEqual(mockResponse)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/v1/cursive_letter/file')
    expect(options.method).toBe('POST')
    expect(options.body.get('file').name).toBe('scan.png')
  })

  it('posts to /pdf endpoint for pdf files', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const file = new File(['pdf'], 'document.pdf', { type: 'application/pdf' })
    await uploadFile('block_letter', file)

    const [url] = fetch.mock.calls[0]
    expect(url).toBe('/v1/block_letter/pdf')
  })

  it('uses the correct textType in the URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const file = new File(['img'], 'scan.jpg', { type: 'image/jpeg' })
    await uploadFile('block_letter', file)

    expect(fetch.mock.calls[0][0]).toBe('/v1/block_letter/file')
  })

  it('throws on error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })

    const file = new File(['img'], 'bad.png', { type: 'image/png' })
    await expect(uploadFile('cursive_letter', file)).rejects.toThrow('Upload failed: 400')
  })
})
