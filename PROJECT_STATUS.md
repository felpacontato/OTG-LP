# OTG-LP — status de continuidade

Última atualização: 2026-07-23

## Implementado na branch de conclusão

- fluxo completo de upload, preview, troca e remoção;
- drag and drop;
- validação de tamanho, tipo, extensão e magic bytes;
- OCR local com timeout, cancelamento e encerramento do worker;
- parser contextual para não confundir saldo com valor do Pix;
- instituição, valor, moeda, confiança OCR e confiança combinada;
- estados `approved`, `below_minimum`, `low_confidence` e `unrecognized`;
- identificador `PIX-XXXXXXXX`;
- WhatsApp renderizado somente após aprovação;
- Meta Pixel e GA4 com scripts oficiais;
- eventos obrigatórios e deduplicação;
- compliance 18+, jogo responsável e ausência de lucro garantido;
- seção de privacidade;
- testes unitários;
- workflow de CI;
- README técnico e checklist de evidências.

## Dependências externas ainda necessárias

- URL real do WhatsApp;
- Meta Pixel ID real;
- GA4 Measurement ID real;
- projeto Vercel novo;
- evidências reais do Meta Pixel Helper e GA4 DebugView;
- testes manuais com imagens fictícias representativas.

## Validação local pendente

Depois de baixar a branch:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run dev
```

Em seguida, testar no navegador em desktop e mobile e preencher `docs/EVIDENCES.md`.
