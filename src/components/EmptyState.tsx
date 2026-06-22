import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../constants/theme";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: "center"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  wrap: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl
  }
});
