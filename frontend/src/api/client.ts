const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ErrorBody = {
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string[]>
  }
}

export class ApiError extends Error {
  readonly status: number | null
  readonly code: string
  readonly fields: Record<string, string[]>

  constructor(
    status: number | null,
    code: string,
    message: string,
    fields: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, init)
  } catch {
    // Inget svar alls: vid en skrivning är utfallet okänt
    throw new ApiError(null, 'network_error', 'Servern kunde inte nås.')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody
    throw new ApiError(
      response.status,
      body.error?.code ?? 'unknown_error',
      body.error?.message ?? 'Okänt fel från servern.',
      body.error?.fields,
    )
  }

  return (await response.json()) as T
}
