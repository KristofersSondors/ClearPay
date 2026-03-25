# Real Transactions from Enable Banking - Integration Guide

## Overview

Enable Banking integration in ClearPay is now **fully set up to fetch real bank transactions** and detect recurring payments automatically. Here's how it works:

---

## How It Works End-to-End

### 1. **User Authorizes a Bank** (`BankLinkingScreen.js` or `SettingsScreen.js`)

```
User selects bank → Redirects to bank's OAuth → Enable Banking session created
```

### 2. **Backend Fetches Transactions** (`POST /api/banking/link/callback`)

When the user returns from OAuth, the backend:

- Extracts `code` from the OAuth callback
- Creates an Enable Banking **session** with the code
- Fetches **accounts** from that session
- Fetches **transactions** from each account (6 months of history)
- Automatically **detects recurring payments** using pattern analysis
- Stores all data in user record

### 3. **Frontend Retrieves Data**

New API functions available:

```javascript
// Get detected subscriptions (recurring payments)
const subscriptions = await getDetectedBankSubscriptions(userId);

// Get the raw transactions
const transactions = await getTransactions(userId);
```

---

## Backend Details

### Enable Banking Endpoints Used

| Endpoint                         | Purpose                           |
| -------------------------------- | --------------------------------- |
| `POST /auth`                     | Initiate OAuth flow               |
| `POST /sessions`                 | Create session from auth code     |
| `GET /accounts/:id/transactions` | Fetch transactions for an account |
| `GET /aspsps?service=AIS`        | List available banks              |

### Transaction Data Structure

```javascript
{
  transactions: [
    {
      id: "transaction-id",
      booking_date_time: "2024-03-15T10:30:00Z",
      value_date: "2024-03-15",
      credit_debit_indicator: "DBIT", // "DBIT" = debit (expense)
      transaction_amount: {
        amount: 9.99,
        currency: "EUR",
      },
      reference: "NETFLIX SUBSCRIPTION",
      supplementary_data: {
        card_transaction_type: "E-COMMERCE CARD NOT PRESENT",
      },
    },
    // ... more transactions
  ];
}
```

### Subscription Detection Logic

The backend analyzes transaction patterns to detect recurring payments:

1. Filters to **debit transactions only** (outgoing money)
2. Groups by **merchant name** (normalized)
3. Requires **2+ transactions** to same merchant
4. Analyzes **time intervals** between transactions
5. Detects **frequency** (Monthly, Quarterly, Bi-annual, Annual)
6. Calculates **next payment date**
7. Estimates **monthly equivalent** cost

**Result:**

```javascript
{
  subscriptions: [
    {
      id: "bank-session-netflix",
      name: "Netflix",
      frequency: "Monthly",
      amountValue: 14.99,
      currency: "EUR",
      monthlyAmount: 14.99,
      nextPaymentIso: "2024-04-15T10:30:00Z",
      source: "bank", // from bank, not manual
      bankId: "swedbank",
      importedAt: "2024-03-15T10:30:00Z",
    },
    // ... more subscriptions
  ];
}
```

---

## Frontend Implementation

### 1. **Fetch Transactions in a Screen**

```javascript
import { useState, useEffect } from "react";
import { getTransactions, getSupabaseClient } from "../src/lib/bankingApi";

export function YourScreen() {
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      // Get current user ID (from Supabase or AsyncStorage)
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const currentUserId = data?.user?.id;

      if (currentUserId) {
        setUserId(currentUserId);
        const result = await getTransactions(currentUserId);
        setTransactions(result.transactions || []);
      }
    };

    loadTransactions();
  }, []);

  return (
    // Display transactions
  );
}
```

### 2. **Display Transactions in a List**

```javascript
import { View, Text, FlatList, StyleSheet } from "react-native";

function TransactionList({ transactions }) {
  const renderTransaction = ({ item }) => {
    const isDebit = item.credit_debit_indicator === "DBIT";
    const amount = item.transaction_amount?.amount || 0;
    const merchant = item.reference || "Unknown";

    return (
      <View style={styles.transactionRow}>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchant}>{merchant}</Text>
          <Text style={styles.date}>
            {item.booking_date_time?.slice(0, 10)}
          </Text>
        </View>
        <Text style={[styles.amount, isDebit ? styles.debit : styles.credit]}>
          {isDebit ? "-" : "+"} {amount.toFixed(2)}{" "}
          {item.transaction_amount?.currency}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id || Math.random().toString()}
    />
  );
}

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  merchant: { fontSize: 14, fontWeight: "600" },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  amount: { fontSize: 14, fontWeight: "600" },
  debit: { color: "#DC2626" },
  credit: { color: "#16A34A" },
});
```

### 3. **Filter & Group Transactions**

```javascript
// Group by month
const groupedByMonth = transactions.reduce((acc, tx) => {
  const month = tx.booking_date_time?.slice(0, 7); // "2024-03"
  if (!acc[month]) acc[month] = [];
  acc[month].push(tx);
  return acc;
}, {});

// Filter by merchant
const netflixTransactions = transactions.filter((tx) =>
  tx.reference?.toLowerCase().includes("netflix"),
);

// Calculate monthly spend
const totalDebit = transactions
  .filter((tx) => tx.credit_debit_indicator === "DBIT")
  .reduce((sum, tx) => sum + (tx.transaction_amount?.amount || 0), 0);
```

---

## Example: Full Transactions Screen

Create a new file: `screens/TransactionsScreen.js`

```javascript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { getTransactions } from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Get user ID
        let userId = "";
        if (hasSupabaseConfig) {
          const supabase = getSupabaseClient();
          const { data } = await supabase.auth.getUser();
          userId = data?.user?.id || "";
        }

        if (!userId) {
          setTransactions([]);
          return;
        }

        // Fetch transactions
        const result = await getTransactions(userId);
        setTransactions(result.transactions || []);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#5B3FD9" />
      </SafeAreaView>
    );
  }

  const renderTransaction = ({ item }) => {
    const isDebit = item.credit_debit_indicator === "DBIT";
    const amount = item.transaction_amount?.amount || 0;
    const merchant = item.reference || "Transaction";
    const date = item.booking_date_time?.slice(0, 10) || "Unknown";

    return (
      <View style={styles.transactionRow}>
        <View style={styles.info}>
          <Text style={styles.merchant}>{merchant}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={[styles.amount, isDebit ? styles.debit : styles.credit]}>
          {isDebit ? "−" : "+"} €{amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>
          {transactions.length} transactions (last 6 months)
        </Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No transactions yet. Link a bank to see your transaction history.
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item, idx) => item.id || idx.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 16 },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  info: { flex: 1 },
  merchant: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  amount: { fontSize: 14, fontWeight: "600" },
  debit: { color: "#DC2626" },
  credit: { color: "#16A34A" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center" },
});
```

---

## Configuration

### Frontend Environment Variables

All using existing `.env` variables in backend:

```bash
# backend/.env
ENABLE_BANKING_MOCK=false  # Set to false to use real Enable Banking API
ENABLE_BANKING_APP_ID=your_app_id
ENABLE_BANKING_PRIVATE_KEY_PATH=/path/to/private/key.pem
```

### Transaction History Duration

Currently fetched: **Last 6 months**
(Configurable in `backend/server.js` line ~505)

```javascript
const dateFrom = new Date();
dateFrom.setMonth(dateFrom.getMonth() - 6); // Change 6 to desired months
```

---

## Data Flow Summary

```
User Authorization
        ↓
OAuth Redirect → Enable Banking
        ↓
Backend: POST /sessions {code}
        ↓
Get Accounts & Session ID
        ↓
For each Account:
  GET /accounts/{id}/transactions?date_from=2023-09-15
        ↓
Detect Recurring Patterns
        ↓
Store Transactions + Detected Subscriptions
        ↓
Frontend API: GET /api/banking/transactions?userId=xxx
        ↓
Display in UI
```

---

## Next Steps

1. ✅ **Added `getTransactions()` API function** to `src/lib/bankingApi.js`
2. 📋 Choose where to display transactions:
   - Create new `TransactionsScreen.js` (example above)
   - Add to existing `DashboardScreen.js`
   - Create a "Statement" section in `SettingsScreen.js`
3. 🔗 Add navigation to access transaction data
4. 💾 (Optional) Add transaction filtering, search, export features

---

## Troubleshooting

### Transactions are empty

- Ensure backend is running in **non-mock mode** (`ENABLE_BANKING_MOCK=false`)
- Verify Enable Banking API credentials are correct
- Check browser console for authorization errors
- Ensure at least 2 transactions exist for subscription detection

### Subscription Detection Not Working

- Usually requires 2+ transactions to same merchant
- Needs transactions spanning multiple dates
- Looks for patterns in 6-month history

### Mock Mode Testing

- Set `ENABLE_BANKING_MOCK=true` to see fake data
- Fake subscriptions in `backend/server.js` lines 46-75
- Easy for UI development without real bank data
