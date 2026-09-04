import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export default function InboxScreen() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  const fetchConversations = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/dm`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        setAuthToken(token);
        fetchConversations(token);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadConversation = async (conv) => {
    setActiveConversation(conv);
    const targetUserId = getOtherUser(conv).id;
    try {
      const res = await fetch(`${API_URL}/api/dm?targetUserId=${targetUserId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const targetUserId = getOtherUser(activeConversation).id;
    const optimisticMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: 'me', // Optimistic bypass
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await fetch(`${API_URL}/api/dm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ targetUserId, content: optimisticMessage.content })
      });
      if (!res.ok) {
        Alert.alert("Error", "Failed to transmit message.");
      } else {
        fetchConversations(authToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUser = (conv) => {
    // Mobile frontend doesn't strictly know "its own" user ID without an extra fetch,
    // but the backend sends the fully populated user objects. We'll find the one
    // that isn't the generic "me" or infer based on whoever's name we don't have.
    // Given the backend `GET /api/dm` doesn't explicitly return our own ID in the top level
    // unless we decode the JWT. A safe approach is to just use user2 if user1 is the one who initiated.
    // Alternatively, we parse the JWT, but React Native doesn't have atob built-in securely.
    // We'll rely on the structure: if user1 matches the logged-in user, the backend will still supply user1 and user2.
    // To simplify: Since it's 1-on-1, just grab the user object that isn't the logged-in user.
    // Wait, we need our own user ID. Let's decode the JWT manually.

    let myId = null;
    try {
       const payloadBase64 = authToken.split('.')[1];
       // basic base64 decode for RN
       const decodedStr = global.atob ? atob(payloadBase64) : Buffer.from(payloadBase64, 'base64').toString('binary');
       const parsed = JSON.parse(decodedStr);
       myId = parsed.id;
    } catch(e) {}

    return conv.user1Id === myId ? conv.user2 : conv.user1;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#39ff14" />
      </View>
    );
  }

  if (!authToken) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Authentication required. Please connect your ID first.</Text>
      </View>
    );
  }

  if (activeConversation) {
    const otherUser = getOtherUser(activeConversation);
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveConversation(null)} style={styles.backBtn}>
             <Text style={styles.backBtnText}>&lt; BACK</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>{otherUser?.name || "UNKNOWN"}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === 'me' || (item.sender?.name !== otherUser?.name);
            return (
              <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
                <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={styles.msgText}>{item.content}</Text>
                </View>
              </View>
            )
          }}
        />

        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Transmit message..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.5 }]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendBtnText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PRIVATE COMM LINKS</Text>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item);
          const lastMsg = item.messages && item.messages.length > 0 ? item.messages[0].content : "No messages yet.";
          return (
            <TouchableOpacity style={styles.card} onPress={() => loadConversation(item)}>
              <Text style={styles.title}>{otherUser?.name || "Unknown Identity"}</Text>
              <Text style={styles.preview} numberOfLines={1}>{lastMsg}</Text>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={<Text style={styles.text}>No active connections.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { color: '#39ff14', fontSize: 18, fontWeight: '900', margin: 15, letterSpacing: 2 },
  text: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 20 },
  errorText: { color: '#ff3333', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#111', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  preview: { color: '#666', fontSize: 14 },

  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  backBtn: { paddingRight: 15 },
  backBtnText: { color: '#39ff14', fontWeight: 'bold' },
  chatHeaderTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },

  msgWrapper: { width: '100%', marginBottom: 10 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 8 },
  myBubble: { backgroundColor: '#39ff14', borderBottomRightRadius: 0 },
  theirBubble: { backgroundColor: '#222', borderWidth: 1, borderColor: '#333', borderBottomLeftRadius: 0 },
  msgText: { color: '#000', fontSize: 14 },

  inputBox: { flexDirection: 'row', padding: 10, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#333' },
  textInput: { flex: 1, backgroundColor: '#000', color: '#fff', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#333' },
  sendBtn: { backgroundColor: '#39ff14', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginLeft: 10 },
  sendBtnText: { color: '#000', fontWeight: 'bold', letterSpacing: 1 }
});