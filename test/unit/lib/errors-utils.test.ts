import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

describe('lib/errors', () => {
  it('deve retornar mensagem do erro', () => {
    expect(getErrorMessage(new Error('falhou'), 'fallback')).toBe('falhou')
  })

  it('deve retornar fallback para erro desconhecido', () => {
    expect(getErrorMessage({} as unknown, 'fallback')).toBe('fallback')
  })
})

describe('lib/utils cn', () => {
  it('deve mesclar classes e resolver conflito tailwind', () => {
    expect(cn('p-2', 'p-4', false && 'x', 'text-sm')).toBe('p-4 text-sm')
  })
})
