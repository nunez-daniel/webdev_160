
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import RobotTrackerMock from './Map'

vi.mock(import('leaflet'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    map: vi.fn(() => ({
    setView: vi.fn(() => ({})),
    remove: vi.fn(),
    })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
    })),
  marker: vi.fn(() => ({
    setLatLng: vi.fn(),
    addTo: vi.fn(),
    })),
  }
})



vi.mock('leaflet/dist/leaflet.css', () => ({}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }) => (
    <button onClick={onClick} data-variant={variant} data-testid="button">
      {children}
    </button>
  ),
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.useFakeTimers()

describe('RobotTrackerMock', () => {
  let L

  beforeEach(async () => {
    vi.clearAllMocks()
    L = await import('leaflet')
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders the robot tracker with all elements', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument()

    const mapContainer = screen.getByRole('generic').querySelector('div[style*="height: 500px"]')
    expect(mapContainer).toBeInTheDocument()
    expect(mapContainer).toHaveStyle({
      width: '100%',
      height: '500px',
      border: '1px solid #ccc',
      marginTop: '20px',
    })
  })

  it('initializes map with correct starting position', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    expect(L.map).toHaveBeenCalledTimes(1)
    expect(L.map).toHaveBeenCalledWith(expect.any(HTMLDivElement))

    const mapInstance = L.map.mock.results[0].value
    expect(mapInstance.setView).toHaveBeenCalledWith([37.7749, -122.4194], 15)

    expect(L.tileLayer).toHaveBeenCalledWith(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
      }
    )

    expect(L.marker).toHaveBeenCalledWith([37.7749, -122.4194])
  })

  it('moves robot randomly at specified intervals', async () => {
    const updateInterval = 1000
    render(
      <BrowserRouter>
        <RobotTrackerMock updateInterval={updateInterval} />
      </BrowserRouter>
    )

    const mapInstance = L.map.mock.results[0].value
    const markerInstance = L.marker.mock.results[0].value

    expect(markerInstance.addTo).toHaveBeenCalledWith(mapInstance)

    await act(async () => {
      vi.advanceTimersByTime(updateInterval)
    })

    expect(markerInstance.setLatLng).toHaveBeenCalled()
    expect(mapInstance.setView).toHaveBeenCalled()

    const setLatLngCall = markerInstance.setLatLng.mock.calls[0]
    const newPosition = setLatLngCall[0]

    expect(Array.isArray(newPosition)).toBe(true)
    expect(newPosition).toHaveLength(2)
    expect(typeof newPosition[0]).toBe('number') // lat
    expect(typeof newPosition[1]).toBe('number') // lng

    expect(newPosition[0]).toBeCloseTo(37.7749, 2) // lat within reasonable range
    expect(newPosition[1]).toBeCloseTo(-122.4194, 2) // lng within reasonable range
  })

  it('handles multiple movement updates', async () => {
    const updateInterval = 500
    render(
      <BrowserRouter>
        <RobotTrackerMock updateInterval={updateInterval} />
      </BrowserRouter>
    )

    const markerInstance = L.marker.mock.results[0].value

    // Advance timers multiple times
    await act(async () => {
      vi.advanceTimersByTime(updateInterval * 3) // Three updates
    })

    // Marker should have been updated multiple times
    expect(markerInstance.setLatLng).toHaveBeenCalledTimes(3)

    // Check that each update had different positions
    const positions = markerInstance.setLatLng.mock.calls.map(call => call[0])
    
    // All positions should be different 
    const uniquePositions = new Set(positions.map(pos => pos.join(',')))
    expect(uniquePositions.size).toBeGreaterThan(1)
  })

  it('cleans up interval on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )


    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    unmount()


    expect(clearIntervalSpy).toHaveBeenCalled()

    clearIntervalSpy.mockRestore()
  })

  it('handles back button click', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    const backButton = screen.getByTestId('button')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('uses default updateInterval when not provided', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    // Should work without errors with default interval
    expect(L.map).toHaveBeenCalledTimes(1)
  })

  it('does not reinitialize map on re-render', () => {
    const { rerender } = render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    const initialMapCallCount = L.map.mock.calls.length

    rerender(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    expect(L.map).toHaveBeenCalledTimes(initialMapCallCount)
  })

  it('handles custom updateInterval prop', async () => {
    const customInterval = 3000
    render(
      <BrowserRouter>
        <RobotTrackerMock updateInterval={customInterval} />
      </BrowserRouter>
    )

    const markerInstance = L.marker.mock.results[0].value


    await act(async () => {
      vi.advanceTimersByTime(customInterval - 1000)
    })

    expect(markerInstance.setLatLng).not.toHaveBeenCalled()


    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(markerInstance.setLatLng).toHaveBeenCalledTimes(1)
  })

  it('maintains component structure and styling', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )


    const container = screen.getByText('Back').closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'items-start', 'px-4', 'py-4')


    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-variant', 'ghost')
  })
})


describe('RobotTrackerMock Edge Cases', () => {
  let L

  beforeEach(async () => {
    vi.clearAllMocks()
    L = await import('leaflet')
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('handles very small updateInterval', async () => {
    const veryFastInterval = 100
    render(
      <BrowserRouter>
        <RobotTrackerMock updateInterval={veryFastInterval} />
      </BrowserRouter>
    )

    const markerInstance = L.marker.mock.results[0].value

    await act(async () => {
      vi.advanceTimersByTime(veryFastInterval * 5)
    })


    expect(markerInstance.setLatLng).toHaveBeenCalledTimes(5)
  })

  it('handles map container ref correctly', () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )


    expect(L.map).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    
    const mapContainerArg = L.map.mock.calls[0][0]
    expect(mapContainerArg).toBeInstanceOf(HTMLDivElement)
  })

  it('simulates realistic robot movement pattern', async () => {
    render(
      <BrowserRouter>
        <RobotTrackerMock />
      </BrowserRouter>
    )

    const markerInstance = L.marker.mock.results[0].value


    await act(async () => {
      vi.advanceTimersByTime(6000) 
    })

    const positions = markerInstance.setLatLng.mock.calls.map(call => call[0])
    
    
    expect(positions.length).toBe(3)
    
   
    positions.forEach(position => {
      expect(Array.isArray(position)).toBe(true)
      expect(position).toHaveLength(2)
      expect(typeof position[0]).toBe('number')
      expect(typeof position[1]).toBe('number')
    })


    positions.forEach(([lat, lng]) => {
      expect(lat).toBeGreaterThan(37.77)
      expect(lat).toBeLessThan(37.78)
      expect(lng).toBeGreaterThan(-122.43)
      expect(lng).toBeLessThan(-122.41)
    })
  })
})