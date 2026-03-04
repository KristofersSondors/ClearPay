import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to{'\n'}ClearPay!</Text>
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#9B8EC4',
    borderRadius: 20,
    width: '100%',
    paddingVertical: 80,
    alignItems: 'center',
    marginBottom: 32,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: '#1a1a1a' },
  btnPrimary: {
    backgroundColor: '#5B3FD9',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondary: {
    backgroundColor: '#5B3FD9',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
