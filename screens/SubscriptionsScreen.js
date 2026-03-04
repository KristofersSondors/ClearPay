import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const SUBS = [
  { id: '1', name: 'Netflix', category: 'Entertainment', amount: '$15.99', freq: 'Monthly', emoji: '🎬', color: '#E50914' },
  { id: '2', name: 'Spotify Duo', category: 'Entertainment', amount: '$12.99', freq: 'Monthly', emoji: '🎵', color: '#1DB954' },
  { id: '3', name: 'Adobe Creative Cloud', category: 'Software', amount: '$54.99', freq: 'Monthly', emoji: '🎨', color: '#FF0000' },
  { id: '4', name: 'AWS', category: 'Software', amount: '$34.5', freq: 'Monthly', emoji: '☁️', color: '#FF9900' },
  { id: '5', name: 'Gym Membership', category: 'Fitness', amount: '$40', freq: 'Monthly', emoji: '💪', color: '#00A651' },
  { id: '6', name: 'Amazon Prime', category: 'Shopping', amount: '$139', freq: 'Yearly', emoji: '📦', color: '#00A8E0' },
];

export default function SubscriptionsScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filtered = SUBS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.pageTitle}>Subscriptions</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Subscriptions</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterPill}><Text style={styles.filterText}>All</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}><Text style={styles.filterText}>All Status</Text></TouchableOpacity>
        </View>
      </View>

      {filtered.map((sub) => (
        <TouchableOpacity
          key={sub.id}
          style={styles.subRow}
          onPress={() => navigation.navigate('SubscriptionDetail', { sub })}
        >
          <View style={[styles.subIcon, { backgroundColor: sub.color + '22' }]}>
            <Text style={{ fontSize: 22 }}>{sub.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subName}>{sub.name}</Text>
            <Text style={styles.subCat}>{sub.category}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.subAmount}>{sub.amount}</Text>
            <Text style={styles.subFreq}>{sub.freq}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  section: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 10, marginBottom: 10,
  },
  searchIcon: { marginRight: 6, fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#1a1a1a' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: {
    flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  filterText: { fontSize: 13, color: '#444' },
  subRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  subIcon: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  subName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  subCat: { fontSize: 12, color: '#888', marginTop: 2 },
  subAmount: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  subFreq: { fontSize: 12, color: '#888', marginTop: 2 },
  chevron: { fontSize: 20, color: '#ccc', marginLeft: 8 },
});
