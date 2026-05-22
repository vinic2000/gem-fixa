import bcrypt from 'bcryptjs'
import { AuditLog, Fixa, LoginLog, Pessoa, PessoaAttributes } from '@/lib/db/models'
import { registrarAudit, calcularDiff } from './log.service'

type CriarPessoaDTO = Omit<PessoaAttributes, 'id' | 'created_at' | 'updated_at'> & { senha?: string }
type AtualizarPessoaDTO = Partial<Omit<PessoaAttributes, 'id' | 'created_at' | 'updated_at'>> & { senha?: string }

export const PessoaService = {
  /**
   * Lista todas as pessoas. Audita como 'consulta'.
   */
  async listar(usuarioId: string): Promise<Pessoa[]> {
    const pessoas = await Pessoa.findAll()

    await registrarAudit({ acao: 'consulta', usuario_id: usuarioId })

    return pessoas
  },

  /**
   * Busca pessoa pelo ID. Audita como 'consulta'.
   */
  async buscarPorId(id: string, usuarioId: string): Promise<Pessoa> {
    const pessoa = await Pessoa.findByPk(id)

    if (!pessoa) throw new Error('Pessoa não encontrada')

    await registrarAudit({ acao: 'consulta', usuario_id: usuarioId, entidade_id: id })

    return pessoa
  },

  /**
   * Cria uma nova pessoa. Audita como 'cadastro'.
   */
  async criar(dados: CriarPessoaDTO, usuarioId: string): Promise<Pessoa> {
    const { senha, ...rest } = dados
    if (senha) rest.senha_hash = await bcrypt.hash(senha, 10)
    const pessoa = await Pessoa.create(rest)

    await registrarAudit({ acao: 'cadastro', usuario_id: usuarioId, entidade_id: pessoa.id })

    return pessoa
  },

  /**
   * Atualiza uma pessoa. Audita como 'edicao' com diff dos campos alterados.
   */
  async atualizar(
    id: string,
    dados: AtualizarPessoaDTO,
    usuarioId: string
  ): Promise<Pessoa> {
    const pessoa = await Pessoa.findByPk(id)

    if (!pessoa) throw new Error('Pessoa não encontrada')

    const dadosAntes = pessoa.get({ plain: true }) as unknown as Record<string, unknown>

    const { senha, ...dadosLimpos } = dados
    if (senha) dadosLimpos.senha_hash = await bcrypt.hash(senha, 10)

    await Pessoa.update(dadosLimpos, { where: { id } })

    const dadosDepois = { ...dadosAntes, ...dados } as Record<string, unknown>
    const diff = calcularDiff(dadosAntes, dadosDepois)

    await registrarAudit({
      acao: 'edicao',
      usuario_id: usuarioId,
      entidade_id: id,
      dados: diff,
    })

    const pessoaAtualizada = await Pessoa.findByPk(id)
    return pessoaAtualizada!
  },

  /**
   * Remove uma pessoa. Audita como 'exclusao'.
   */
  async deletar(id: string, usuarioId: string): Promise<void> {
    const pessoa = await Pessoa.findByPk(id)

    if (!pessoa) throw new Error('Pessoa não encontrada')

    if (pessoa.tipo === 'aluno') {
      await Fixa.destroy({ where: { aluno_id: id } })
    }

    await LoginLog.update(
      { usuario_id: null, usuario_id_legado: id },
      { where: { usuario_id: id } }
    )
    await AuditLog.update(
      { usuario_id: null, usuario_id_legado: id },
      { where: { usuario_id: id } }
    )
    await pessoa.destroy()

    if (usuarioId !== id) {
      await registrarAudit({ acao: 'exclusao', usuario_id: usuarioId, entidade_id: id })
    }
  },
}
