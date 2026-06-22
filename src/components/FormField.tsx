import { StyleSheet, Text, TextInput, type KeyboardTypeOptions, type TextInputProps, View } from "react-native";

import { colors, radius, spacing } from "../constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  keyboardType?: KeyboardTypeOptions;
};

export function FormField({ label, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, props.multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 46,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  wrap: {
    gap: spacing.xs
  }
});
