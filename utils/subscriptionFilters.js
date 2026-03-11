const CATEGORIES = ['All', 'Entertainment', 'Software', 'Fitness', 'Shopping', 'Other'];
const STATUSES = ['All Status', 'Active', 'Cancelled'];

export function filterSubscriptions(subscriptions, { search = '', category = 'All', status = 'All Status' }) {
  let out = [...subscriptions];
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    out = out.filter(s => s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q)));
  }
  if (category && category !== 'All') {
    out = out.filter(s => s.category === category);
  }
  if (status === 'Active') {
    out = out.filter(s => s.status !== 'cancelled');
  } else if (status === 'Cancelled') {
    out = out.filter(s => s.status === 'cancelled');
  }
  return out;
}

export { CATEGORIES, STATUSES };
