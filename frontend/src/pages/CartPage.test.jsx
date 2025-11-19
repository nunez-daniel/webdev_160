import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import CartPage from './CartPage'

vi.mock('@/lib/cartStore', () => {
  const mockUseCart = vi.fn()
  return { useCart: mockUseCart }
})

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h3>{children}</h3>,
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }) => <table>{children}</table>,
  TableHeader: ({ children }) => <thead>{children}</thead>,
  TableHead: ({ children }) => <th>{children}</th>,
  TableRow: ({ children }) => <tr>{children}</tr>,
  TableBody: ({ children }) => <tbody>{children}</tbody>,
}))

vi.mock('@/components/CartItemRow', () => ({
  default: ({ item }) => (
    <div data-testid="cart-item">
      {item.name} - ${item.price} x {item.quantity}
    </div>
  )
}))

describe('CartPage', () => {
  let mockInitializeCart, mockClear, mockMoveToCart, mockCheckoutLink, mockNavigate

  beforeEach(async () => {
    mockInitializeCart = vi.fn()
    mockClear = vi.fn()
    mockMoveToCart = vi.fn()
    mockCheckoutLink = vi.fn()
    mockNavigate = vi.fn()

    const { useCart } = await import('@/lib/cartStore')
    
    vi.mocked(await import('react-router-dom')).useNavigate = () => mockNavigate

    useCart.mockReturnValue({
      items: [],
      saved: [],
      totals: () => ({ count: 0, subtotal: 0, fees: 0, total: 0 }),
      clear: mockClear,
      moveToCart: mockMoveToCart,
      checkoutLink: mockCheckoutLink,
      initializeCart: mockInitializeCart
    })
  })

  it('renders empty state when cart is empty', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(screen.getByText('Browse products')).toBeInTheDocument()
    expect(mockInitializeCart).toHaveBeenCalledOnce()
  })

  it('navigates to catalog when browse products is clicked', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByText('Browse products'))
    expect(mockNavigate).toHaveBeenCalledWith('/catalog')
  })
})