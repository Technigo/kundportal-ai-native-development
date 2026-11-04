import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('shows API availability separately from MySQL availability', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  const { default: App } = await import('./App')
  const fetchMock = vi.fn((input: RequestInfo | URL) =>
    Promise.resolve({
      ok: !String(input).endsWith('/health/db'),
      json: () => Promise.resolve([]),
    } as Response),
  )
  vi.stubGlobal('fetch', fetchMock)

  render(<App />)

  expect(await screen.findByText('API: Tillgänglig')).toBeInTheDocument()
  expect(await screen.findByText('MySQL: Inte tillgänglig')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health')
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health/db')
})
