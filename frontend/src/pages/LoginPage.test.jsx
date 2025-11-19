// LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

// Mock dependencies
vi.mock('@/lib/api', () => ({
  authenticateUser: vi.fn(),
}))

vi.mock('react-icons/fc', () => ({
  FcGoogle: () => <div data-testid="google-icon">Google Icon</div>,
}))

vi.mock('@mui/material', () => ({
  Paper: ({ children }) => <div data-testid="paper">{children}</div>,
  Collapse: ({ children }) => <div data-testid="collapse">{children}</div>,
}))

vi.mock('../assets/view.png', () => ({
  default: 'view-icon.png',
}))

vi.mock('../assets/hide.png', () => ({
  default: 'hide-icon.png',
}))

// Mock react-router-dom
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


const { authenticateUser } = await import('@/lib/api')

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location mock
    delete window.location
    window.location = { href: '' }
  })

  it('renders the login page with all elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    // Check main heading
    expect(screen.getByText('Login')).toBeInTheDocument()
    
    // Check Google login button
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    expect(screen.getByTestId('google-icon')).toBeInTheDocument()
    
    // Check form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    
    // Check create account link
    expect(screen.getByText('Create account')).toBeInTheDocument()
    expect(screen.getByText('Create account').closest('a')).toHaveAttribute('href', '/signup')
  })

  it('handles email input changes', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(emailInput.value).toBe('test@example.com')
  })

  it('handles password input changes', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(passwordInput.value).toBe('password123')
  })

  it('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('img') // The eye icon
    
    // Initially should be password type
    expect(passwordInput.type).toBe('password')
    
    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    
    // Click to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid credentials and navigates on success', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    authenticateUser.mockResolvedValue(mockUser)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    // Fill out the form
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Check API was called with correct credentials
    await waitFor(() => {
      expect(authenticateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    // Check navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/catalog')
  })

  it('shows alert when authentication fails', async () => {
    authenticateUser.mockResolvedValue(null) // Simulate user not found
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('User not found')
    })

    mockAlert.mockRestore()
  })

  it('shows alert when authentication throws error', async () => {
    authenticateUser.mockRejectedValue(new Error('Network error'))
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Login failed')
    })

    mockAlert.mockRestore()
  })

  it('handles Google login button click', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const googleButton = screen.getByText('Sign in with Google')
    fireEvent.click(googleButton)

    expect(window.location.href).toBe('http://localhost:8080/oauth2/authorization/google')
  })

  it('prevents form submission when required fields are empty', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    // Form should still try to submit due to HTML5 validation
    // But we can check that authenticateUser wasn't called
    await waitFor(() => {
      expect(authenticateUser).not.toHaveBeenCalled()
    })
  })

  it('maintains form state after failed submission', async () => {
    authenticateUser.mockRejectedValue(new Error('Network error'))
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Submit
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authenticateUser).toHaveBeenCalled()
    })

    // Form values should persist after error
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')

    mockAlert.mockRestore()
  })

  it('has proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('id', 'userEnteredPassword')
  })

  it('displays password toggle with correct icons', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const toggleButton = screen.getByRole('img')
    expect(toggleButton).toHaveAttribute('src', 'view-icon.png')
    
    // Click to change icon
    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('src', 'hide-icon.png')
  })

  it('handles form submission via submit button', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    authenticateUser.mockResolvedValue(mockUser)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authenticateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
  it('handles very long email input', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const longEmail = 'a'.repeat(100) + '@example.com'
    
    fireEvent.change(emailInput, { target: { value: longEmail } })
    expect(emailInput.value).toBe(longEmail)
  })

  it('handles special characters in password', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const specialPassword = 'p@$$w0rd!123'
    
    fireEvent.change(passwordInput, { target: { value: specialPassword } })
    expect(passwordInput.value).toBe(specialPassword)
  })

  it('maintains component state during re-renders', () => {
    const { rerender } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Simulate re-render
    rerender(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(emailInput.value).toBe('test@example.com')
  })
})