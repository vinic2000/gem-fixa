import { FixaService } from '@/services/fixa.service'
import { Fixa, Pessoa } from '@/lib/db/models'

jest.mock('@/lib/db/models', () => ({
  Fixa: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Pessoa: {
    findByPk: jest.fn(),
  },
}))

describe('FixaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('listarPorAluno deve consultar por aluno ordenando por data desc', async () => {
    const rows = [{ id: '1' }]
    ;(Fixa.findAll as jest.Mock).mockResolvedValue(rows)

    const result = await FixaService.listarPorAluno('aluno-1')

    expect(Fixa.findAll).toHaveBeenCalledWith({
      where: { aluno_id: 'aluno-1' },
      order: [['data_aula', 'DESC']],
    })
    expect(result).toBe(rows)
  })

  it('listarPorAlunoComPaginacao deve filtrar tipo_aula quando informado', async () => {
    const payload = { count: 1, rows: [{ id: '1' }] }
    ;(Fixa.findAndCountAll as jest.Mock).mockResolvedValue(payload)

    const result = await FixaService.listarPorAlunoComPaginacao('aluno-1', 2, 10, 'pratica')

    expect(Fixa.findAndCountAll).toHaveBeenCalledWith({
      where: { aluno_id: 'aluno-1', tipo_aula: 'pratica' },
      order: [['data_aula', 'DESC']],
      limit: 10,
      offset: 10,
    })
    expect(result).toBe(payload)
  })

  it('buscarPorId deve lançar erro quando não encontrar', async () => {
    ;(Fixa.findByPk as jest.Mock).mockResolvedValue(null)
    await expect(FixaService.buscarPorId('nao-existe')).rejects.toThrow('Aula não encontrada')
  })

  it('criar deve validar aluno existente e tipo aluno', async () => {
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue({ id: 'aluno-1', tipo: 'aluno' })
    ;(Fixa.create as jest.Mock).mockResolvedValue({ id: 'f1' })

    const result = await FixaService.criar({
      aluno_id: 'aluno-1',
      data_aula: new Date('2026-01-01'),
      tipo_aula: 'pratica',
      observacoes: 'ok',
      presenca: true,
    } as any)

    expect(Fixa.create).toHaveBeenCalled()
    expect(result).toEqual({ id: 'f1' })
  })

  it('criar deve falhar quando pessoa não for aluno', async () => {
    ;(Pessoa.findByPk as jest.Mock).mockResolvedValue({ id: 'x', tipo: 'instrutor' })

    await expect(
      FixaService.criar({ aluno_id: 'x' } as any)
    ).rejects.toThrow('O ID informado não pertence a um aluno')
  })

  it('atualizar deve lançar erro quando aula não existir', async () => {
    ;(Fixa.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(FixaService.atualizar('id-1', { observacoes: 'x' })).rejects.toThrow(
      'Aula não encontrada'
    )
  })

  it('deletar deve destruir quando encontrar aula', async () => {
    const destroy = jest.fn().mockResolvedValue(undefined)
    ;(Fixa.findByPk as jest.Mock).mockResolvedValue({ id: 'id-1', destroy })

    await FixaService.deletar('id-1')

    expect(destroy).toHaveBeenCalled()
  })
})
