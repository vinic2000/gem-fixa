import { Fixa, FixaAttributes, Pessoa } from '@/lib/db/models'

type CriarFixaDTO = Omit<FixaAttributes, 'id' | 'created_at' | 'updated_at'>
type AtualizarFixaDTO = Partial<Omit<FixaAttributes, 'id' | 'aluno_id' | 'created_at' | 'updated_at'>>
type FixaFilter = { aluno_id: string; tipo_aula?: 'pratica' | 'teorica' }

export const FixaService = {
  /**
   * Lista todas as aulas de um aluno.
   */
  async listarPorAluno(alunoId: string): Promise<Fixa[]> {
    return Fixa.findAll({
      where: { aluno_id: alunoId },
      order: [['data_aula', 'DESC']],
    })
  },

  async listarPorAlunoComPaginacao(
    alunoId: string,
    page: number,
    limit: number,
    tipoAula?: 'pratica' | 'teorica' | null
  ): Promise<{ count: number; rows: Fixa[] }> {
    const offset = (page - 1) * limit
    const where: FixaFilter = { aluno_id: alunoId }
    if (tipoAula) where.tipo_aula = tipoAula

    return Fixa.findAndCountAll({
      where,
      order: [['data_aula', 'DESC']],
      limit,
      offset,
    })
  },

  /**
   * Busca uma aula pelo ID.
   */
  async buscarPorId(id: string): Promise<Fixa> {
    const fixa = await Fixa.findByPk(id)
    if (!fixa) throw new Error('Aula não encontrada')
    return fixa
  },

  /**
   * Cria um novo registro de aula para um aluno.
   * Valida que o aluno_id pertence a uma pessoa do tipo 'aluno'.
   */
  async criar(dados: CriarFixaDTO): Promise<Fixa> {
    const aluno = await Pessoa.findByPk(dados.aluno_id)

    if (!aluno) throw new Error('Aluno não encontrado')
    if (aluno.tipo !== 'aluno') throw new Error('O ID informado não pertence a um aluno')

    return Fixa.create(dados)
  },

  /**
   * Atualiza um registro de aula.
   */
  async atualizar(id: string, dados: AtualizarFixaDTO): Promise<Fixa> {
    const fixa = await Fixa.findByPk(id)
    if (!fixa) throw new Error('Aula não encontrada')

    await Fixa.update(dados, { where: { id } })

    const atualizada = await Fixa.findByPk(id)
    return atualizada!
  },

  /**
   * Remove um registro de aula.
   */
  async deletar(id: string): Promise<void> {
    const fixa = await Fixa.findByPk(id)
    if (!fixa) throw new Error('Aula não encontrada')
    await fixa.destroy()
  },
}
