# OTG-LP - Grupo VIP com validacao Pix por IA/OCR

Landing page para o teste tecnico do Grupo OTG, Opcao A. O fluxo permite upload de comprovante Pix, faz leitura automatizada por OCR, valida valor minimo e libera o link do WhatsApp apenas quando o comprovante e aprovado.

## Stack

- React 18
- Vite
- Tesseract.js para OCR no navegador
- CSS puro com tokens de design
- Meta Pixel e GA4 encapsulados em `src/tracking.js`

## Como rodar

```bash
pnpm install
pnpm run dev
```

Build de producao:

```bash
pnpm run build
pnpm run preview
```

## Configuracao

Copie `.env.example` para `.env.local` e ajuste:

```bash
VITE_MIN_PIX_AMOUNT=97
VITE_WHATSAPP_URL=https://wa.me/5500000000000?text=Pix%20validado
VITE_META_PIXEL_ID=
VITE_GA4_ID=
```

## Fluxo implementado

1. Usuario acessa a LP e clica para validar o comprovante.
2. Envia uma imagem PNG, JPG ou WEBP.
3. O app roda OCR localmente com `tesseract.js`.
4. `src/pixValidator.js` procura termos Pix, valor em reais, banco provavel e calcula score.
5. Se o valor identificado for maior ou igual ao minimo configurado e o score for suficiente, o botao do WhatsApp e liberado.
6. Eventos importantes sao enviados para Meta Pixel/GA4 quando os IDs estiverem configurados.

## Criterios de aprovacao

O comprovante precisa conter:

- termo relacionado a Pix;
- valor monetario reconhecido;
- valor maior ou igual a `VITE_MIN_PIX_AMOUNT`;
- score final minimo de 65.

Banco provavel aumenta a confianca, mas nao e obrigatorio para aprovacao.

## Decisoes tecnicas

O OCR roda no cliente para acelerar a entrega do teste e evitar expor chaves de IA. Isso tambem torna o prototipo simples de publicar em Vercel, Netlify ou GitHub Pages.

Para producao, eu moveria a decisao final para uma API serverless com:

- validacao antifraude mais robusta;
- armazenamento minimo de auditoria;
- rate limit por IP/dispositivo;
- OCR gerenciado ou IA multimodal;
- comparacao com transacoes recebidas no PSP, quando disponivel.

## Limitacoes conhecidas

- OCR depende da nitidez do print.
- A validacao atual demonstra o fluxo, mas nao substitui conciliacao bancaria real.
- Comprovantes muito estilizados podem exigir regras extras de parsing.

## Continuidade

Veja `PROJECT_STATUS.md` para contexto rapido do que foi feito, decisoes tomadas e proximas etapas.
