import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use local machine IP or production domain.
// 10.0.2.2 is the standard Android emulator alias for localhost.
import config from '../config';
const API_URL = config.API_URL;

export default function FeedScreen() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchFeed = () => {
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
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert("Authentication Required", "Log in via the ID tab to post updates.");
        setPosting(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: postContent })
      });

      if (res.ok) {
        setPostContent('');
        fetchFeed(); // Refresh the list
      } else {
        const data = await res.json();
        Alert.alert("Error", data.error || "Failed to post");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error while posting.");
    } finally {
      setPosting(false);
    }
  };

  if (loading && feed.length === 0) {
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
      <View style={styles.composeBox}>
        <TextInput
          style={styles.composeInput}
          placeholder="Broadcast to the network..."
          placeholderTextColor="#666"
          value={postContent}
          onChangeText={setPostContent}
          multiline
        />
        <TouchableOpacity
          style={[styles.postButton, (!postContent.trim() || posting) && { opacity: 0.5 }]}
          onPress={handlePost}
          disabled={!postContent.trim() || posting}
        >
          <Text style={styles.postButtonText}>{posting ? '...' : 'POST'}</Text>
        </TouchableOpacity>
      </View>
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
  composeBox: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  composeInput: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#333', minHeight: 45 },
  postButton: { backgroundColor: '#39ff14', padding: 12, marginLeft: 10, borderRadius: 5, justifyContent: 'center' },
  postButtonText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
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
