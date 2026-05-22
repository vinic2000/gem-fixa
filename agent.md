# Regras de Desenvolvimento do Projeto

## 1) Stack e organização
- Projeto baseado em **Next.js** com separação clara entre frontend e backend.
- Banco de dados oficial: **PostgreSQL**.
- Manter estrutura de pastas organizada (ex.: `app/`, `test/`, `config/`, `database/`).

## 2) Metodologia obrigatória: TDD
Seguir sempre o ciclo:
1. **Red**: escrever um teste que falha para o comportamento desejado.
2. **Green**: implementar o mínimo necessário para o teste passar.
3. **Refactor**: melhorar o código mantendo todos os testes passando.

Regras práticas de TDD:
- Nenhuma feature nova sem teste antes.
- Toda correção de bug deve incluir teste que reproduz o problema.
- Refatorações devem preservar cobertura e comportamento.

## 3) Boas práticas de código
- Código limpo, legível e com nomes explícitos.
- Funções pequenas e com responsabilidade única.
- Evitar duplicação (DRY) com parcimônia.
- Tratar erros de forma explícita (backend e integrações).
- Validar entradas de API e sanitizar dados.

## 4) API e backend
- Padronizar contratos de request/response.
- Retornar status HTTP corretos.
- Centralizar regras de negócio em serviços/use-cases.
- Evitar lógica de negócio em controllers/rotas.

## 5) Banco de dados (PostgreSQL)
- Usar migrations versionadas para qualquer alteração de schema.
- Definir constraints (PK, FK, UNIQUE, NOT NULL) sempre que aplicável.
- Criar índices para consultas críticas.
- Nunca alterar schema manualmente em produção sem migration.
- Regra de negócio: não usar `onDelete` para apagar `fixa` automaticamente ao excluir `pessoas`.
- Se pessoa (tipo `aluno`) tiver vínculo em `fixa`, excluir as fixas manualmente e depois excluir a pessoa.
- Se pessoa for `instrutor`, permitir exclusão da entidade `pessoas` mantendo `fixa`.

## 6) Testes
- Priorizar testes unitários e complementar com integração.
- Manter testes determinísticos e independentes.
- Evitar mocks excessivos quando integração real é viável.
- Cobrir fluxos felizes e casos de erro.

## 7) Qualidade e revisão
- Todo PR deve:
  - explicar contexto e decisão técnica;
  - listar testes executados;
  - evitar mudanças não relacionadas.
- Não fazer commit de segredos (.env, chaves, tokens).

## 8) Observabilidade e manutenção
- Logs úteis, sem vazar dados sensíveis.
- Mensagens de erro claras para suporte e debugging.
- Documentar decisões arquiteturais relevantes.
- Regra obrigatória: logs (ex.: `audit_log`, `login_log`) devem ser sempre mantidos; nunca excluir logs ao excluir qualquer entidade de negócio.

## 9) Convenções de trabalho
- Commits pequenos e objetivos.
- Preferir mudanças incrementais.
- Em caso de dúvida, priorizar simplicidade.
