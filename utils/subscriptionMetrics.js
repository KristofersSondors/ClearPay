export function getMonthlyEquivalent(price, frequency) {
  if (frequency === 'Monthly') return price;
  if (frequency === 'Yearly') return price / 12;
  if (frequency === 'Weekly') return price * 4.33;
  return price;
}

export function getMonthlySpend(subscriptions) {
  const active = subscriptions.filter(s => s.status !== 'cancelled');
  return active.reduce((sum, s) => sum + getMonthlyEquivalent(s.price, s.frequency), 0);
}

export function getYearlyProjection(subscriptions) {
  return getMonthlySpend(subscriptions) * 12;
}

export function getActiveSubscriptionsCount(subscriptions) {
  return subscriptions.filter(s => s.status !== 'cancelled').length;
}

function parseNextDate(str) {
  if (!str || str === 'Soon') return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function getUpcoming7DaysTotal(subscriptions) {
  const upcoming = getUpcomingPayments(subscriptions, Infinity, 7);
  return upcoming.reduce((sum, s) => sum + s.amount, 0);
}

export function getUpcomingPayments(subscriptions, limit = 5, days = 30) {
  const active = subscriptions.filter(s => s.status !== 'cancelled');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  const withinWindow = active
    .filter((s) => {
      const date = parseNextDate(s.nextDate);
      if (!date) return false;
      date.setHours(0, 0, 0, 0);
      return date >= now && date <= end;
    })
    .sort((a, b) => {
      const da = parseNextDate(a.nextDate)?.getTime() ?? Infinity;
      const db = parseNextDate(b.nextDate)?.getTime() ?? Infinity;
      return da - db;
    });

  return withinWindow.slice(0, limit).map(s => ({
    id: s.id,
    name: s.name,
    amount: s.price,
    date: s.nextDate || 'Soon',
    emoji: s.emoji,
  }));
}

const CATEGORY_COLORS = {
  Entertainment: '#5B3FD9',
  Software: '#EC4899',
  Fitness: '#22C55E',
  Shopping: '#14B8A6',
  Other: '#F59E0B',
};

export function getCategorySpendData(subscriptions) {
  const active = subscriptions.filter(s => s.status !== 'cancelled');
  const byCat = {};
  active.forEach(s => {
    const cat = s.category || 'Other';
    byCat[cat] = (byCat[cat] || 0) + getMonthlyEquivalent(s.price, s.frequency);
  });
  return Object.entries(byCat).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: CATEGORY_COLORS[name] || '#94A3B8',
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
}
