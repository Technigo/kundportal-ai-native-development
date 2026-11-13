import { afterEach, expect, it, vi } from 'vitest'
import { updateTicketStatus } from './tickets'

afterEach(() => vi.unstubAllGlobals())

it('sends only the status to the ticket status endpoint', async () => {
  const ticket = {
    id: 42,
    customer_id: 'K-104',
    customer_name: 'Exempelkund',
    title: 'Fråga om faktura',
    description: 'Påhittad beskrivning.',
    category: 'billing',
    priority: 'normal',
    status: 'closed',
    created_at: '2026-10-31T22:08:34.123456Z',
  }
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ticket })
  vi.stubGlobal('fetch', fetchMock)

  await expect(updateTicketStatus(42, 'closed')).resolves.toEqual(ticket)
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
    expect.stringMatching(/\/api\/tickets\/42\/status$/),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{"status":"closed"}',
    },
  )
})
