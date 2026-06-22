import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import type { RootTabParamList } from "../../App";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../constants/theme";
import { useAppState } from "../hooks/useAppState";
import { formatDate } from "../lib/dates";
import { createQuotePdf, shareQuotePdf } from "../lib/pdf";
import { formatMoney, formatNumberInput, parseMoneyInput } from "../lib/money";
import { quoteSubtotal, quoteTotal } from "../lib/quote";

type Props = BottomTabScreenProps<RootTabParamList, "Quote">;

export function QuoteScreen({ navigation }: Props) {
  const [numberDrafts, setNumberDrafts] = useState<Record<string, string>>({});
  const {
    company,
    currentQuote,
    updateCurrentQuote,
    updateQuoteItem,
    addQuoteItem,
    removeQuoteItem,
    saveCurrentQuote,
    startNewQuote,
    canUsePremiumFeature
  } = useAppState();

  function requirePremiumFeature(): boolean {
    if (canUsePremiumFeature) return true;
    navigation.navigate("Premium");
    Alert.alert("Teste encerrado", "Desbloqueie o Premium para continuar criando e enviando orcamentos.");
    return false;
  }

  function handleSave() {
    if (!requirePremiumFeature()) return;
    const result = saveCurrentQuote();
    if (!result.ok) {
      Alert.alert("Revise o orcamento", result.reason);
      return;
    }
    Alert.alert("Salvo", "Orcamento salvo no historico.");
  }

  async function handlePdf() {
    if (!requirePremiumFeature()) return;
    try {
      const result = await createQuotePdf(company, currentQuote);
      Alert.alert("PDF gerado", `Arquivo criado em: ${result.uri}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("PDF error", error);
      Alert.alert("PDF", `Nao foi possivel gerar o PDF agora.\n\n${message}`);
    }
  }

  async function handleSharePdf() {
    if (!requirePremiumFeature()) return;
    try {
      const result = await shareQuotePdf(company, currentQuote);
      if (!result.shared) {
        Alert.alert("PDF gerado", `Arquivo criado em: ${result.uri}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Share PDF error", error);
      Alert.alert("Enviar PDF", `Nao foi possivel abrir as opcoes de envio.\n\n${message}`);
    }
  }

  async function handleEmail() {
    if (!requirePremiumFeature()) return;
    const subject = `Orcamento ${currentQuote.id}`;
    const body = quoteMessage();
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error("E-mail indisponivel");
      await Linking.openURL(url);
    } catch {
      Alert.alert("E-mail", "Nao foi possivel abrir o app de e-mail neste aparelho.");
    }
  }

  async function handleWhatsapp() {
    if (!requirePremiumFeature()) return;
    const phone = currentQuote.clientWhatsapp.replace(/\D/g, "");
    const message = quoteMessage();
    const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
    const url = `https://wa.me/${phone ? phoneWithCountry : ""}?text=${encodeURIComponent(message)}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error("WhatsApp indisponivel");
      await Linking.openURL(url);
    } catch {
      Alert.alert("WhatsApp", "Nao foi possivel abrir o WhatsApp neste aparelho.");
    }
  }

  function handleWhatsappChange(value: string) {
    const digits = value.replace(/\D/g, "");
    const withoutCountry = digits.startsWith("55") ? digits.slice(2) : digits;
    updateCurrentQuote({ clientWhatsapp: withoutCountry.slice(0, 11) });
  }

  function draftValue(key: string, value: number): string {
    return numberDrafts[key] ?? formatNumberInput(value);
  }

  function updateDraft(key: string, value: string, onParsedValue: (parsed: number) => void) {
    setNumberDrafts((previous) => ({ ...previous, [key]: value }));
    onParsedValue(parseMoneyInput(value));
  }

  function normalizeDraft(key: string, value: number) {
    setNumberDrafts((previous) => {
      const next = { ...previous };
      if (value === 0) {
        delete next[key];
      } else {
        next[key] = formatNumberInput(value);
      }
      return next;
    });
  }

  function quoteMessage(): string {
    const itemLines = currentQuote.items
      .map((item) => `- ${item.description || "Item"}: ${item.quantity} x ${formatMoney(item.unitPrice)}`)
      .join("\n");

    return [
      `Orcamento ${currentQuote.id}`,
      company.businessName || "Orcamento Rapido",
      "",
      `Cliente: ${currentQuote.clientName || "Nao informado"}`,
      currentQuote.vehicle ? `Servico: ${currentQuote.vehicle}` : "",
      currentQuote.plate ? `Informacoes: ${currentQuote.plate}` : "",
      "",
      itemLines,
      "",
      `Total: ${formatMoney(quoteTotal(currentQuote))}`,
      "",
      "Enviado pelo Orcamento Rapido"
    ]
      .filter(Boolean)
      .join("\n");
  }

  return (
    <Screen title="Novo orcamento" subtitle="Preencha os dados, revise o preview e envie em poucos minutos.">
      <Card style={styles.form}>
        <FormField label="Numero do orcamento" value={currentQuote.id} editable={false} />
        <FormField label="Data" value={formatDate(currentQuote.createdAt)} editable={false} />
        <FormField label="Cliente" value={currentQuote.clientName} onChangeText={(clientName) => updateCurrentQuote({ clientName })} />
        <FormField
          label="WhatsApp do cliente"
          keyboardType="phone-pad"
          maxLength={15}
          placeholder="DDD + numero"
          value={currentQuote.clientWhatsapp}
          onChangeText={handleWhatsappChange}
        />
        <FormField label="Servico" value={currentQuote.vehicle} onChangeText={(vehicle) => updateCurrentQuote({ vehicle })} />
        <FormField label="Informacoes (placa, referencia ou detalhes)" value={currentQuote.plate} onChangeText={(plate) => updateCurrentQuote({ plate })} />
        <FormField label="Validade (DD/MM/AAAA)" value={currentQuote.validUntil} onChangeText={(validUntil) => updateCurrentQuote({ validUntil })} />
        <FormField label="Garantia" value={currentQuote.warranty} onChangeText={(warranty) => updateCurrentQuote({ warranty })} />
        <FormField label="Observacoes" multiline value={currentQuote.notes} onChangeText={(notes) => updateCurrentQuote({ notes })} />
      </Card>

      <Card style={styles.form}>
        <Text style={styles.sectionTitle}>Itens</Text>
        {currentQuote.items.map((item) => (
          <View key={item.id} style={styles.itemBox}>
            <FormField label="Descricao" value={item.description} onChangeText={(description) => updateQuoteItem(item.id, { description })} />
            <View style={styles.row}>
              <FormField
                label="Qtd."
                keyboardType="decimal-pad"
                value={draftValue(`quantity-${item.id}`, item.quantity)}
                style={styles.flexInput}
                onChangeText={(quantity) => updateDraft(`quantity-${item.id}`, quantity, (parsed) => updateQuoteItem(item.id, { quantity: parsed }))}
                onBlur={() => normalizeDraft(`quantity-${item.id}`, item.quantity)}
              />
              <FormField
                label="Valor (R$)"
                keyboardType="decimal-pad"
                value={draftValue(`unitPrice-${item.id}`, item.unitPrice)}
                style={styles.flexInput}
                onChangeText={(unitPrice) => updateDraft(`unitPrice-${item.id}`, unitPrice, (parsed) => updateQuoteItem(item.id, { unitPrice: parsed }))}
                onBlur={() => normalizeDraft(`unitPrice-${item.id}`, item.unitPrice)}
              />
            </View>
            <View style={styles.row}>
              <Button title="Remover" variant="secondary" style={styles.flexButton} onPress={() => removeQuoteItem(item.id)} />
            </View>
          </View>
        ))}
        <Button title="+ Adicionar item" variant="secondary" onPress={addQuoteItem} />
      </Card>

      <Card style={styles.form}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <FormField
          label="Desconto"
          keyboardType="decimal-pad"
          placeholder="R$ 0,00"
          value={draftValue("discount", currentQuote.discount)}
          onChangeText={(discount) => updateDraft("discount", discount, (parsed) => updateCurrentQuote({ discount: parsed }))}
          onBlur={() => normalizeDraft("discount", currentQuote.discount)}
        />
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatMoney(quoteSubtotal(currentQuote))}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Desconto</Text>
          <Text style={styles.totalValue}>{formatMoney(currentQuote.discount)}</Text>
        </View>
        <View style={styles.totalFinal}>
          <Text style={styles.totalFinalLabel}>Total</Text>
          <Text style={styles.totalFinalValue}>{formatMoney(quoteTotal(currentQuote))}</Text>
        </View>
      </Card>

      <Card style={styles.preview}>
        <Text style={styles.previewTitle}>{currentQuote.id}</Text>
        <Text style={styles.previewText}>{currentQuote.clientName || "Cliente nao informado"}</Text>
        <Text style={styles.previewTotal}>{formatMoney(quoteTotal(currentQuote))}</Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Salvar" variant="success" onPress={handleSave} />
        <Button title="Criar PDF" onPress={handlePdf} />
        <Button title="Enviar PDF por Gmail/E-mail" variant="secondary" onPress={handleSharePdf} />
        <Button title="Abrir e-mail" variant="secondary" onPress={handleEmail} />
        <Button title="Enviar WhatsApp" variant="secondary" onPress={handleWhatsapp} />
        <Button title="Novo" variant="danger" onPress={() => (requirePremiumFeature() ? startNewQuote() : undefined)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm
  },
  flexButton: {
    flex: 1
  },
  flexInput: {
    flex: 1
  },
  form: {
    gap: spacing.md
  },
  itemBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  preview: {
    gap: spacing.sm
  },
  previewText: {
    color: colors.textMuted,
    fontSize: 15
  },
  previewTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  previewTotal: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900"
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  totalFinal: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg
  },
  totalFinalLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  totalFinalValue: {
    color: colors.surface,
    fontSize: 23,
    fontWeight: "900"
  },
  totalLabel: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  totalValue: {
    color: colors.text,
    fontWeight: "800"
  }
});
