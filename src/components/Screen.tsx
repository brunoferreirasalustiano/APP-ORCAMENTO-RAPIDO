import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../constants/theme";
import { useAppState } from "../hooks/useAppState";

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function Screen({ title, subtitle, children }: ScreenProps) {
  const { hasPremiumEntitlement, trialInfo } = useAppState();

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Orçamento Rápido</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {hasPremiumEntitlement ? "Premium ativo" : `${trialInfo.remainingDays} dias grátis`}
            </Text>
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.infoSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 112
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md
  },
  kicker: {
    color: colors.action,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 4
  }
});
