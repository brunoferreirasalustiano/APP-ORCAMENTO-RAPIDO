import { Alert, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import type { RootTabParamList } from "../../App";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../constants/theme";
import { useAppState } from "../hooks/useAppState";
import { formatMoney } from "../lib/money";
import { quoteTotal } from "../lib/quote";

type Props = BottomTabScreenProps<RootTabParamList, "History">;

export function HistoryScreen({ navigation }: Props) {
  const { quotes, openQuote, duplicateSavedQuote, canUsePremiumFeature } = useAppState();

  return (
    <Screen title="Histórico" subtitle="Abra, revise e reaproveite orçamentos salvos no aparelho.">
      <Card style={styles.list}>
        {quotes.length === 0 ? (
          <EmptyState title="Nenhum orçamento salvo" description="Crie o primeiro orçamento para manter tudo organizado no histórico." />
        ) : (
          quotes.map((quote) => (
            <View key={quote.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{quote.id}</Text>
                <Text style={styles.itemMeta}>{quote.clientName || "Cliente sem nome"}</Text>
                <Text style={styles.itemTotal}>{formatMoney(quoteTotal(quote))}</Text>
              </View>
              <View style={styles.actions}>
                <Button
                  title="Abrir"
                  variant="secondary"
                  onPress={() => {
                    openQuote(quote.id);
                    navigation.navigate("Quote");
                  }}
                />
                <Button
                  title="Duplicar"
                  variant="secondary"
                  onPress={() => {
                    if (!canUsePremiumFeature) {
                      navigation.navigate("Premium");
                      Alert.alert("Premium", "Desbloqueie o Premium para duplicar orçamentos.");
                      return;
                    }
                    duplicateSavedQuote(quote.id);
                    navigation.navigate("Quote");
                  }}
                />
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  item: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md
  },
  itemMeta: {
    color: colors.textMuted,
    marginTop: 3
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  itemTotal: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6
  },
  list: {
    gap: spacing.sm
  }
});
