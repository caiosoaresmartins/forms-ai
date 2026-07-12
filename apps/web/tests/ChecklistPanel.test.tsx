import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChecklistPanel } from '@/components/checklist/ChecklistPanel'

const mockChecklist = {
  checklist: [
    {
      party_type: 'buyer',
      party_index: 1,
      party_name: 'COMPRADOR',
      documents: [
        { name: 'RG ou CNH', required: true, notes: 'frente e verso' },
        { name: 'CPF', required: true, notes: '' },
      ],
    },
  ],
}

describe('ChecklistPanel', () => {
  it('renders party label', () => {
    render(<ChecklistPanel checklist={mockChecklist} />)
    expect(screen.getByText(/Comprador 1/i)).toBeInTheDocument()
  })

  it('renders document names', () => {
    render(<ChecklistPanel checklist={mockChecklist} />)
    expect(screen.getByText(/RG ou CNH/i)).toBeInTheDocument()
    expect(screen.getByText(/CPF/i)).toBeInTheDocument()
  })

  it('shows empty state when no checklist', () => {
    render(<ChecklistPanel checklist={null} />)
    expect(screen.getByText(/Nenhuma checklist/i)).toBeInTheDocument()
  })
})
