# OTG-LP - status de continuidade

Ultima atualizacao: 2026-07-23

## Objetivo

Teste tecnico do Grupo OTG, Opcao A: landing page para Grupo VIP com upload de comprovante Pix, validacao por IA/OCR, liberacao condicional do link de WhatsApp, Meta Pixel, GA4 e README com defesa tecnica.

## Ja feito

- Projeto React + Vite criado.
- Interface principal criada em `src/main.jsx`.
- OCR client-side via `tesseract.js` em `src/pixValidator.js`.
- Validacao por regras: termos Pix, valor minimo, banco provavel e score.
- WhatsApp fica desabilitado ate a aprovacao do comprovante.
- Tracking encapsulado em `src/tracking.js`, com fallback de debug no console.
- Configuracao por `.env.example`: valor minimo, WhatsApp, Meta Pixel e GA4.
- Design responsivo com tokens em `src/tokens.css` e CSS em `src/styles.css`.
- README tecnico criado em `README.md`.
- Dependencias instaladas com `pnpm`.
- `pnpm run lint` passou.
- `pnpm run build` passou.
- Servidor local iniciado em `http://127.0.0.1:5173`.
- Remote Git configurado: `https://github.com/felpacontato/OTG-LP.git`.

## Proximos passos sugeridos

1. Testar com prints reais de comprovante Pix.
2. Trocar `VITE_WHATSAPP_URL` pela URL real do grupo.
3. Inserir `VITE_META_PIXEL_ID` e `VITE_GA4_ID` se houver IDs reais.
4. Fazer commit e push para `felpacontato/OTG-LP.git`.
5. Opcional: adicionar uma API serverless para a decisao final em producao.

## Decisoes importantes

- O OCR roda no navegador para evitar expor chaves de IA e acelerar a entrega.
- Em producao, o ideal e mover a decisao final para backend/serverless, salvar auditoria minima e usar uma IA multimodal ou OCR gerenciado quando houver credenciais.
- A validacao atual e demonstravel e auditavel, mas nao deve ser tratada como antifraude definitivo.
