import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { PREMIUM_PRICE, PREMIUM_PRODUCT_ID } from "../constants/business";
import { IS_DEV_BUILD } from "../constants/runtime";
import { colors, spacing } from "../constants/theme";
import { formatDate } from "../lib/dates";
import { useAppState } from "../hooks/useAppState";

const benefits = [
  "Orçamentos ilimitados",
  "PDF profissional",
  "Envio pelo WhatsApp",
  "Envio por e-mail",
  "Histórico local",
  "Dados da empresa salvos",
  "Sem marca d'água",
  "Pagamento único"
];

export function PremiumScreen() {
  const { hasPremiumEntitlement, trialInfo, unlockPremiumForTesting } = useAppState();

  return (
    <Screen title="Premium" subtitle="Pague uma única vez e use para sempre. Sem mensalidade. Sem complicação.">
      <Card style={styles.hero}>
        <Text style={styles.kicker}>Desbloqueio vitalício</Text>
        <Text style={styles.price}>{PREMIUM_PRICE}</Text>
        <Text style={styles.copy}>
          {hasPremiumEntitlement
            ? "Seu Premium está ativo neste aparelho."
            : trialInfo.isActive
              ? `Seu teste grátis termina em ${formatDate(trialInfo.endsAt)}.`
              : "Seu teste grátis terminou. Continue criando orçamentos profissionais."}
        </Text>
        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <Text key={benefit} style={styles.benefit}>
              - {benefit}
            </Text>
          ))}
        </View>
        <Button
          title={hasPremiumEntitlement ? "Premium liberado" : IS_DEV_BUILD ? "Desbloquear Premium" : "Compra indisponível"}
          variant="premium"
          disabled={hasPremiumEntitlement}
          onPress={() => {
            if (!IS_DEV_BUILD) {
              Alert.alert("Compra indisponível", "Integre Google Play Billing antes de publicar este fluxo.");
              return;
            }
            unlockPremiumForTesting();
            Alert.alert("Premium liberado", "Nesta versão MVP o desbloqueio está disponível apenas em desenvolvimento.");
          }}
        />
        <Button
          title="Restaurar compra"
          variant="secondary"
          onPress={() => Alert.alert("Restaurar compra", `Na versão Play Store, consultar ${PREMIUM_PRODUCT_ID}.`)}
        />
        <Text style={styles.footnote}>Na publicação da Play Store, este fluxo deve ser conectado ao Google Play Billing.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  benefit: {
    color: colors.text,
    fontWeight: "700",
    lineHeight: 22
  },
  benefits: {
    gap: spacing.sm
  },
  copy: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  hero: {
    backgroundColor: colors.warningSoft,
    gap: spacing.lg
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  price: {
    color: colors.text,
    fontSize: 46,
    fontWeight: "900"
  }
});
