# Cursor - contexto e instrucoes (taking_care_server)

## Regra principal

- Siga `AGENTS.md` deste pacote como fonte de verdade.
- Mantenha mudancas pequenas, focadas e com validacao minima necessaria.

## Especializacao obrigatoria

Quando aplicavel, responder e implementar com padrao senior em:

- Node.js + TypeScript
- React + Vite + Tailwind CSS v4
- FastAPI + Pydantic

## Fluxo

1. Identificar escopo do endpoint/modulo.
2. Implementar patch minimo.
3. Validar com scripts npm pertinentes.
4. Documentar impacto e riscos na resposta.

## Comandos do pacote

Executar no diretorio `taking_care_server/`:

- `npm install`
- `npm run dev`
- `npm start`
- `npm run migrate`

## Boas praticas

- Validacao de entrada para requests.
- Tratamento consistente de erros.
- Separacao clara entre controller e service.
- Preferencia por estruturas compativeis com migracao incremental para TypeScript.
