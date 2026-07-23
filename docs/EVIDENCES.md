# Evidencias da entrega OTG-LP

Data local da ultima validacao: 2026-07-23
Branch: `agent/complete-option-a`

> Nao inclua comprovantes reais com nome, CPF, CNPJ, chave Pix, conta, agencia, telefone ou identificador bancario.

## Publicacao

- URL publica: https://otg-lp.vercel.app
- Commit publicado: preencher apos push final desta atualizacao
- WhatsApp real: `https://wa.me/5511978949127`
- Meta Pixel real: BLOQUEADO POR VALOR EXTERNO (`VITE_META_PIXEL_ID`)
- GA4 real: `G-9LR1VZ5FG5`

## Qualidade Local

```text
pnpm install --frozen-lockfile
Resultado: passou
```

```text
pnpm run lint
Resultado: passou
```

```text
pnpm run test
Resultado: passou - 23 testes, 23 pass, 0 fail
```

```text
pnpm run build
Resultado: passou
```

```text
pnpm run check
Resultado: passou
```

## Matriz Final

| Requisito | Arquivo/implementacao | Teste executado | Evidencia | Status |
| --- | --- | --- | --- | --- |
| Headline e beneficio | `src/main.jsx` | Build local | Interface compila | CONCLUIDO |
| Aviso 18+ | `src/main.jsx` | Build local | Compliance bar | CONCLUIDO |
| Jogo responsavel | `src/main.jsx` | Build local | Secao responsavel | CONCLUIDO |
| Upload e preview | `src/main.jsx` | Build local | Fluxo implementado | CONCLUIDO |
| Tipos PNG/JPG/WebP | `src/config.js`, `src/fileValidation.js` | `pnpm run test` | Testes de metadata/signature | CONCLUIDO |
| Limite de upload | `src/config.js`, `src/fileValidation.js` | `pnpm run test` | Arquivo acima do limite | CONCLUIDO |
| Magic bytes | `src/fileValidation.js` | `pnpm run test` | PNG/JPEG/WebP/mismatch | CONCLUIDO |
| Loading OCR | `src/main.jsx`, `src/pixValidator.js` | Build local | Barra de progresso | CONCLUIDO |
| Banco/instituicao | `src/pixRules.js` | `pnpm run test` | Regra Pix com Nubank | CONCLUIDO |
| Valor e moeda | `src/pixRules.js` | `pnpm run test` | BRL e valores minimos | CONCLUIDO |
| Confianca OCR | `src/pixRules.js` | `pnpm run test` | Baixa confianca rejeitada | CONCLUIDO |
| Minimo configuravel | `src/config.js`, `.env.example` | Build local | `VITE_MIN_PIX_AMOUNT` | CONCLUIDO |
| Pix R$ 97,00 aprovado | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Pix R$ 96,99 abaixo do minimo | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Pix R$ 10 + saldo R$ 5000 usa R$ 10 | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Imagem/texto sem Pix | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Valores concorrentes | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Moeda ausente | `src/pixRules.js` | `pnpm run test` | Teste unitario | CONCLUIDO |
| Privacidade | `src/main.jsx`, `README.md` | Build local | Copy e tracking sem PII | CONCLUIDO |
| WhatsApp condicional | `src/main.jsx`, `src/validationId.js` | `pnpm run test` | URL vazia/invalida/permitida | CONCLUIDO |
| WhatsApp real | Vercel env production | Redeploy producao | `VITE_WHATSAPP_URL` configurado | CONCLUIDO |
| PageView/page_view por carregamento | `src/tracking.js` | `pnpm run test` | Dedupe em memoria | CONCLUIDO |
| InitiateCheckout/begin_checkout na intencao de upload | `src/main.jsx`, `src/tracking.js` | `pnpm run test` | Dedupe begin_checkout | CONCLUIDO |
| Purchase/purchase somente aprovado | `src/main.jsx`, `src/tracking.js` | `pnpm run test` | Payload validado | CONCLUIDO |
| Purchase dedupe por validationId | `src/tracking.js` | `pnpm run test` | `purchase:{validationId}` | CONCLUIDO |
| GA4 real | Vercel env production + `src/tracking.js` | Redeploy producao | `VITE_GA4_ID=G-9LR1VZ5FG5` | CONCLUIDO |
| Meta Pixel real | `src/tracking.js` | Events Manager aberto no navegador do app | UI `Conectar dados > Web` fecha apos avancar; ID existente `1595440109253297` pertence a `Lunna-Helena-Universe` e nao foi usado | BLOQUEADO POR VALOR EXTERNO |
| Responsividade desktop/mobile | `src/styles.css` | Nao executado em navegador real nesta etapa | Precisa screenshot | NAO CONCLUIDO |
| README | `README.md` | Revisao local | Atualizado | CONCLUIDO |
| `.env.example` | `.env.example` | Revisao local | WhatsApp vazio | CONCLUIDO |
| Defesa da stack | `README.md` | Revisao local | React + Vite + Tesseract | CONCLUIDO |
| Link publico | Vercel novo `felpa-dev-studio/otg-lp` | Deploy em producao via CLI | https://otg-lp.vercel.app | CONCLUIDO |

## Evidencias Pendentes Para Completar Depois

- Screenshot desktop 1440 x 900.
- Screenshot tablet 768 x 1024.
- Screenshot mobile 375 x 812.
- Upload com preview.
- Estado aprovado com fixture ficticia.
- Estado abaixo do minimo com fixture ficticia.
- Estado baixa confianca com fixture ficticia.
- Arquivo invalido.
- Meta Pixel Helper: `PageView`, `InitiateCheckout`, `Purchase`.
- GA4 DebugView: `page_view`, `begin_checkout`, `purchase`.
- Confirmacao de ausencia de Purchase em rejeicao.
- Confirmacao de ausencia de duplicidade em reanalise do mesmo arquivo.
- OCR real no navegador com imagens ficticias.
