@AGENTS.md

## Visão geral

Sistema de gestão de pessoas e aulas fixas para a GEM. Stack: Next.js 16 (App Router) + TypeScript + Sequelize + PostgreSQL + JWT + Tailwind CSS.

## Estrutura principal

```
app/
  api/                          # Rotas de API (Next.js Route Handlers)
    auth/                       # login, logout, refresh
    pessoas/                    # CRUD de pessoas
    comum-congregacao/          # CRUD de congregações
    fixa/                       # CRUD de aulas fixas
  (dashboard)/                  # Páginas protegidas pelo layout de auth
    pessoas/                    # Listagem + novo + [id] (edição)
    comum-congregacao/          # Listagem + novo + [id] (edição)
    fixa/                       # Listagem e gerência de aulas
components/
  layout/Sidebar.tsx            # Navegação lateral (Pessoas, Fixas, Congregações)
  ui/                           # Componentes base (button, input, card, select…)
    congregacao-combobox.tsx    # Autocomplete de congregação com busca debounced
lib/
  db/
    models/                     # Modelos Sequelize
    migrations/                 # Migrações numeradas (20260001 … 20260009)
  middleware/auth.ts            # withAuth — guard de rotas de API
  providers/auth-provider.tsx   # Contexto de autenticação no cliente
services/                       # Camada de negócio (sem acesso direto à req/res)
  auth.service.ts
  pessoa.service.ts
  fixa.service.ts
  log.service.ts
  comumCongregacao.service.ts
```

## Entidades e relacionamentos

| Entidade | Tabela | Notas |
|---|---|---|
| `Pessoa` | `pessoas` | Tipo: `aluno` ou `instrutor`. FK: `comum_congregacao_id` (nullable) |
| `Fixa` | `fixa` | Aula fixa; FK `aluno_id → pessoas` |
| `ComumCongregacao` | `comum_congregacao` | Nome único. `hasMany(Pessoa)` |
| `AuditLog` | `audit_log` | `usuario_id` nullable (preservado após exclusão do instrutor) |
| `LoginLog` | `login_log` | `usuario_id` nullable (mesmo motivo) |

Associações relevantes no `lib/db/models/index.ts`:
- `Pessoa.belongsTo(ComumCongregacao, { foreignKey: 'comum_congregacao_id', as: 'comum_congregacao' })`
- `ComumCongregacao.hasMany(Pessoa, { foreignKey: 'comum_congregacao_id', as: 'pessoas' })`

## Regras de negócio

### Exclusão de Pessoa
- **Aluno**: remove manualmente as `fixa` vinculadas antes de excluir (`Fixa.destroy({ where: { aluno_id } })`). Sem `onDelete: CASCADE`.
- **Instrutor**: excluído diretamente, sem remover fixas.
- Logs (`audit_log`, `login_log`) nunca são apagados; `usuario_id` é setado para `null` e `usuario_id_legado` recebe o ID original.

### Exclusão de ComumCongregacao
- Bloqueada se houver pessoas vinculadas (`Pessoa.count({ where: { comum_congregacao_id } }) > 0`).
- Retorna HTTP 409 com mensagem indicando a quantidade de vínculos.
- A FK em `pessoas.comum_congregacao_id` usa `SET NULL` no banco (migration 20260009), mas a camada de serviço bloqueia antes de chegar lá.

### Congregação no formulário de Pessoa
- O campo de congregação é um autocomplete (`CongregacaoCombobox`) que busca em `/api/comum-congregacao?search=`.
- O formulário armazena `comum_congregacao_id` (UUID) internamente e exibe o nome.
- O payload enviado ao criar/editar uma pessoa inclui `comum_congregacao_id: uuid | null`.
- O GET de `/api/pessoas` e `/api/pessoas/[id]` já inclui a associação (`include: ComumCongregacao`) para retornar `{ id, nome }`.

## Padrão de rotas de API

Todas as rotas são protegidas por `withAuth` de `@/lib/middleware/auth`.

```ts
export const GET = withAuth(async (req, user, context) => { … })
```

Paginação padrão: `?page=1&limit=10`. Resposta: `{ data, total, page, limit, totalPages }`.

## Padrão de páginas (dashboard)

- Listagem: busca com debounce/submit, tabela clicável por linha, paginação.
- Formulário (novo): rota estática `/novo/page.tsx` com prioridade sobre `[id]`.
- Formulário (edição): `/[id]/page.tsx`, carrega dados na montagem, AlertDialog para exclusão.
- Feedback de erros e sucesso via `<p>` estilizado (não toast).

## Testes

Testes unitários em `test/unit/` com Jest + ts-jest. Cobrem:
- `lib/`: api, jwt, middleware-auth, errors-utils
- `services/`: auth, pessoa, fixa

## Migrações

Numeradas sequencialmente com prefixo `2026000N`. Criar sempre o próximo número disponível. Migrations existentes:

| Arquivo | O que faz |
|---|---|
| 20260001 | Cria tabela `pessoas` |
| 20260002 | Cria tabela `fixa` |
| 20260003 | Cria tabela `audit_log` |
| 20260004 | Cria tabela `login_log` |
| 20260005 | Adiciona `email` em `pessoas` |
| 20260006 | Preserva logs ao excluir pessoas (FK nullable) |
| 20260007 | Remove NOT NULL de `usuario_id` nos logs |
| 20260008 | Cria tabela `comum_congregacao` |
| 20260009 | Adiciona `comum_congregacao_id` em `pessoas` (SET NULL on delete) |
