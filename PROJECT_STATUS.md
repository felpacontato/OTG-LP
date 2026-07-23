# OTG-LP - status de continuidade

Ultima atualizacao: 2026-07-23
Branch de trabalho: `agent/complete-option-a`
Repositorio: `felpacontato/OTG-LP`

## Concluido localmente

- fluxo de upload, preview, troca e remocao;
- drag and drop;
- validacao de tamanho, tipo, extensao e magic bytes;
- OCR local com timeout, cancelamento e encerramento do worker;
- parser contextual para nao confundir saldo com valor do Pix;
- instituicao, valor, moeda, confianca OCR e confianca combinada;
- estados `approved`, `below_minimum`, `low_confidence` e `unrecognized`;
- `validationId` estavel para o mesmo arquivo durante a sessao;
- WhatsApp renderizado somente apos aprovacao e somente com URL valida;
- `.env.example` com `VITE_WHATSAPP_URL=` vazio;
- Meta Pixel e GA4 com scripts oficiais quando IDs existem;
- `PageView/page_view` uma vez por carregamento real da pagina;
- `InitiateCheckout/begin_checkout` na primeira intencao de upload;
- `Purchase/purchase` somente apos aprovacao, deduplicado por `purchase:{validationId}`;
- deduplicacao com fallback em memoria quando `sessionStorage` falha;
- compliance 18+, jogo responsavel e ausencia de promessa de lucro;
- secao de privacidade;
- testes unitarios de Pix, arquivo, WhatsApp e tracking;
- workflow de CI com Node 22, pnpm 9, `pnpm install --frozen-lockfile` e `pnpm run check`;
- README tecnico e matriz de evidencias em `docs/EVIDENCES.md`.

## Validacao local executada

```text
pnpm install --frozen-lockfile -> passou
pnpm run lint -> passou
pnpm run test -> passou (23 testes)
pnpm run build -> passou
pnpm run check -> passou
```

## Bloqueado por valores externos

- `VITE_WHATSAPP_URL` real;
- `VITE_META_PIXEL_ID` real;
- `VITE_GA4_ID` real;
- projeto Vercel novo e isolado;
- validacao real no Meta Pixel Helper;
- validacao real no GA4 DebugView.

## Ainda nao concluido

- testes manuais em navegador real nos viewports 1440 x 900, 768 x 1024 e 375 x 812;
- fixtures ficticias de imagem para OCR real;
- screenshots em `docs/evidence/`;
- URL publica de producao;
- acompanhamento final do GitHub Actions apos push.

## Proximo passo recomendado para GPT/Codex continuar

1. Confirmar que esta na branch `agent/complete-option-a`.
2. Rodar `pnpm run check`.
3. Configurar valores reais em ambiente seguro ou no Vercel novo.
4. Publicar em um projeto Vercel novo, sem reutilizar projetos Lenterne.
5. Testar OCR com fixtures ficticias e preencher `docs/EVIDENCES.md`.
6. Validar Meta Pixel Helper e GA4 DebugView.
7. Atualizar o PR #1 sem fazer merge.
