import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAppState } from '../context/AppContext';
import { filterSubscriptions, CATEGORIES, STATUSES } from '../utils/subscriptionFilters';

export default function SubscriptionsScreen({ navigation }) {
  const { subscriptions } = useAppState();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All Status');

  const filtered = filterSubscriptions(subscriptions, { search, category, status });

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
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.filterPill, category === c && styles.filterPillActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.filterText, category === c && styles.filterTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.filterRow, { marginTop: 6 }]}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterPill, status === s && styles.filterPillActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.filterText, status === s && styles.filterTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No subscriptions match your filters.</Text>
        </View>
      ) : (
        filtered.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.subRow}
            onPress={() => navigation.navigate('SubscriptionDetail', { subId: sub.id })}
          >
            <View style={[styles.subIcon, { backgroundColor: (sub.color || '#999') + '22' }]}>
              <Text style={{ fontSize: 22 }}>{sub.emoji || '📦'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subName}>{sub.name}</Text>
              <Text style={styles.subCat}>{sub.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.subAmount}>${Number(sub.price).toFixed(2)}</Text>
              <Text style={styles.subFreq}>{sub.frequency}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}
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
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterPill: {
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
  },
  filterPillActive: { borderColor: '#5B3FD9', backgroundColor: '#EEE9FF' },
  filterText: { fontSize: 13, color: '#444' },
  filterTextActive: { color: '#5B3FD9', fontWeight: '600' },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#888' },
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
