import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

import { AppProvider, useAppState } from "./src/hooks/useAppState";
import { CompanyScreen } from "./src/screens/CompanyScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { PremiumScreen } from "./src/screens/PremiumScreen";
import { QuoteScreen } from "./src/screens/QuoteScreen";
import { colors } from "./src/constants/theme";

export type RootTabParamList = {
  Quote: undefined;
  History: undefined;
  Company: undefined;
  Premium: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function AppNavigator() {
  const { isHydrated } = useAppState();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700"
          },
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16, fontWeight: "900" }}>•</Text>
        }}
      >
        <Tab.Screen name="Quote" component={QuoteScreen} options={{ title: "Orcamento" }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Historico" }} />
        <Tab.Screen name="Company" component={CompanyScreen} options={{ title: "Empresa" }} />
        <Tab.Screen name="Premium" component={PremiumScreen} options={{ title: "Premium" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
