import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type ButtonVariant = "primary" | "secondary" | "success" | "premium" | "danger";

type ButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = "primary", style, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
      {...props}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.82
  },
  premium: {
    backgroundColor: colors.premium
  },
  primary: {
    backgroundColor: colors.action
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  secondaryLabel: {
    color: colors.primary
  },
  success: {
    backgroundColor: colors.success
  }
});
