@AGENTS.md

## Regra de exclusão de Pessoa
- Não usar exclusão em cascata via `onDelete` para remover registros de `fixa`.
- Se a pessoa for do tipo **aluno** e possuir vínculo em `fixa`, a exclusão da pessoa deve remover manualmente as `fixa` vinculadas antes.
- Se a pessoa for **instrutor**, a entidade `pessoas` pode ser excluída normalmente, mantendo registros de `fixa`.
- Logs devem sempre ser mantidos (`audit_log`, `login_log` etc.); excluir uma entidade nunca deve apagar seus logs.
