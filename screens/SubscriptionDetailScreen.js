import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';

export default function SubscriptionDetailScreen({ route, navigation }) {
  const { sub } = route.params;
  const [notify, setNotify] = useState(true);
  const [daysBefore, setDaysBefore] = useState('3 days');

  const days = ['1 day', '3 days', '7 days', '14 days'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.heroSection}>
        <View style={[styles.subIconLarge, { backgroundColor: sub.color + '22' }]}>
          <Text style={{ fontSize: 48 }}>{sub.emoji}</Text>
        </View>
        <Text style={styles.heroName}>{sub.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next payment date:</Text>
          <Text style={styles.infoValue}>2/23/2026</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>USD {sub.amount} / m.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Frequency:</Text>
          <Text style={styles.infoValue}>{sub.freq}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Screen time:</Text>
          <Text style={styles.infoValue}>4 h / week</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.navigate('CancellationSuccess')}
      >
        <Text style={styles.cancelBtnText}>⊖  Cancel subscription</Text>
      </TouchableOpacity>

      <View style={styles.notifyRow}>
        <Text style={styles.notifyLabel}>I want to be notified before my next payment</Text>
        <Switch
          value={notify}
          onValueChange={setNotify}
          trackColor={{ true: '#5B3FD9' }}
          thumbColor="#fff"
        />
      </View>

      <Text style={styles.daysLabel}>How many days before the payment should I be notified</Text>
      <View style={styles.daysRow}>
        {days.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dayPill, daysBefore === d && styles.dayPillActive]}
            onPress={() => setDaysBefore(d)}
          >
            <Text style={[styles.dayText, daysBefore === d && styles.dayTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingHorizontal: 16, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#5B3FD9', fontSize: 15, fontWeight: '500' },
  heroSection: { alignItems: 'center', marginBottom: 20 },
  subIconLarge: {
    width: 88, height: 88, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  heroName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  cancelBtn: {
    backgroundColor: '#5B3FD9', borderRadius: 10, padding: 16,
    alignItems: 'center', marginBottom: 20,
  },
  cancelBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  notifyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  notifyLabel: { fontSize: 14, color: '#1a1a1a', flex: 1, marginRight: 10 },
  daysLabel: { fontSize: 13, color: '#666', marginBottom: 10 },
  daysRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayPill: {
    flex: 1, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  dayPillActive: { borderColor: '#5B3FD9', backgroundColor: '#EEE9FF' },
  dayText: { fontSize: 13, color: '#666' },
  dayTextActive: { color: '#5B3FD9', fontWeight: '600' },
});
