import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'clearpay-app-state';

const DEFAULT_SUBS = [
  { id: '1', name: 'Netflix', category: 'Entertainment', price: 15.99, frequency: 'Monthly', emoji: '🎬', color: '#E50914', status: 'active', nextDate: 'Feb 23' },
  { id: '2', name: 'Spotify Duo', category: 'Entertainment', price: 12.99, frequency: 'Monthly', emoji: '🎵', color: '#1DB954', status: 'active', nextDate: 'Feb 25' },
  { id: '3', name: 'Adobe Creative Cloud', category: 'Software', price: 54.99, frequency: 'Monthly', emoji: '🎨', color: '#FF0000', status: 'active', nextDate: 'Mar 1' },
  { id: '4', name: 'AWS', category: 'Software', price: 34.5, frequency: 'Monthly', emoji: '☁️', color: '#FF9900', status: 'active', nextDate: 'Mar 5' },
  { id: '5', name: 'Gym Membership', category: 'Fitness', price: 40, frequency: 'Monthly', emoji: '💪', color: '#00A651', status: 'active', nextDate: 'Mar 8' },
  { id: '6', name: 'Amazon Prime', category: 'Shopping', price: 139, frequency: 'Yearly', emoji: '📦', color: '#00A8E0', status: 'active', nextDate: 'Mar 15' },
];

const DEFAULT_PROFILE = { name: 'Alex Design', email: 'alex@example.com' };
const DEFAULT_BANKS = [
  { id: 'swedbank', name: 'Swedbank', color: '#FF6600', connected: false },
  { id: 'seb', name: 'S|E|B', color: '#000', connected: false },
  { id: 'revolut', name: 'Revolut', color: '#000', connected: false },
  { id: 'luminor', name: 'Luminor', color: '#1A3A5C', connected: false },
];

function getDefaultState() {
  return {
    subscriptions: [...DEFAULT_SUBS],
    profile: { ...DEFAULT_PROFILE },
    banks: DEFAULT_BANKS.map(b => ({ ...b })),
  };
}

const AppStateContext = createContext(null);
const AppActionsContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(getDefaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.subscriptions && Array.isArray(parsed.subscriptions)) {
            setState({
              subscriptions: parsed.subscriptions,
              profile: parsed.profile || DEFAULT_PROFILE,
              banks: parsed.banks || DEFAULT_BANKS.map(b => ({ ...b })),
            });
          }
        } catch (e) {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, loaded]);

  const addSubscription = useCallback((input) => {
    const id = `sub-${Date.now()}`;
    const emojis = { Entertainment: '🎬', Software: '🎨', Fitness: '💪', Shopping: '📦', Other: '📦' };
    const emoji = emojis[input.category] || '📦';
    const colors = ['#E50914', '#1DB954', '#FF0000', '#FF9900', '#00A651', '#00A8E0' ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const sub = {
      id,
      name: input.name,
      category: input.category || 'Other',
      price: input.price,
      frequency: input.frequency,
      emoji,
      color,
      status: 'active',
      nextDate: input.nextDate || 'Soon',
    };
    setState(prev => ({ ...prev, subscriptions: [...prev.subscriptions, sub] }));
    return id;
  }, []);

  const cancelSubscription = useCallback((id) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s =>
        s.id === id ? { ...s, status: 'cancelled' } : s
      ),
    }));
  }, []);

  const updateSubscription = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const updateProfile = useCallback((input) => {
    setState(prev => ({ ...prev, profile: { ...prev.profile, ...input } }));
  }, []);

  const toggleBank = useCallback((id) => {
    setState(prev => ({
      ...prev,
      banks: prev.banks.map(b =>
        b.id === id ? { ...b, connected: !b.connected } : b
      ),
    }));
  }, []);

  const resetAppState = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY);
    setState(getDefaultState());
  }, []);

  const actions = useMemo(
    () => ({
      addSubscription,
      cancelSubscription,
      updateSubscription,
      updateProfile,
      toggleBank,
      resetAppState,
    }),
    [
      addSubscription,
      cancelSubscription,
      updateSubscription,
      updateProfile,
      toggleBank,
      resetAppState,
    ]
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppActions() {
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error('useAppActions must be used within AppProvider');
  return ctx;
}
