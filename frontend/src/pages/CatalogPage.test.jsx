import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import CatalogPage from './CatalogPage'

vi.mock('@/lib/api', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('@/components/ProductGrid', () => ({
  default: ({ products }) => (
    <div data-testid="product-grid">
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  ),
  ProductGridSkeleton: () => <div data-testid="product-grid-skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }) => (
    <span className={className}>{children}</span>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
    />
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ children }) => <nav>{children}</nav>,
  PaginationContent: ({ children }) => <div>{children}</div>,
  PaginationItem: ({ children }) => <div>{children}</div>,
  PaginationLink: ({ children, isActive, onClick }) => (
    <button 
      data-active={isActive} 
      onClick={onClick}
      data-testid="pagination-link"
    >
      {children}
    </button>
  ),
  PaginationPrevious: ({ onClick }) => (
    <button onClick={onClick} data-testid="pagination-previous">Previous</button>
  ),
  PaginationNext: ({ onClick }) => (
    <button onClick={onClick} data-testid="pagination-next">Next</button>
  ),
}))

vi.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />,
}))

const mockNavigate = vi.fn()
const mockSearchParams = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams(), vi.fn()],
  }
})

const { fetchProducts } = await import('@/lib/api')

describe('CatalogPage', () => {
  const mockProducts = {
    items: [
      { id: '1', name: 'Test Product 1', price: 10.99 },
      { id: '2', name: 'Test Product 2', price: 15.99 },
    ],
    total: 2,
    corrected: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.mockReturnValue(new URLSearchParams())
    fetchProducts.mockResolvedValue(mockProducts)
  })

  it('renders the catalog page with initial state', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Fresh Groceries Delivered')).toBeInTheDocument()
    expect(screen.getByText('Discover organic, sustainable products for a healthier lifestyle')).toBeInTheDocument()
    
    expect(screen.getByText('All Products')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByTestId('product-grid-skeleton')).not.toBeInTheDocument()
    })
  })

  it('displays products after loading', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: '',
      })
    })

    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('q=apple'))
    
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: 'apple',
      })
    })

    expect(screen.getByText('Search results for "apple"')).toBeInTheDocument()
  })

  it('shows corrected search notice', async () => {
    const correctedProducts = {
      ...mockProducts,
      corrected: 'apple',
    }
    fetchProducts.mockResolvedValue(correctedProducts)
    mockSearchParams.mockReturnValue(new URLSearchParams('q=aple'))

    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Showing results for “apple”/)).toBeInTheDocument()
    })
  })

  it('handles search input change on mobile', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'banana' } })

    expect(mockNavigate).toHaveBeenCalledWith('/catalog?q=banana')
  })

  it('displays error message when API fails', async () => {
    fetchProducts.mockRejectedValue(new Error('Network error'))

    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows empty state when no products found', async () => {
    fetchProducts.mockResolvedValue({
      items: [],
      total: 0,
      corrected: null,
    })

    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or browse all categories')).toBeInTheDocument()
    })
  })

  it('handles pagination', async () => {
    const manyProducts = {
      items: Array.from({ length: 12 }, (_, i) => ({
        id: String(i + 1),
        name: `Product ${i + 1}`,
        price: (i + 1) * 10,
      })),
      total: 24,
      corrected: null,
    }
    fetchProducts.mockResolvedValue(manyProducts)

    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pagination-previous')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-next')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('pagination-next'))

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({
        page: 2,
        limit: 12,
        search: '',
      })
    })

    fireEvent.click(screen.getAllByTestId('pagination-link')[1]) 

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({
        page: 2,
        limit: 12,
        search: '',
      })
    })
  })

  it('resets to page 1 when search changes', async () => {
    const { rerender } = render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })

    mockSearchParams.mockReturnValue(new URLSearchParams('q=test'))
    
    rerender(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: 'test',
      })
    })
  })
})