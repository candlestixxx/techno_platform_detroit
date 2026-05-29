import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MarketplaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Stripe Marketplace goes here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#888', fontSize: 16 }
});
