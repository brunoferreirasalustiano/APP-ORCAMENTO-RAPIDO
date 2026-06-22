# Orcamento Rapido

App mobile premium em **React Native + Expo**, criado para gerar orcamentos profissionais, salvar historico local, gerar PDF e compartilhar com clientes.

## Rodar localmente

Instale as dependencias:

```powershell
npm install
```

Rode o app:

```powershell
npm start
```

Validar no navegador:

```powershell
npm run web
```

Validar tipos:

```powershell
npm run typecheck
```

Validar padrao de codigo:

```powershell
npm run lint
```

## O que ja funciona

- App React Native com Expo SDK 53.
- TypeScript em modo estrito.
- Navegacao por abas.
- Cadastro de empresa.
- Criacao de orcamento.
- Itens com quantidade, valor e tipo.
- Calculo de subtotal, desconto e total.
- Historico local com AsyncStorage.
- Abrir e duplicar orcamentos salvos.
- Geracao e compartilhamento de PDF com Expo Print/Sharing.
- Envio por WhatsApp via link nativo.
- Trial local de 7 dias.
- Tela Premium com produto `premium_lifetime`.
- Desbloqueio simulado para desenvolvimento.
- Configuracao EAS para gerar APK interno e AAB de producao.
- Expo Doctor passando sem alertas.
- ESLint v9 configurado para TypeScript.

## Comandos de build

APK interno:

```powershell
npx eas build --profile preview --platform android
```

App Bundle para Play Store:

```powershell
npx eas build --profile production --platform android
```

## Produto Premium

Produto na Play Console:

```text
premium_lifetime
```

Modelo:

```text
Compra unica vitalicia
```

Preco inicial:

```text
R$ 9,90
```

## Observacao tecnica

O botao Premium ainda usa desbloqueio simulado para desenvolvimento. Na etapa de publicacao, substituir esse ponto por Google Play Billing ou RevenueCat mantendo o mesmo entitlement `premium_lifetime`.

Existe um `postinstall` em `scripts/patch-expo-modules-core.cjs` para corrigir o `main` local de `expo-modules-core` neste ambiente, onde o pacote estava apontando para `src/index.ts` durante o start do Expo.

## Plano de produto

O plano completo para Play Store esta em:

```text
docs/PLANO-PREMIUM-PLAY-STORE.md
```
