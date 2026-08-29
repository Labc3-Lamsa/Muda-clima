**Parecer Técnico — Segurança da Plataforma ClimArS**

**Resumo Executivo**

Este parecer técnico sumariza o estado atual da segurança da plataforma ClimArS, os principais achados, o impacto associado e o plano de ação imediato e de médio prazo. Recomenda-se enviar este documento em PDF para a equipe e partes interessadas antes da reunião técnica.

**Contexto**

A análise incluiu varredura estática do código, revisão das dependências com `npm audit` e inspeção manual dos pontos críticos. O relatório detalhado está em [SECURITY_REPORT.md](SECURITY_REPORT.md). Arquivos de referência: [backend/server.js](backend/server.js#L1-L400) e [package.json](package.json#L1-L200).

**Achados Principais (síntese)**

- Credenciais do banco de dados hardcoded no servidor (alto risco).
- Risco de SQL Injection no endpoint `/datasus` devido à interpolação direta de nomes de coluna.
- Rotas sensíveis sem autenticação/autorização adequada.
- Possível XSS no chat (uso de `innerHTML`).
- CORS permissivo e ausência de mecanismos de rate-limiting.
- Dependências com vulnerabilidades de alta severidade detectadas pelo `npm audit` (6 alertas críticos/altos).

Detalhes e evidências estão no relatório técnico: [SECURITY_REPORT.md](SECURITY_REPORT.md).

**Impacto**

- Comprometimento da confidencialidade e integridade dos dados (acesso indevido ao banco).
- Possibilidade de execução remota de código no cliente (XSS) ou DoS via vulnerabilidades em bibliotecas.
- Exposição pública de modelos e dados sensíveis se não houver controle de acesso.

**Correções Imediatas (a executar antes da reunião)**

1. Remover credenciais hardcoded e mover para variáveis de ambiente (`PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_DB`, `PG_PORT`). Criar `.env.example` e adicionar `.env` em `.gitignore`.
2. Remover `console.log(req.body)` e quaisquer logs que exponham dados sensíveis.
3. Implementar whitelist para nomes de coluna aceitos pelo endpoint `/datasus` e usar parâmetros preparados para os valores.
4. Substituir uso de `innerHTML` por `textContent` ou sanitizar mensagens no chat.
5. Restringir CORS a origens confiáveis e adicionar `express-rate-limit` para endpoints críticos.

**Plano de Ação (curto e médio prazo)**

- Curto prazo (1–2 semanas)
  - Aplicar as correções imediatas acima.
  - Criar usuário do banco com privilégios mínimos (leitura) para a aplicação.
  - Testes básicos de regressão funcional.

- Médio prazo (3–6 semanas)
  - Atualizar dependências conforme `npm audit fix` e validar compatibilidade.
  - Implementar `helmet` e políticas de headers de segurança.
  - Implementar autenticação e autorização nas rotas sensíveis (JWT/OAuth ou outro esquema corporativo).
  - Implementar dashboard interno para monitoramento de acessos e incidentes (área restrita para devs).

- Longo prazo (após correções e hardening)
  - Contratar/realizar pentest externo (blackbox) e reavaliar findings.
  - Programar varreduras regulares de dependências e revisão semestral de segurança.

**Fluxo para resposta a incidentes (proposta inicial)**

1. Detectado incidente → Isolar o serviço afetado (possibilidade de “botão de escape” operacional no dashboard).
2. Bloquear IPs maliciosos e coletar logs relevantes.
3. Restauração a partir de backup conhecido e análise post-mortem.

**Recomendações técnicas (rápidas)**

- Criar `.env` e gerenciar secrets fora do repositório.
- Implementar validação de entrada com `Joi`/`celebrate` ou equivalente.
- Remover exposição pública a modelos sensíveis; servir downloads apenas via endpoint autenticado.
- Limitar privilégios do usuário do BD usado pela aplicação.
- Configurar monitoramento e alertas (logs centralizados, métricas, alertas por anomalia).

**Responsáveis e prazos sugeridos**

- Correções críticas: Equipe de desenvolvimento — 3 dias úteis.
- Atualização de dependências e testes: DevOps/Desenvolvimento — 1 semana.
- Implementação de autenticação e dashboard: Desenvolvimento + Infra — 3 semanas.
- Pentest e remediação final: Terceirizado/Equipe de Segurança — agendar após as correções (2–4 semanas).

**Anexo — Sumário do `npm audit`**

Detectadas 6 vulnerabilidades de alta severidade; referência e recomendações completas em [SECURITY_REPORT.md](SECURITY_REPORT.md).

---
Documento gerado para uso interno e envio a stakeholders. Posso também:

- Gerar uma versão em PDF pronta para envio; ou
- Preparar slides/ata para reunião; ou
- Aplicar automaticamente as correções críticas no código e abrir um PR.

Informe qual dessas opções prefere que eu execute a seguir.
