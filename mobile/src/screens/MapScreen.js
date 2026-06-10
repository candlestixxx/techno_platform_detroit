import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import config from '../config';
const API_URL = config.API_URL;

export default function MapScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data || []);
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

  return (
    <View style={styles.container}>
      {/* In a real production app, replace FlatList with react-native-maps */}
      <Text style={styles.header}>LIVE RADAR EVENTS</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.venue}>{item.venue}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No events tracked.</Text>}
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
    borderLeftWidth: 3,
    borderLeftColor: '#39ff14'
  },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  venue: { color: '#aaa', fontSize: 14 },
  date: { color: '#666', fontSize: 12, marginTop: 5 }
});
