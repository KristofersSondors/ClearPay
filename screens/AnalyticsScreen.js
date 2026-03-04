import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { G, Path, Circle } from 'react-native-svg';

const W = Dimensions.get('window').width - 32;

const DonutChart = () => {
  const data = [
    { value: 28.98, color: '#5B3FD9', label: 'Entertainment' },
    { value: 139, color: '#22C55E', label: 'Shopping' },
    { value: 89.49, color: '#EC4899', label: 'Software' },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 55;
  const innerR = 32;

  let cumulative = 0;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`,
      color: d.color,
    };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, i) => <Path key={i} d={s.path} fill={s.color} />)}
        </G>
      </Svg>
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.pageTitle}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Spend Trend</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            datasets: [{ data: [115, 125, 132, 130] }],
          }}
          width={W - 16}
          height={180}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => '#5B3FD9',
            labelColor: () => '#888',
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#5B3FD9' },
            propsForBackgroundLines: { stroke: '#F0F0F0' },
          }}
          bezier
          style={{ marginLeft: -16 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spend by Category</Text>
        <DonutChart />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingHorizontal: 16, paddingTop: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#555' },
});
