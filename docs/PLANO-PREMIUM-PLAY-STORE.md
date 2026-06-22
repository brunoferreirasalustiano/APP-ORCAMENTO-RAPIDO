# Orcamento Rapido - Plano Premium para Play Store

## Diagnostico do projeto

O projeto atual tem uma boa direcao comercial: app gratis para baixar, teste completo por 7 dias e desbloqueio vitalicio por compra unica. Esse modelo combina com MEI, oficinas, mecanicos, funileiros e prestadores de servico porque evita assinatura mensal e reduz a barreira de compra.

No workspace atual existe apenas o asset `ORCAMENTO-FACIL.png`, usado como base visual da marca. Ainda nao ha codigo do aplicativo nesta pasta.

## Posicionamento recomendado

**Orcamento Rapido**

Crie orcamentos profissionais e envie pelo WhatsApp em minutos.
Use gratis por 7 dias. Depois, desbloqueie para sempre por apenas R$ 9,90.

## Modelo de monetizacao

| Item | Decisao |
| --- | --- |
| Download | Gratis |
| Trial | 7 dias com acesso completo |
| Pagamento | Compra unica dentro do app |
| Produto Play Console | `premium_lifetime` |
| Preco inicial | R$ 9,90 |
| Acesso apos compra | Vitalicio na conta Google |
| Assinatura | Nao usar no MVP |
| Anuncios | Nao usar |

O produto deve ser configurado como compra unica no Google Play Billing, nao como assinatura.

## Regras do trial

Na primeira abertura, o app salva localmente:

```json
{
  "firstOpenDate": "2026-06-19",
  "trialDays": 7,
  "trialEndsAt": "2026-06-26",
  "isPremium": false,
  "purchaseProductId": null
}
```

Durante o trial, todos os recursos principais ficam liberados. Depois do trial, o usuario continua visualizando dados antigos, mas precisa comprar para criar ou enviar novos orcamentos.

## O que liberar no trial

| Recurso | Trial |
| --- | --- |
| Criar orcamento | Sim |
| Gerar PDF | Sim |
| Enviar pelo WhatsApp | Sim |
| Enviar por e-mail | Sim |
| Historico local | Sim |
| Duplicar orcamento | Sim |
| Dados da oficina | Sim |
| Sem marca d'agua | Sim |

## O que bloquear apos o trial

| Acao | Status |
| --- | --- |
| Ver historico | Liberado |
| Abrir orcamento antigo | Liberado |
| Criar novo orcamento | Bloqueado |
| Duplicar orcamento | Bloqueado |
| Gerar novo PDF | Bloqueado |
| Enviar WhatsApp | Bloqueado |
| Enviar e-mail | Bloqueado |
| Comprar Premium | Liberado |
| Restaurar compra | Liberado |

## Telas essenciais do MVP premium

1. Boas-vindas
2. Cadastro dos dados da empresa
3. Novo orcamento
4. Itens do orcamento
5. Preview do orcamento
6. Historico
7. Tela Premium / Paywall
8. Configuracoes

## Paywall recomendado

Titulo:

**Desbloqueie o Orcamento Rapido Premium**

Texto:

Pague uma unica vez e use para sempre. Sem mensalidade. Sem complicacao.

Beneficios:

- Orcamentos ilimitados
- PDF profissional
- Envio pelo WhatsApp
- Envio por e-mail
- Historico local
- Dados da oficina salvos
- Sem marca d'agua

Botoes:

- Desbloquear Premium
- Restaurar compra

Frase de conversao:

**Um unico orcamento fechado ja paga o app.**

## Identidade visual

O logo atual passa velocidade e simplicidade. Para o app premium, a direcao visual deve manter o azul, mas com interface mais limpa e profissional.

| Elemento | Cor |
| --- | --- |
| Azul principal | `#0B3D91` |
| Azul acao | `#2563EB` |
| Verde sucesso | `#16A34A` |
| Fundo | `#F8FAFC` |
| Texto principal | `#111827` |
| Texto secundario | `#6B7280` |
| Borda | `#E5E7EB` |
| Premium | `#F59E0B` |

Direcao de UI:

- botoes grandes;
- formularios simples;
- historico escaneavel;
- cards discretos;
- PDF com cabecalho forte e total em destaque;
- linguagem direta, sem tom agressivo de bloqueio.

## Requisitos de Play Store

Antes de publicar:

- criar produto `premium_lifetime` na Play Console;
- configurar contas de teste;
- testar compra e restauracao;
- criar politica de privacidade;
- declarar coleta de dados corretamente;
- preparar screenshots profissionais;
- publicar primeiro em teste fechado;
- validar funcionamento em aparelhos Android reais.

## Stack recomendada

Para ir rapido:

- React Native com Expo;
- armazenamento local com AsyncStorage ou SQLite;
- PDF com biblioteca nativa compativel com Expo/EAS;
- compartilhamento via intent nativa para WhatsApp/e-mail;
- Google Play Billing via biblioteca compativel com build nativo;
- EAS Build para gerar AAB da Play Store.

Observacao: se a integracao direta com Google Play Billing atrasar o MVP, RevenueCat pode simplificar compra, restauracao e entitlement.

## Backlog inicial

### Etapa 1 - Base do app

- Criar projeto mobile.
- Definir tema visual premium.
- Criar navegacao principal.
- Adicionar logo e assets.

### Etapa 2 - Fluxo de orcamento

- Cadastro de empresa.
- Cadastro de cliente.
- Cadastro de itens.
- Calculo de subtotal, desconto e total.
- Preview do orcamento.
- Historico local.

### Etapa 3 - Documento profissional

- Gerar PDF.
- Compartilhar PDF.
- Enviar texto rapido para WhatsApp.
- Melhorar layout do PDF.

### Etapa 4 - Premium

- Salvar primeira abertura.
- Calcular dias restantes.
- Mostrar selo do trial.
- Bloquear acoes apos expirar.
- Criar paywall.
- Integrar compra `premium_lifetime`.
- Implementar restauracao.

### Etapa 5 - Publicacao

- Icone adaptativo.
- Splash screen.
- Screenshots da loja.
- Politica de privacidade.
- Build AAB.
- Teste fechado.

## Decisao final

O melhor caminho e construir um MVP premium simples, sem login e sem backend no inicio:

**7 dias gratis + compra unica de R$ 9,90 + PDF profissional + WhatsApp + historico local.**

Essa versao e suficiente para validar demanda, publicar na Play Store e comecar a vender sem aumentar demais a complexidade tecnica.
