
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import ProductDetailPage from './ProductDetailPage'


vi.mock('@/lib/api', () => ({
  fetchProductById: vi.fn(),
}))

vi.mock('@/lib/cartStore', () => ({
  useCart: vi.fn(),
}))


vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      data-testid="button"
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }) => (
    <span data-variant={variant} data-testid="badge">
      {children}
    </span>
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }) => (
    <div className={className} data-testid="skeleton" />
  ),
}))

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }) => <nav data-testid="breadcrumb">{children}</nav>,
  BreadcrumbList: ({ children }) => <ol data-testid="breadcrumb-list">{children}</ol>,
  BreadcrumbItem: ({ children }) => <li data-testid="breadcrumb-item">{children}</li>,
  BreadcrumbLink: ({ children, href, onClick }) => (
    <a href={href} onClick={onClick} data-testid="breadcrumb-link">
      {children}
    </a>
  ),
  BreadcrumbSeparator: () => <span data-testid="breadcrumb-separator">/</span>,
  BreadcrumbPage: ({ children }) => <span data-testid="breadcrumb-page">{children}</span>,
}))

const mockNavigate = vi.fn()
const mockUseParams = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

const { fetchProductById } = await import('@/lib/api')
const { useCart } = await import('@/lib/cartStore')

describe('ProductDetailPage', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    brand: 'Test Brand',
    category: 'Test Category',
    cost: 29.99,
    description: 'This is a test product description',
    imageUrl: '/test-image.jpg',
    inStock: true,
    rating: 4.5,
    reviewsCount: 42,
  }

  const mockAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ id: '1' })
    useCart.mockReturnValue({ add: mockAddToCart })
  })

  it('renders loading skeleton initially', () => {
    fetchProductById.mockImplementation(() => new Promise(() => {})) 

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton')).toHaveLength(5) 
  })

  it('renders breadcrumb navigation', () => {
    fetchProductById.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
  })

  it('navigates to catalog when home breadcrumb is clicked', () => {
    fetchProductById.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    const homeLink = screen.getByText('Home')
    fireEvent.click(homeLink)

    expect(mockNavigate).toHaveBeenCalledWith('/catalog')
  })

  it('displays product details after loading', async () => {
    fetchProductById.mockResolvedValue(mockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test Brand • Test Category')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('This is a test product description')).toBeInTheDocument()
    expect(screen.getByText('4.5★ average rating • 42 reviews')).toBeInTheDocument()
    
    const image = screen.getByAltText('Test Product')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    
    expect(screen.getByText('In stock')).toBeInTheDocument()
  })

  it('shows out of stock badge when product is not in stock', async () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    fetchProductById.mockResolvedValue(outOfStockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Out')).toBeInTheDocument()
    })

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
  })

  it('handles add to cart button click', async () => {
    fetchProductById.mockResolvedValue(mockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1)
  })

  it('handles buy now button click', async () => {
    fetchProductById.mockResolvedValue(mockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buy Now')).toBeInTheDocument()
    })

    const buyNowButton = screen.getByText('Buy Now')
    fireEvent.click(buyNowButton)

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1)
    expect(mockNavigate).toHaveBeenCalledWith('/cart')
  })

  it('displays error message when API fails', async () => {
    fetchProductById.mockRejectedValue(new Error('Product not found'))

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })

    expect(screen.queryByText('Test Product')).not.toBeInTheDocument()
  })

  it('handles component unmounting during API call', async () => {
    let resolveFetch
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve
    })
    fetchProductById.mockReturnValue(fetchPromise)

    const { unmount } = render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )
  
    unmount()
    resolveFetch(mockProduct)

    await waitFor(() => {
      expect(fetchProductById).toHaveBeenCalledWith('1')
    })
  })

  it('fetches product with correct ID from URL params', async () => {
    mockUseParams.mockReturnValue({ id: '123' })
    fetchProductById.mockResolvedValue(mockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(fetchProductById).toHaveBeenCalledWith('123')
    })
  })

  it('formats price correctly', async () => {
    const productWithDecimalPrice = { ...mockProduct, cost: 19.5 }
    fetchProductById.mockResolvedValue(productWithDecimalPrice)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('$19.50')).toBeInTheDocument()
    })
  })

  it('renders correct button variants and sizes', async () => {
    fetchProductById.mockResolvedValue(mockProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button')
      
 
      const addToCartButton = buttons.find(btn => btn.textContent === 'Add to Cart')
      expect(addToCartButton).toHaveAttribute('data-size', 'lg')
      

      const buyNowButton = buttons.find(btn => btn.textContent === 'Buy Now')
      expect(buyNowButton).toHaveAttribute('data-variant', 'outline')
      expect(buyNowButton).toHaveAttribute('data-size', 'lg')
    })
  })
})


describe('DetailSkeleton', () => {
  it('renders all skeleton elements', () => {

    fetchProductById.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
    
    const imageSkeleton = skeletons.find(skeleton => 
      skeleton.className.includes('aspect-square')
    )
    expect(imageSkeleton).toBeInTheDocument()
  })
})


describe('ProductDetailPage Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ id: '1' })
    useCart.mockReturnValue({ add: vi.fn() })
  })

  it('handles product with very long description', async () => {
    const longDescriptionProduct = {
      ...mockProduct,
      description: 'A'.repeat(1000)
    }
    fetchProductById.mockResolvedValue(longDescriptionProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(longDescriptionProduct.description)).toBeInTheDocument()
    })
  })

  it('handles product with zero reviews', async () => {
    const noReviewsProduct = {
      ...mockProduct,
      rating: 0,
      reviewsCount: 0
    }
    fetchProductById.mockResolvedValue(noReviewsProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('0★ average rating • 0 reviews')).toBeInTheDocument()
    })
  })

  it('handles missing optional product fields gracefully', async () => {
    const minimalProduct = {
      id: '1',
      name: 'Minimal Product',
      cost: 10,
      inStock: true,
    }
    fetchProductById.mockResolvedValue(minimalProduct)

    render(
      <BrowserRouter>
        <ProductDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Minimal Product')).toBeInTheDocument()
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })

    expect(screen.getByText('In stock')).toBeInTheDocument()
  })
})