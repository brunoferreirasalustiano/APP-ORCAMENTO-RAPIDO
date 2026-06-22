import { Alert, StyleSheet } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/theme";
import { useAppState } from "../hooks/useAppState";

export function CompanyScreen() {
  const { company, updateCompany } = useAppState();

  return (
    <Screen title="Dados da empresa" subtitle="Esses dados aparecem no cabecalho do PDF e deixam o orcamento com cara profissional.">
      <Card style={styles.form}>
        <FormField label="Nome do comercio" value={company.businessName} onChangeText={(businessName) => updateCompany({ businessName })} />
        <FormField label="Seu nome" value={company.ownerName} onChangeText={(ownerName) => updateCompany({ ownerName })} />
        <FormField label="WhatsApp" keyboardType="phone-pad" value={company.whatsapp} onChangeText={(whatsapp) => updateCompany({ whatsapp })} />
        <FormField label="E-mail" keyboardType="email-address" autoCapitalize="none" value={company.email} onChangeText={(email) => updateCompany({ email })} />
        <FormField label="CNPJ ou CPF opcional" value={company.document} onChangeText={(document) => updateCompany({ document })} />
        <FormField label="Endereco" value={company.address} onChangeText={(address) => updateCompany({ address })} />
        <Button title="Salvar dados" variant="success" onPress={() => Alert.alert("Pronto", "Dados da empresa salvos.")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  }
});
