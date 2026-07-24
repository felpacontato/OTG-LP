# OTG-LP - status de entrega

Ultima atualizacao: 2026-07-24
Branch de trabalho: `feature/option-a-pix-ocr`
Repositorio: `felpacontato/OTG-LP`
URL publica: https://otg-lp.vercel.app
Projeto Vercel: `felpa-dev-studio/otg-lp`

## Concluido

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
- README tecnico e matriz de evidencias em `docs/EVIDENCES.md`;
- deploy de producao em projeto Vercel novo e isolado: https://otg-lp.vercel.app.
- `VITE_WHATSAPP_URL=https://wa.me/5511978949127` configurado na Vercel em producao;
- `VITE_GA4_ID=G-9LR1VZ5FG5` configurado na Vercel em producao;
- dataset/pixel Meta novo `OTG-LP` criado no portfolio `Felipe Macedo`;
- `VITE_META_PIXEL_ID=1309553809947329` configurado na Vercel em producao;
- redeploy de producao com WhatsApp, GA4 e Meta Pixel em https://otg-lp.vercel.app;
- fixtures ficticias de imagem para OCR real em `docs/evidence/fixtures/`;
- screenshots de evidencia em `docs/evidence/`;
- testes manuais em viewports desktop, tablet e mobile;
- validacao de eventos Meta Pixel via rede/CDP;
- validacao de eventos GA4 via `dataLayer`;
- acompanhamento final do GitHub Actions apos push.

## Validacao executada

```text
pnpm install --frozen-lockfile -> passou
pnpm run lint -> passou
pnpm run test -> passou (23 testes)
pnpm run build -> passou
pnpm run check -> passou
GitHub Actions CI -> passou
```

## Evidencias

As evidencias de homologacao estao descritas em `docs/EVIDENCES.md`.
