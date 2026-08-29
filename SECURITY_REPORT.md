**Relatório de Segurança — Projeto ClimArS**

Resumo executivo
- Varredura feita: inspeção estática de arquivos chaves e `npm audit`.
- Prioridade imediata: credencial hardcoded e 6 vulnerabilidades de alta severidade em dependências.

Achados críticos

- Credencial em código: senha do PostgreSQL está hardcoded em `backend/server.js` (password: 'admin'). Risco: vazamento em repositórios e ambientes.
- Interpolação insegura de nomes de colunas: o endpoint `/datasus` injeta `m.${pop}` e `i.${inmet}` diretamente no SQL sem validação/whitelist — risco de injeção por manipulação dos nomes de coluna.
- `console.log(req.body)` em `backend/server.js` pode vazar dados sensíveis nos logs.
- CORS totalmente aberto via `app.use(cors())` — permite origens não autorizadas.
- Uso de `child_process.spawn("ollama", ...)` com prompt derivado do usuário — risco operacional e de injeção no contexto de execução externa.
- Exposição de modelos e arquivos estáticos via `express.static` sem autenticação (pasta `modelos_XGboost_onnx_todas_cidades_pneumonia`).

Vulnerabilidades de dependências (resumo do `npm audit`)

Resumo rápido (extraído do `npm audit --json`):
- Total de dependências analisadas: 147
- Vulnerabilidades: 6 de alta severidade

Dependências e avisos relevantes:
- `onnxruntime-node` (direta) — via `adm-zip`: CVE / GHSA - crafted ZIP triggers 4GB allocation. Fix sugerido: `onnxruntime-node@1.21.1` (observação: alteração semver maior indicada). Veja: https://github.com/advisories/GHSA-xcpc-8h2w-3j85
- `brace-expansion`, `minimatch`, `picomatch`, `path-to-regexp` — várias vulnerabilidades DoS/ReDoS em versões transitivas; `npm audit` recomenda atualizações transitivas quando possível.

Arquivo de saída do `npm audit` (resumo JSON salvo localmente):

```json
/* Relatório JSON resumido: vulnerabilities: 6 (high) */
{
  "metadata": { "vulnerabilities": { "high": 6, "total": 6 } }
}
```

Evidências (trechos)
- Credencial hardcoded: [backend/server.js](backend/server.js)
- Interpolação de colunas no SQL: [backend/server.js](backend/server.js)
- `npm audit` resultado (resumo): incluído no relatório e disponível na saída do comando.

Recomendações de correção (prioridade alta)

1) Remover credenciais do código
   - Mover credenciais para variáveis de ambiente (ex.: `PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_DB`, `PG_PORT`).
   - Adicionar um `.env` local e garantir que esteja em `.gitignore`.
   - Exemplo de alteração no `backend/server.js`:

```js
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});
```

2) Corrigir injeção de SQL via nomes de colunas
   - Não interpolar nomes de colunas diretamente a partir do input do usuário.
   - Implementar whitelist de colunas permitidas e mapear parâmetros de entrada para nomes de colunas aprovados.

3) Remover logs sensíveis
   - Remover `console.log(req.body)` ou sanitizar/filtrar campos antes de logar.

4) Hardenização do servidor
   - Restringir CORS a origens confiáveis: `app.use(cors({ origin: ['https://meudominio'] }))`.
   - Adicionar `helmet` para headers de segurança.
   - Adicionar `express-rate-limit` para proteger endpoints críticos.

5) Revisar execução de processos externos
   - Evitar inserir conteúdo do usuário em prompts/args sem sanitização.
   - Implementar timeouts e limites de recursos; validar a presença do binário e tratar erros com cuidado.

6) Proteger arquivos estáticos sensíveis
   - Não expor modelos sensíveis publicamente; servir via endpoint autenticado ou restringir por autorização.

7) Atualizar dependências
   - Tentar resolver automaticamente:

```bash
npm audit fix
npm update
```

   - Se necessário, usar `npm audit fix --force` com cautela (pode causar breaking changes):

```bash
npm audit fix --force
```

   - Para `onnxruntime-node`: avaliar a atualização para uma versão corrigida compatível (ver `npm audit` output). Pode ser necessário ajustar código por mudanças semânticas entre versões maiores.

Próximos passos sugeridos (posso executar se autorizar)
- Posso aplicar correções automáticas mínimas (mover credenciais para `process.env`, remover `console.log` de debug e adicionar whitelist para colunas) — precisa de confirmação.
- Posso abrir PR com mudanças propostas.
- Posso rodar `npm audit fix` e reportar diferenças (recomendo revisão manual antes de fazer `--force`).

Arquivos-chave para revisão manual rápida:
- [backend/server.js](backend/server.js)
- [package.json](package.json)

Relatório gerado automaticamente por análise estática local e `npm audit` executado no ambiente.

---
Se quiser, aplico as correções mínimas agora (mover credenciais para env + remover log debug + adicionar whitelist para colunas). Ou executo `npm audit fix` com cuidado. Informe qual ação prefere.
