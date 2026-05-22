import { apiFetch, clearTokens, getTokens, setTokens } from '@/lib/api'

const originalWindow = global.window
const originalFetch = global.fetch
const originalLocalStorage = global.localStorage

describe('lib/api', () => {
  const store = new Map<string, string>()

  const localStorageMock = {
    getItem: jest.fn((k: string) => store.get(k) ?? null),
    setItem: jest.fn((k: string, v: string) => {
      store.set(k, v)
    }),
    removeItem: jest.fn((k: string) => {
      store.delete(k)
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    store.clear()

    Object.defineProperty(global, 'window', {
      value: { location: { href: '' } },
      configurable: true,
      writable: true,
    })

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    })
  })

  afterAll(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, configurable: true })
    Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true })
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('setTokens/getTokens/clearTokens devem manipular storage', () => {
    setTokens('a1', 'r1')
    expect(getTokens()).toEqual({ accessToken: 'a1', refreshToken: 'r1' })

    clearTokens()
    expect(getTokens()).toEqual({ accessToken: null, refreshToken: null })
  })

  it('apiFetch deve incluir authorization e retornar json', async () => {
    setTokens('token-1', 'refresh-1')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true }),
    } as any)

    const result = await apiFetch('/api/x')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/x'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
      })
    )
    expect(result).toEqual({ ok: true })
  })

  it('apiFetch deve tentar refresh no 401 e repetir requisição', async () => {
    setTokens('token-expirado', 'refresh-ok')

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn() })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ accessToken: 'token-novo', refreshToken: 'refresh-novo' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ done: true }),
      })

    global.fetch = fetchMock as any

    const result = await apiFetch('/api/protegida')

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ done: true })
    expect(getTokens()).toEqual({ accessToken: 'token-novo', refreshToken: 'refresh-novo' })
  })

  it('apiFetch deve lançar Sessão expirada e redirecionar quando refresh falhar', async () => {
    setTokens('token-expirado', 'refresh-ruim')

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn() })
      .mockResolvedValueOnce({ ok: false, status: 401, json: jest.fn() })

    global.fetch = fetchMock as any

    await expect(apiFetch('/api/protegida')).rejects.toThrow('Sessão expirada')
    expect((global.window as any).location.href).toBe('/login')
  })
})
