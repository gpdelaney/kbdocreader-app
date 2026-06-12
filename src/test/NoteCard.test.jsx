import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NoteCard from '../component/NoteCard/NoteCard'

const baseProps = {
  title: 'My Note',
  noteText: 'Some note content',
  userName: 'john.doe',
  createdAt: '2026-06-01T10:00:00Z',
  tags: [],
}

describe('NoteCard', () => {
  it('renders title, noteText and username', () => {
    render(<NoteCard {...baseProps} />)
    expect(screen.getByText('My Note')).toBeInTheDocument()
    expect(screen.getByText('Some note content')).toBeInTheDocument()
    expect(screen.getByText('john.doe')).toBeInTheDocument()
  })

  it('formats the createdAt date', () => {
    render(<NoteCard {...baseProps} />)
    expect(screen.getByText('Jun 1, 2026')).toBeInTheDocument()
  })

  it('renders a dash when createdAt is missing', () => {
    render(<NoteCard {...baseProps} createdAt={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders tags as chips', () => {
    render(<NoteCard {...baseProps} tags={['java', 'spring']} />)
    expect(screen.getByText('java')).toBeInTheDocument()
    expect(screen.getByText('spring')).toBeInTheDocument()
  })

  it('does not render tag chips when tags is empty', () => {
    const { container } = render(<NoteCard {...baseProps} tags={[]} />)
    // no secondary chips rendered
    expect(container.querySelectorAll('.MuiChip-colorSecondary')).toHaveLength(0)
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<NoteCard {...baseProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<NoteCard {...baseProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
