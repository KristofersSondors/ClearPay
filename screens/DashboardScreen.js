import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppState } from '../context/AppContext';
import {
  getMonthlySpend,
  getYearlyProjection,
  getActiveSubscriptionsCount,
  getUpcoming7DaysTotal,
  getUpcomingPayments,
} from '../utils/subscriptionMetrics';

const StatCard = ({ label, value, sub, subColor, icon }) => (
  <View style={styles.statCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={[styles.statSub, subColor && { color: subColor }]}>{sub}</Text> : null}
    </View>
    <View style={styles.iconBox}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { subscriptions } = useAppState();
  const monthlySpend = getMonthlySpend(subscriptions);
  const yearlyProjection = getYearlyProjection(subscriptions);
  const activeCount = getActiveSubscriptionsCount(subscriptions);
  const upcoming7Days = getUpcoming7DaysTotal(subscriptions);
  const upcoming = getUpcomingPayments(subscriptions, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.pageTitle}>Dashboard</Text>

      <StatCard label="Monthly Spend" value={`$${monthlySpend.toFixed(2)}`} sub="Based on active subs" icon="💳" />
      <StatCard label="Yearly Projection" value={`$${yearlyProjection.toFixed(2)}`} sub="Based on active subs" icon="📈" />
      <StatCard label="Active Subscriptions" value={String(activeCount)} sub="Services active" icon="📅" />
      <StatCard label="Upcoming (7 Days)" value={`$${upcoming7Days.toFixed(2)}`} sub="Due this week" icon="👛" />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>
        <Text style={styles.sectionSub}>Next 30 Days</Text>
      </View>

      {upcoming.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.paymentRow}
          onPress={() => navigation.navigate('SubscriptionDetail', { subId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.paymentEmoji}>
            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentName}>{item.name}</Text>
            <Text style={styles.paymentDate}>{item.date}</Text>
          </View>
          <Text style={styles.paymentAmount}>${Number(item.amount).toFixed(2)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  statSub: { fontSize: 12, color: '#666', marginTop: 2 },
  iconBox: {
    width: 44, height: 44, backgroundColor: '#F0EEFF', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  sectionHeader: { marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  sectionSub: { fontSize: 12, color: '#888' },
  paymentRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  paymentEmoji: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  paymentName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  paymentDate: { fontSize: 12, color: '#888', marginTop: 2 },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
});
