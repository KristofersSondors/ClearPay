import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './context/AppContext';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity } from 'react-native';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BankLinkingScreen from './screens/BankLinkingScreen';
import DashboardScreen from './screens/DashboardScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import SubscriptionDetailScreen from './screens/SubscriptionDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AddSubscriptionScreen from './screens/AddSubscriptionScreen';
import CancellationSuccessScreen from './screens/CancellationSuccessScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PURPLE = '#5B3FD9';
const DARK = '#1a1a1a';

function AppHeader({ navigation, showActions = true }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8, backgroundColor: PURPLE,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>C</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>ClearPay</Text>
      </View>
      {showActions && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')}>
            <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={{ color: '#fff', fontSize: 20 }}>⚙</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader navigation={navigation} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: PURPLE,
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#F0F0F0',
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: focused ? '600' : '400' }}>
              {route.name}
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => {
            const icons = { Home: '⊞', Subs: '💳', Analytics: '◎' };
            return (
              <View style={{
                backgroundColor: focused ? '#EEE9FF' : 'transparent',
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
              }}>
                <Text style={{ fontSize: 18, color }}>{icons[route.name]}</Text>
              </View>
            );
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
    <AppProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="BankLinking" component={BankLinkingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
        <Stack.Screen name="CancellationSuccess" component={CancellationSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AppProvider>
    </SafeAreaProvider>
  );
}
