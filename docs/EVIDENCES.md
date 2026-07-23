# Evidências da entrega

> Não inclua comprovantes reais com nome, CPF, chave Pix, conta, agência ou identificador bancário.

## Publicação

- URL pública:
- Data da publicação:
- Commit publicado:

## Interface

- [ ] Screenshot desktop do hero
- [ ] Screenshot mobile do hero
- [ ] Screenshot do upload com preview
- [ ] Screenshot do estado aprovado
- [ ] Screenshot do estado abaixo do mínimo
- [ ] Screenshot do estado de baixa confiança
- [ ] Screenshot do aviso 18+ e jogo responsável

## Meta Pixel

- Pixel ID usado:
- [ ] Meta Pixel Helper detectou `PageView`
- [ ] Meta Pixel Helper detectou `InitiateCheckout`
- [ ] Meta Pixel Helper detectou `Purchase` somente após aprovação
- Link ou screenshot da evidência:

## GA4

- Measurement ID usado:
- [ ] DebugView detectou `page_view`
- [ ] DebugView detectou `begin_checkout`
- [ ] DebugView detectou `purchase`
- [ ] `purchase.transaction_id` usa o código `PIX-XXXXXXXX`
- Link ou screenshot da evidência:

## Qualidade

Cole as saídas finais:

```text
pnpm run lint
```

```text
pnpm run test
```

```text
pnpm run build
```

## Testes manuais

- [ ] JPG válido
- [ ] PNG válido
- [ ] WebP válido
- [ ] Arquivo acima de 4 MiB recusado
- [ ] Extensão/MIME incompatível recusado
- [ ] Pix no mínimo aprovado
- [ ] Pix abaixo do mínimo reprovado
- [ ] Imagem não Pix reprovada
- [ ] WhatsApp ausente antes da aprovação
- [ ] WhatsApp presente após aprovação
- [ ] Purchase não duplicado ao renderizar novamente
