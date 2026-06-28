import * as ImagePicker from "expo-image-picker";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/theme";
import { useAppState } from "../hooks/useAppState";

export function CompanyScreen() {
  const { company, updateCompany } = useAppState();

  async function handlePickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Logo", "Permita o acesso às imagens para escolher a logo da empresa.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateCompany({ logoUri: result.assets[0].uri });
    }
  }

  return (
    <Screen title="Dados da empresa" subtitle="Esses dados aparecem no cabeçalho do PDF e deixam o orçamento com cara profissional.">
      <Card style={styles.form}>
        <View style={styles.logoArea}>
          {company.logoUri ? <Image source={{ uri: company.logoUri }} style={styles.logoPreview} /> : <Text style={styles.logoPlaceholder}>Logo</Text>}
          <View style={styles.logoActions}>
            <Button title={company.logoUri ? "Trocar logo" : "Adicionar logo"} variant="secondary" onPress={handlePickLogo} />
            {company.logoUri ? <Button title="Remover logo" variant="secondary" onPress={() => updateCompany({ logoUri: "" })} /> : null}
          </View>
        </View>
        <FormField label="Nome do comércio" value={company.businessName} onChangeText={(businessName) => updateCompany({ businessName })} />
        <FormField label="Seu nome" value={company.ownerName} onChangeText={(ownerName) => updateCompany({ ownerName })} />
        <FormField label="WhatsApp" keyboardType="phone-pad" value={company.whatsapp} onChangeText={(whatsapp) => updateCompany({ whatsapp })} />
        <FormField label="E-mail" keyboardType="email-address" autoCapitalize="none" value={company.email} onChangeText={(email) => updateCompany({ email })} />
        <FormField label="CNPJ ou CPF opcional" value={company.document} onChangeText={(document) => updateCompany({ document })} />
        <FormField label="Endereço" value={company.address} onChangeText={(address) => updateCompany({ address })} />
        <Button title="Salvar dados" variant="success" onPress={() => Alert.alert("Pronto", "Dados da empresa salvos.")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  logoActions: {
    flex: 1,
    gap: spacing.sm
  },
  logoArea: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  logoPlaceholder: {
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    color: "#64748B",
    fontWeight: "800",
    height: 92,
    lineHeight: 92,
    textAlign: "center",
    width: 92
  },
  logoPreview: {
    borderRadius: 12,
    height: 92,
    width: 92
  }
});
