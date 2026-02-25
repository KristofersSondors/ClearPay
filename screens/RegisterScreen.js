import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.logoBox}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.title}>Create your ClearPay account</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} placeholder="Toms Irgiejs" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
            <Text style={styles.label}>Email address</Text>
            <TextInput style={styles.input} placeholder="toms@irge.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#aaa" value={confirm} onChangeText={setConfirm} secureTextEntry />

            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('BankLinking')}>
              <Text style={styles.btnText}>Next: Link Your Bank Accounts</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F0F5' },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 20 },
  progressBar: { flexDirection: 'row', width: '100%', gap: 6, marginBottom: 24 },
  progressSegment: { flex: 1, height: 4, backgroundColor: '#DDD', borderRadius: 2 },
  progressActive: { backgroundColor: '#5B3FD9' },
  logoBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#5B3FD9', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20,
  },
  label: { fontSize: 13, color: '#444', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1a1a1a' },
  btnPrimary: { backgroundColor: '#5B3FD9', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginLink: { fontSize: 14, color: '#666' },
  loginBold: { color: '#5B3FD9', fontWeight: '700' },
});
