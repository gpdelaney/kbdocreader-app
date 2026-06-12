import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../component/FileUpload/FileUpload'
import * as ocrApi from '../api/ocrApi'

vi.mock('../api/ocrApi')
vi.mock('../Constants/constants.js', () => ({
  API_CONSTANTS: { BLOCK_LETTER: 'block_letter', CURSIVE_LETTER: 'cursive_letter' },
}))

beforeEach(() => vi.clearAllMocks())

describe('FileUpload', () => {
  it('renders the drop zone and type selector', () => {
    render(<FileUpload />)
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
    expect(screen.getByText('Block Letters')).toBeInTheDocument()
    expect(screen.getByText('Cursive Letters')).toBeInTheDocument()
  })

  it('shows file info after a valid file is selected', async () => {
    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'scan.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('scan.png')).toBeInTheDocument()
  })

  it('shows an error for unsupported file types', async () => {
    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'data.csv', { type: 'text/csv' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(/please select a png, jpeg, or pdf/i)).toBeInTheDocument()
  })

  it('shows Upload and Clear buttons after a file is selected', async () => {
    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'scan.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByRole('button', { name: /upload/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('calls uploadFile with the correct textType and file', async () => {
    const user = userEvent.setup()
    ocrApi.uploadFile.mockResolvedValue({ text: 'hello world' })

    render(<FileUpload />)

    const input = document.querySelector('input[type="file"]')
    const file = new File(['content'], 'scan.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(await screen.findByRole('button', { name: /upload/i }))

    await waitFor(() => expect(ocrApi.uploadFile).toHaveBeenCalledWith('cursive_letter', file))
  })

  it('displays the response after a successful upload', async () => {
    const user = userEvent.setup()
    ocrApi.uploadFile.mockResolvedValue({ text: 'extracted text result' })

    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })

    await user.click(await screen.findByRole('button', { name: /upload/i }))
    await waitFor(() => expect(screen.getByText('extracted text result')).toBeInTheDocument())
  })

  it('shows an error message when upload fails', async () => {
    const user = userEvent.setup()
    ocrApi.uploadFile.mockRejectedValue(new Error('Upload failed: 500'))

    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } })

    await user.click(await screen.findByRole('button', { name: /upload/i }))
    await waitFor(() => expect(screen.getByText('Upload failed: 500')).toBeInTheDocument())
  })

  it('clears file and response when Clear is clicked', async () => {
    const user = userEvent.setup()
    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'scan.png', { type: 'image/png' })] } })

    await user.click(await screen.findByRole('button', { name: /clear/i }))
    expect(screen.queryByText('scan.png')).not.toBeInTheDocument()
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
  })

  it('switches textType when a button group option is clicked', async () => {
    const user = userEvent.setup()
    ocrApi.uploadFile.mockResolvedValue({ text: 'ok' })

    render(<FileUpload />)
    await user.click(screen.getByText('Block Letters'))

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'scan.png', { type: 'image/png' })] } })
    await user.click(await screen.findByRole('button', { name: /upload/i }))

    await waitFor(() => expect(ocrApi.uploadFile).toHaveBeenCalledWith('block_letter', expect.any(File)))
  })
})
