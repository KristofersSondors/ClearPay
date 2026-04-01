import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ClearPayLogo from "./src/components/ClearPayLogo";

import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import BankLinkingScreen from "./screens/BankLinkingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SubscriptionsScreen from "./screens/SubscriptionsScreen";
import SubscriptionDetailScreen from "./screens/SubscriptionDetailScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CurrencyScreen from "./screens/CurrencyScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import PrivacySecurityScreen from "./screens/PrivacySecurityScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import AddSubscriptionScreen from "./screens/AddSubscriptionScreen";
import CancellationSuccessScreen from "./screens/CancellationSuccessScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = "#5B3FD9";
const DARK = "#1a1a1a";

function AppHeader({ navigation, showActions = true }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: PURPLE,
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 50,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <ClearPayLogo size={32} radius={8} />
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ClearPay
        </Text>
      </View>
      {showActions && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={() => navigation.navigate("AddSubscription")}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function MainTabs({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <AppHeader navigation={navigation} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: PURPLE,
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#F0F0F0",
            height: (Platform.OS === "ios" ? 68 : 62) + insets.bottom,
            paddingTop: 8,
            paddingBottom: Math.max(10, insets.bottom),
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          tabBarIconStyle: {
            marginTop: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarIcon: ({ color, focused }) => {
            const iconName =
              route.name === "Home"
                ? focused
                  ? "home"
                  : "home-outline"
                : route.name === "Subs"
                  ? focused
                    ? "card"
                    : "card-outline"
                  : focused
                    ? "stats-chart"
                    : "stats-chart-outline";

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Subs" component={SubscriptionsScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="BankLinking" component={BankLinkingScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="SubscriptionDetail"
            component={SubscriptionDetailScreen}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="CurrencySettings" component={CurrencyScreen} />
          <Stack.Screen
            name="NotificationsSettings"
            component={NotificationsScreen}
          />
          <Stack.Screen
            name="PrivacySecuritySettings"
            component={PrivacySecurityScreen}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="AddSubscription"
            component={AddSubscriptionScreen}
          />
          <Stack.Screen
            name="CancellationSuccess"
            component={CancellationSuccessScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
