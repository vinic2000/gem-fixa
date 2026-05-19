import { PessoaService } from '@/services/pessoa.service'
import { Pessoa } from '@/lib/db/models'
import { AuditLog } from '@/lib/db/models'

jest.mock('@/lib/db/models', () => ({
  Pessoa: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  AuditLog: {
    create: jest.fn(),
  },
}))

const mockInstrutor = { id: 'instrutor-uuid', tipo: 'instrutor' }

describe('PessoaService - listar', () => {
  it('deve retornar lista de pessoas', async () => {
    const pessoas = [{ id: '1', nome: 'João' }, { id: '2', nome: 'Maria' }]
    ;(Pessoa.findAll as jest.Mock).mockResolvedValue(pessoas)

    const result = await PessoaService.listar(mockInstrutor.id)

    expect(Pessoa.findAll).toHaveBeenCalled()
    expect(result).toEqual(pessoas)
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'consulta', usuario_id: mockInstrutor.id })
    )
  })
})

describe('PessoaService - buscarPorId', () => {
  it('deve retornar pessoa pelo id', async () => {
    const pessoa = { id: 'uuid-1', nome: 'João' }
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue(pessoa)

    const result = await PessoaService.buscarPorId('uuid-1', mockInstrutor.id)

    expect(result).toEqual(pessoa)
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'consulta', entidade_id: 'uuid-1' })
    )
  })

  it('deve lançar erro se pessoa não encontrada', async () => {
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue(null)
    await expect(PessoaService.buscarPorId('nao-existe', mockInstrutor.id)).rejects.toThrow(
      'Pessoa não encontrada'
    )
  })
})

describe('PessoaService - criar', () => {
  it('deve criar uma pessoa e registrar audit log', async () => {
    const dados = { nome: 'Ana', sobrenome: 'Silva', tipo: 'aluno' as const }
    const criada = { id: 'novo-uuid', ...dados }
    ;(Pessoa.create as jest.Mock).mockResolvedValue(criada)

    const result = await PessoaService.criar(dados, mockInstrutor.id)

    expect(Pessoa.create).toHaveBeenCalledWith(dados)
    expect(result).toEqual(criada)
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'cadastro', entidade_id: criada.id })
    )
  })
})

describe('PessoaService - atualizar', () => {
  it('deve atualizar e registrar diff no audit log', async () => {
    const antes = { id: 'uuid-1', nome: 'João', sobrenome: 'Silva', tipo: 'aluno', get: () => ({ id: 'uuid-1', nome: 'João', sobrenome: 'Silva' }) }
    const dadosNovos = { nome: 'Felipe' }
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue(antes)
    ;(Pessoa.update as jest.Mock).mockResolvedValue([1])

    await PessoaService.atualizar('uuid-1', dadosNovos, mockInstrutor.id)

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: 'edicao',
        dados: expect.objectContaining({
          nome: { antes: 'João', depois: 'Felipe' },
        }),
      })
    )
  })

  it('deve lançar erro se pessoa não encontrada', async () => {
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue(null)
    await expect(
      PessoaService.atualizar('nao-existe', { nome: 'X' }, mockInstrutor.id)
    ).rejects.toThrow('Pessoa não encontrada')
  })
})

describe('PessoaService - deletar', () => {
  it('deve deletar pessoa e registrar audit log', async () => {
    const pessoa = { id: 'uuid-1', nome: 'João', destroy: jest.fn() }
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue(pessoa)

    await PessoaService.deletar('uuid-1', mockInstrutor.id)

    expect(pessoa.destroy).toHaveBeenCalled()
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'exclusao', entidade_id: 'uuid-1' })
    )
  })
})
