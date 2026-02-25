import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.title}>Sign in to ClearPay</Text>
          <Text style={styles.subtitle}>Manage your subscriptions with confidence</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="toms@irge.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(!remember)}>
                <View style={[styles.checkbox, remember && styles.checkboxChecked]} />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Main')}>
              <Text style={styles.btnText}>Sign in</Text>
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>
            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.googleG}>G </Text>
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F0F5' },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  logoBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#5B3FD9', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 13, color: '#444', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#1a1a1a',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 16, height: 16, borderWidth: 1.5, borderColor: '#999',
    borderRadius: 3, marginRight: 8,
  },
  checkboxChecked: { backgroundColor: '#5B3FD9', borderColor: '#5B3FD9' },
  rememberText: { fontSize: 13, color: '#444' },
  forgotText: { fontSize: 13, color: '#5B3FD9', fontWeight: '600' },
  btnPrimary: {
    backgroundColor: '#5B3FD9', borderRadius: 8, padding: 15,
    alignItems: 'center', marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 13 },
  googleBtn: {
    flexDirection: 'row', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 8, padding: 13, justifyContent: 'center', alignItems: 'center',
  },
  googleG: { fontSize: 16, fontWeight: '700', color: '#4285F4' },
  googleText: { fontSize: 14, color: '#333', fontWeight: '500' },
});
