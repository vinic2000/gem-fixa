import {
  ComumCongregacao,
  ComumCongregacaoCreationAttributes,
  ComumCongregacaoAttributes,
  Pessoa,
} from '@/lib/db/models'

type CriarComumCongregacaoDTO = ComumCongregacaoCreationAttributes
type AtualizarComumCongregacaoDTO = Partial<Omit<ComumCongregacaoAttributes, 'id'>>

export const ComumCongregacaoService = {
  async listar(): Promise<ComumCongregacao[]> {
    return await ComumCongregacao.findAll()
  },

  async buscarPorId(id: string): Promise<ComumCongregacao> {
    const comumCongregacao = await ComumCongregacao.findByPk(id)
    if (!comumCongregacao) throw new Error('Comum congregação não encontrada')
    return comumCongregacao
  },

  async criar(dados: CriarComumCongregacaoDTO): Promise<ComumCongregacao> {
    return await ComumCongregacao.create(dados)
  },

  async atualizar(
    id: string,
    dados: AtualizarComumCongregacaoDTO
  ): Promise<ComumCongregacao> {
    const comumCongregacao = await ComumCongregacao.findByPk(id)
    if (!comumCongregacao) throw new Error('Comum congregação não encontrada')
    await ComumCongregacao.update(dados, { where: { id } })
    const ccAtualizada = await ComumCongregacao.findByPk(id)
    return ccAtualizada!
  },

  async deletar(id: string): Promise<void> {
    const comumCongregacao = await ComumCongregacao.findByPk(id)
    if (!comumCongregacao) throw new Error('Comum congregação não encontrada')

    const vinculados = await Pessoa.count({ where: { comum_congregacao_id: id } })
    if (vinculados > 0) {
      throw new Error(`Não é possível excluir: ${vinculados} ${vinculados === 1 ? 'pessoa vinculada' : 'pessoas vinculadas'} a esta congregação`)
    }

    await comumCongregacao.destroy()
  },
}
