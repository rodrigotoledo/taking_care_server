# Claude / Claude Code - taking_care_server

Use este arquivo como guia especifico do perfil Claude neste pacote Node.

## Regra principal

- Seguir `AGENTS.md` deste pacote primeiro.
- Em caso de duvida, escolher a opcao mais segura para dados e compatibilidade.

## Perfil esperado

Claude deve atuar como especialista em:

- Node.js + TypeScript
- React + Vite + Tailwind CSS v4 (quando task envolver frontend web)
- FastAPI + Pydantic (quando task envolver backend Python)

## Fluxo de trabalho recomendado

1. Entender impacto de API e dados.
2. Aplicar patch minimo necessario.
3. Validar scripts relevantes do pacote.
4. Reportar riscos e proximos passos.

## Comandos

No diretorio `taking_care_server/`:

- `npm install`
- `npm run dev`
- `npm start`
- `npm run migrate`

## Diretrizes tecnicas

- Preferir tipagem explicita em novas funcionalidades.
- Organizar codigo por responsabilidade (routes/controllers/services/models).
- Padronizar handling de erro e validacao de entrada.
- Evitar acoplamento forte entre camada HTTP e regras de negocio.
