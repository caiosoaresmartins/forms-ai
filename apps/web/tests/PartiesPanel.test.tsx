import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PartiesPanel } from '@/components/parties/PartiesPanel'

const mockParties = {
  buyers: [{ index: 1, type: 'person' as const, name_field: 'COMPRADOR' }],
  sellers: [{ index: 1, type: 'person' as const, name_field: 'VENDEDOR' }],
  witnesses: [], procurators: [], spouses: [],
}

describe('PartiesPanel', () => {
  it('renders buyers section', () => {
    render(<PartiesPanel parties={mockParties} />)
    expect(screen.getByText('Compradores')).toBeInTheDocument()
  })

  it('renders party name field', () => {
    render(<PartiesPanel parties={mockParties} />)
    expect(screen.getByText('COMPRADOR')).toBeInTheDocument()
  })

  it('shows empty state when no parties', () => {
    render(<PartiesPanel parties={null} />)
    expect(screen.getByText(/Nenhuma parte/i)).toBeInTheDocument()
  })
})
