import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>App Error</Text>
          <Text style={styles.message}>{this.state.error?.message || String(this.state.error)}</Text>
          {this.state.error?.stack ? (
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          ) : null}
          {this.state.errorInfo?.componentStack ? (
            <Text style={styles.stack}>{this.state.errorInfo.componentStack}</Text>
          ) : null}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#ef4444', marginBottom: 12 },
  message: { fontSize: 16, color: '#fff', marginBottom: 16 },
  stack: { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' },
});
