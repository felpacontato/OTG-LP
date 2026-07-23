# OTG-LP — Grupo VIP com validação Pix por OCR

Landing page criada para o teste técnico do Grupo OTG, **Opção A**. O fluxo recebe uma imagem de comprovante Pix, processa o OCR localmente, identifica instituição, valor, moeda e confiança, aplica regras auditáveis e só então libera o CTA do WhatsApp.

> A validação é visual. O sistema não confirma liquidação bancária, autenticidade do comprovante ou recebimento financeiro.

## Por que a Opção A

A Opção A foi escolhida porque permite demonstrar, em uma única jornada curta:

- landing page orientada à conversão;
- upload e preview de imagem;
- OCR/IA aplicada a uma tarefa real;
- regra de negócio configurável;
- liberação condicional de canal;
- Meta Pixel e GA4;
- privacidade, segurança e compliance.

A Opção B exigiria mais etapas de funil, captura de PII, envio de e-mail e maior número de integrações. Para o prazo do teste, a Opção A oferece melhor equilíbrio entre profundidade técnica, clareza da demonstração e risco operacional.

## Stack e justificativa

- **React 18 + Vite:** implementação rápida, bundle estático e deploy simples.
- **Tesseract.js:** OCR real no navegador, sem chave externa e sem upload do comprovante para o servidor.
- **CSS puro com tokens:** identidade visual própria e baixo custo de dependências.
- **Node Test Runner:** testes unitários sem adicionar framework ao lockfile.
- **Meta Pixel + GA4:** scripts oficiais carregados somente quando os IDs estão configurados.

O OCR client-side reduz a superfície de privacidade do MVP. Em produção, a decisão final deveria migrar para backend seguro e ser conciliada com PSP ou instituição bancária.

## Fluxo

```text
PageView / page_view
        ↓
Seleção de arquivo válido
        ↓
InitiateCheckout / begin_checkout
        ↓
Validação de tipo, extensão, tamanho e assinatura
        ↓
Preview local
        ↓
OCR local com timeout e cancelamento
        ↓
Extração contextual do valor
        ↓
Instituição + moeda + confiança
        ↓
Regra de aprovação
        ↓
Purchase / purchase somente se aprovado
        ↓
WhatsApp liberado somente se aprovado
```

## Critérios de aprovação

A validação retorna um dos estados:

- `approved`;
- `below_minimum`;
- `low_confidence`;
- `unrecognized`.

Para aprovar, é necessário:

- evidência textual de Pix;
- imagem minimamente legível;
- valor principal identificado sem ambiguidade relevante;
- moeda BRL identificada;
- valor maior ou igual a `VITE_MIN_PIX_AMOUNT`;
- confiança combinada maior ou igual a `VITE_MIN_OCR_CONFIDENCE`.

A confiança exibida separa:

- confiança do OCR retornada pelo Tesseract;
- score das regras;
- confiança combinada usada pelo fluxo.

## Proteção contra valor incorreto

O parser não escolhe simplesmente o maior número da imagem. Ele pontua cada valor usando o texto ao redor:

- aumenta o score perto de “valor do Pix”, “valor transferido”, “total pago” etc.;
- reduz o score perto de “saldo”, “limite”, “tarifa”, “cashback” etc.;
- marca como baixa confiança quando existem valores concorrentes com scores semelhantes.

## Upload

Formatos aceitos:

- PNG;
- JPG/JPEG;
- WebP.

As validações incluem:

- arquivo existente e não vazio;
- MIME aceito;
- extensão aceita;
- tamanho máximo configurável;
- magic bytes compatíveis com o MIME;
- preview local com revogação da Object URL;
- remoção e troca do arquivo;
- drag and drop.

## Tracking

### Meta Pixel

- `PageView`: uma vez por sessão/página;
- `InitiateCheckout`: na primeira seleção de arquivo válido;
- `Purchase`: somente após validação positiva.

### GA4

- `page_view`;
- `begin_checkout`;
- `purchase` com `transaction_id` igual ao código `PIX-XXXXXXXX`.

A deduplicação usa `sessionStorage`. O tracking não recebe imagem, nome, telefone, instituição, conteúdo OCR ou dados bancários.

## Privacidade e compliance

- OCR executado localmente no navegador;
- nenhuma imagem é armazenada pelo projeto;
- nenhum texto OCR é enviado aos analytics;
- aviso 18+ visível;
- mensagem de jogo responsável;
- ausência de promessa de lucro ou resultado;
- descrição explícita de que OCR não confirma pagamento bancário.

## Configuração

```bash
cp .env.example .env.local
```

Variáveis:

```env
VITE_MIN_PIX_AMOUNT=97
VITE_MIN_OCR_CONFIDENCE=55
VITE_MAX_UPLOAD_BYTES=4194304
VITE_OCR_TIMEOUT_MS=30000
VITE_WHATSAPP_URL=https://wa.me/55SEUNUMERO
VITE_META_PIXEL_ID=
VITE_GA4_ID=
```

`VITE_WHATSAPP_URL` não possui fallback falso. Sem uma URL configurada, o sistema informa que o canal ainda não está disponível.

## Execução

```bash
pnpm install
pnpm run dev
```

Validação completa:

```bash
pnpm run check
```

Comandos individuais:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

## Testes incluídos

- parsing monetário brasileiro;
- valor exatamente no mínimo;
- valor abaixo do mínimo;
- prevenção contra uso do saldo como valor Pix;
- valores concorrentes;
- ausência de evidência Pix;
- moeda não identificada;
- tamanho e tipo de arquivo;
- assinaturas JPEG, PNG e WebP.

## Deploy

Criar um projeto Vercel novo e isolado para este repositório. Não reutilizar projetos Lenterne.

1. importar `felpacontato/OTG-LP`;
2. framework preset: Vite;
3. build command: `pnpm run build`;
4. output: `dist`;
5. cadastrar as variáveis de produção;
6. publicar;
7. validar desktop e mobile.

## Evidências

Use [`docs/EVIDENCES.md`](docs/EVIDENCES.md) para registrar:

- URL pública;
- desktop e mobile;
- upload aprovado e reprovado;
- Meta Pixel Helper;
- GA4 DebugView;
- Network;
- lint, testes e build.

Não devem ser usadas imagens com dados pessoais reais.

## Limitações e evolução para produção

O MVP demonstra o fluxo, mas não funciona como antifraude bancário. Uma versão de produção deveria incluir:

- backend/serverless para decisão final;
- conciliação com PSP ou webhook bancário;
- detecção de comprovante reutilizado;
- rate limit distribuído;
- hash perceptual da imagem;
- política LGPD e retenção formal;
- observabilidade e trilha mínima de auditoria;
- análise multimodal server-side quando houver base legal e credenciais.
