# Agent instructions (Copilot, Claude Code, Codex, Cursor, OMC, etc.)

Este projeto e o backend Node do monorepo Taking Care.

## 1) Fonte de verdade

- Este arquivo define regras gerais para qualquer agente neste pacote.
- Em caso de conflito, priorize:
  1. Instrucao do usuario na tarefa atual
  2. Este AGENTS.md
  3. Guias especificos da ferramenta (ex.: CLAUDE.md, CURSOR.md)

## 2) Stack e foco tecnico

- Runtime: Node.js
- Framework HTTP: Express
- ORM: Sequelize
- Banco: PostgreSQL (via `pg`)
- Estado atual: JavaScript CommonJS
- Diretriz de evolucao: migrar novas features/refactors para TypeScript de forma incremental e segura

## 3) Especialistas esperados

Todos os agentes devem atuar com nivel senior nas trilhas abaixo quando solicitadas:

- React + Vite + Tailwind CSS v4
- Node.js + TypeScript
- FastAPI + Pydantic

Mesmo fora deste pacote, use essas referencias para definir contratos de API, validacao, padroes de arquitetura e qualidade.

## 4) Comandos de execucao

Sempre rode comandos deste pacote no diretorio `taking_care_server/` usando npm no host.

- Instalar dependencias: `npm install`
- Desenvolvimento: `npm run dev`
- Execucao padrao: `npm start`
- Migracoes: `npm run migrate`

## 5) Regras de implementacao

- Mudancas pequenas e focadas.
- Evitar breaking changes sem necessidade clara.
- Para novos endpoints:
  - validar input explicitamente (schema/validator)
  - padronizar resposta de erro
  - manter separacao controller/service/model
- Em novas implementacoes, preferir codigo compativel com TypeScript e tipagem explicita.

## 6) Qualidade e seguranca

- Nao expor segredos em codigo, logs ou respostas de erro.
- Usar `.env`/`.env.example` para configuracao.
- Nao registrar dados sensiveis de usuarios em texto aberto.
- Adicionar/atualizar testes quando o projeto tiver suite definida para o escopo tocado.

## 7) FastAPI (referencia arquitetural)

Quando houver servicos Python no ecossistema:

- padronizar routers por dominio
- usar Pydantic para contratos
- centralizar regras de negocio em services
- explicitar autenticacao/autorizacao por camada

## 8) Rastreabilidade

Se existir TODO do pacote, manter status atualizado durante a execucao da tarefa.
