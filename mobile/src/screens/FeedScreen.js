import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

// Use local machine IP or production domain.
// 10.0.2.2 is the standard Android emulator alias for localhost.
import config from '../config';
const API_URL = config.API_URL;

export default function FeedScreen() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/feed`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch feed');
        return res.json();
      })
      .then(data => {
        setFeed(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not connect to The Hub: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.author}>{item.author?.name || 'System Update'}</Text>
            <Text style={styles.content}>{item.content || item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No updates on the network yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 20 },
  errorText: { color: '#ff3333', fontSize: 16, textAlign: 'center' },
  postCard: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  author: { color: '#39ff14', fontWeight: 'bold', marginBottom: 5 },
  content: { color: '#ccc', fontSize: 14 }
});
