const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null }
  return {
    accessToken:  localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken } = getTokens()
  if (!refreshToken) return null

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearTokens()
    return null
  }

  const data = await res.json()
  setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = getTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expirado → tenta refresh
  if (res.status === 401) {
    const newToken = await tryRefresh()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    } else {
      // Redireciona para login se refresh falhou
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Sessão expirada')
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}

export { setTokens, clearTokens, getTokens }
