import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

const FREQUENCIES = ['Weekly', 'Monthly', 'Yearly'];
const CURRENCIES = ['USD', 'EUR', 'GBP'];

export default function AddSubscriptionScreen({ navigation }) {
  const [provider, setProvider] = useState('Netflix');
  const [freq, setFreq] = useState('Weekly');
  const [freqOpen, setFreqOpen] = useState(false);
  const [amount, setAmount] = useState('0.00');
  const [currency, setCurrency] = useState('USD');
  const [currOpen, setCurrOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Enter Subscription Manually</Text>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>SUBSCRIPTION INFORMATION</Text>

            <Text style={styles.fieldLabel}>Provider Name</Text>
            <TextInput style={styles.input} value={provider} onChangeText={setProvider} />

            <Text style={styles.fieldLabel}>Frequency</Text>
            <TouchableOpacity style={styles.select} onPress={() => setFreqOpen(!freqOpen)}>
              <Text style={styles.selectText}>{freq}</Text>
              <Text style={styles.arrow}>{freqOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {freqOpen && (
              <View style={styles.dropdown}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity key={f} style={styles.dropItem} onPress={() => { setFreq(f); setFreqOpen(false); }}>
                    <Text style={[styles.dropText, freq === f && styles.dropTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.currSelect} onPress={() => setCurrOpen(!currOpen)}>
                <Text style={styles.selectText}>{currency}</Text>
                <Text style={styles.arrow}>{currOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            </View>
            {currOpen && (
              <View style={[styles.dropdown, { alignSelf: 'flex-end', width: 100 }]}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity key={c} style={styles.dropItem} onPress={() => { setCurrency(c); setCurrOpen(false); }}>
                    <Text style={[styles.dropText, currency === c && styles.dropTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnSave} onPress={() => navigation.goBack()}>
                <Text style={styles.btnSaveText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { flexGrow: 1, padding: 16, paddingTop: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, letterSpacing: 0.5 },
  fieldLabel: { fontSize: 13, color: '#444', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1a1a1a' },
  select: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12,
  },
  selectText: { fontSize: 14, color: '#1a1a1a' },
  arrow: { fontSize: 12, color: '#888' },
  dropdown: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    backgroundColor: '#fff', marginTop: 2, overflow: 'hidden',
  },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropText: { fontSize: 14, color: '#444' },
  dropTextActive: { color: '#5B3FD9', fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currSelect: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, minWidth: 80,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btnSave: { flex: 2, backgroundColor: '#5B3FD9', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnCancel: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnCancelText: { color: '#444', fontSize: 14 },
});
