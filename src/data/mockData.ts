export const mockSubscriptions = [
  {
    id: '1',
    name: 'Netflix',
    category: 'Entertainment',
    price: 15.99,
    frequency: 'Monthly',
    logo: 'N',
    logoBg: 'bg-black',
    logoColor: 'text-red-500',
  },
  {
    id: '2',
    name: 'Spotify Duo',
    category: 'Entertainment',
    price: 12.99,
    frequency: 'Monthly',
    logo: 'S',
    logoBg: 'bg-green-500',
    logoColor: 'text-white',
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    category: 'Software',
    price: 54.99,
    frequency: 'Monthly',
    logo: 'A',
    logoBg: 'bg-red-500',
    logoColor: 'text-white',
  },
  {
    id: '4',
    name: 'AWS',
    category: 'Software',
    price: 34.5,
    frequency: 'Monthly',
    logo: 'AWS',
    logoBg: 'bg-orange-400',
    logoColor: 'text-white',
  },
  {
    id: '5',
    name: 'Gym Membership',
    category: 'Fitness',
    price: 40,
    frequency: 'Monthly',
    logo: 'Gym!',
    logoBg: 'bg-gray-900',
    logoColor: 'text-white',
  },
  {
    id: '6',
    name: 'Amazon Prime',
    category: 'Shopping',
    price: 139,
    frequency: 'Yearly',
    logo: 'prime',
    logoBg: 'bg-blue-600',
    logoColor: 'text-white',
  },
]

export const mockDashboardStats = {
  monthlySpend: 130.05,
  monthlySpendTrend: '+2.5%',
  yearlyProjection: 1560.64,
  activeSubscriptions: 5,
  upcoming7Days: 70.98,
  upcoming7DaysTrend: '+2.5%',
}

export const mockUpcomingPayments = [
  { id: '1', name: 'Netflix', date: '2/23/2026', amount: 15.99 },
  { id: '2', name: 'Spotify Duo', date: '2/25/2026', amount: 12.99 },
  { id: '3', name: 'Adobe', date: '3/1/2026', amount: 54.99 },
]

export const mockMonthlySpendData = [
  { month: 'Jan', value: 110 },
  { month: 'Feb', value: 115 },
  { month: 'Mar', value: 130 },
  { month: 'Apr', value: 125 },
]

export const mockCategorySpendData = [
  { name: 'Software', value: 89.49, color: '#EC4899' },
  { name: 'Entertainment', value: 28.98, color: '#8B7AB8' },
  { name: 'Shopping', value: 11.59, color: '#14B8A6' },
]
