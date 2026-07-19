import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export default function MarketplaceScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/marketplace`)
      .then(res => res.json())
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#39ff14" />
      </View>
    );
  }

  const handleCheckout = async (productId, title) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert("Authentication Required", "You must be logged in via the ID tab to make a purchase.");
        return;
      }

      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Open the returned Stripe/Mock checkout URL in the device's browser
        Alert.alert(
           "Checkout Ready",
           `Redirecting to secure payment for ${title}...`,
           [
             { text: "Cancel", style: "cancel" },
             { text: "Proceed", onPress: () => Linking.openURL(data.url.startsWith('/') ? `${API_URL}${data.url}` : data.url) }
           ]
        );
      } else {
        Alert.alert("Error", data.error || "Checkout failed");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Network Error", "Failed to initiate checkout");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>THE EXCHANGE</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.seller}>{item.seller?.name || "Local Vendor"}</Text>
              <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

            <View style={styles.footer}>
              <Text style={styles.price}>{item.price > 0 ? `$${item.price.toFixed(2)}` : "FREE"}</Text>
              <TouchableOpacity
                 style={styles.buyButton}
                 onPress={() => handleCheckout(item.id, item.title)}
              >
                <Text style={styles.buyText}>{item.type === 'LOCAL_PROMO_COUPON' ? 'CLAIM' : 'BUY'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No items available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 15, letterSpacing: 2 },
  text: { color: '#888', fontSize: 16, textAlign: 'center' },
  card: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  seller: { color: '#39ff14', fontWeight: 'bold', fontSize: 12 },
  type: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  desc: { color: '#aaa', fontSize: 14, marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#fff', fontSize: 20, fontWeight: '900' },
  buyButton: { backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 4 },
  buyText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 }
});
