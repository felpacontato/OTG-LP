# OTG-LP

Landing page para validação de comprovantes Pix com OCR no navegador e liberação condicional de acesso a um grupo VIP.

## Visão geral

O projeto demonstra um fluxo de conversão no qual o usuário envia um comprovante, recebe uma validação automatizada e, quando os critérios são atendidos, obtém acesso ao canal de destino. A implementação prioriza resposta rápida, privacidade e uma experiência clara em dispositivos móveis.

## Tecnologias

- React 18 e Vite
- Tesseract.js
- CSS com tokens de design
- Meta Pixel e Google Analytics 4
- Vitest e ESLint

## Funcionalidades

- Upload de imagens PNG, JPG e WEBP
- OCR executado localmente no navegador
- Extração de valor e identificação de indicadores de pagamento Pix
- Pontuação de confiança para aprovação
- Liberação condicional do link de WhatsApp
- Eventos de conversão preparados para Meta Pixel e GA4
- Interface responsiva e estados de erro orientados ao usuário

## Arquitetura

A leitura do comprovante acontece no cliente, reduzindo o envio desnecessário de imagens para serviços externos. A validação combina termos relacionados a Pix, valor monetário identificado e uma pontuação mínima de confiança.

Para uma operação financeira em produção, a decisão final deve ser confirmada por uma API segura integrada ao provedor de pagamentos. O fluxo deste projeto representa a camada de experiência e validação preliminar.

## Execução local

```bash
pnpm install
pnpm run dev
```

Build de produção:

```bash
pnpm run build
pnpm run preview
```

## Configuração

Crie um arquivo `.env.local` a partir de `.env.example` e configure:

```bash
VITE_MIN_PIX_AMOUNT=97
VITE_WHATSAPP_URL=https://wa.me/5500000000000
VITE_META_PIXEL_ID=
VITE_GA4_ID=
```

Não versione credenciais ou identificadores privados.

## Qualidade

```bash
pnpm run lint
pnpm run test
pnpm run build
```

## Autor

Felipe Fernandes Prates

- [Portfólio](https://www.portfolio.felpamusic.com.br)
- [GitHub](https://github.com/felpacontato)
