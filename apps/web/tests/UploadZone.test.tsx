import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UploadZone } from '@/components/upload/UploadZone'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('UploadZone', () => {
  it('renders upload area', () => {
    render(<UploadZone />)
    expect(screen.getByText(/Arraste um PDF/i)).toBeInTheDocument()
  })

  it('shows pdf size limit', () => {
    render(<UploadZone />)
    expect(screen.getByText(/20 MB/i)).toBeInTheDocument()
  })
})
