import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const API_URL = 'http://10.0.2.2:3000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('@auth_token');
            if (storedToken) {
                setAuthToken(storedToken);
                fetchProfile(storedToken);
            } else {
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
        }
    }
    checkToken();
  }, []);

  const registerForPushNotificationsAsync = async (token) => {
    let pushToken;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#39ff14',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId = "detroit-underground"; // Replace with Expo project ID in prod
        pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

        // Register token with backend
        await fetch(`${API_URL}/api/push/expo-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ expoPushToken: pushToken })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }
  };

  const fetchProfile = (token) => {
    setLoading(true);
    fetch(`${API_URL}/api/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setAuthToken(null);
        setLoading(false);
      });
  };

  const handleLogin = async () => {
      setLoading(true);
      setError('');
      try {
          const res = await fetch(`${API_URL}/api/auth/mobile-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (data.token) {
              setAuthToken(data.token);
              await AsyncStorage.setItem('@auth_token', data.token);
              fetchProfile(data.token);
              registerForPushNotificationsAsync(data.token);
          } else {
              setError(data.error || 'Login failed');
              setLoading(false);
          }
      } catch (err) {
          setError('Network error');
          setLoading(false);
      }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#39ff14" />
      </View>
    );
  }

  if (!authToken || !profile) {
      return (
        <View style={styles.center}>
            <Text style={styles.sectionHeader}>MOBILE HUB LOGIN</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>ACCESS NETWORK</Text>
            </TouchableOpacity>
        </View>
      )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.avatar}>
           <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name || "Anonymous User"}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{profile?.role}</Text></View>
      </View>

      <Text style={styles.sectionHeader}>EVENT TICKETS</Text>
      {profile?.tickets && profile.tickets.length > 0 ? (
          profile.tickets.map(ticket => (
              <View key={ticket.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{ticket.event?.title}</Text>
                  <Text style={styles.cardSub}>{new Date(ticket.event?.date).toLocaleDateString()}</Text>
                  <Text style={styles.qrCode}>QR: {ticket.qrCode.substring(0,8)}...</Text>
              </View>
          ))
      ) : (
          <Text style={styles.empty}>No tickets found.</Text>
      )}

      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>ACTIVE SUBSCRIPTIONS</Text>
      {profile?.subscriptions && profile.subscriptions.length > 0 ? (
          profile.subscriptions.map(sub => (
              <View key={sub.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{sub.tier?.artist?.name}</Text>
                  <Text style={styles.cardSub}>{sub.tier?.name} - {sub.status}</Text>
              </View>
          ))
      ) : (
          <Text style={styles.empty}>No fan club subscriptions active.</Text>
      )}

      <TouchableOpacity style={[styles.loginBtn, {marginTop: 40, backgroundColor: '#333'}]} onPress={async () => {
          setAuthToken(null);
          setProfile(null);
          await AsyncStorage.removeItem('@auth_token');
      }}>
          <Text style={[styles.loginBtnText, {color: '#888'}]}>DISCONNECT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 15 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  input: { width: '100%', backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  loginBtn: { width: '100%', backgroundColor: '#39ff14', padding: 15, borderRadius: 5, alignItems: 'center' },
  loginBtnText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
  errorText: { color: '#ff3333', marginBottom: 15, fontWeight: 'bold' },
  headerBlock: { alignItems: 'center', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111', borderWidth: 2, borderColor: '#39ff14', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#888', fontSize: 30, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  email: { color: '#888', fontSize: 14, marginBottom: 10 },
  badge: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  sectionHeader: { color: '#39ff14', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  card: { backgroundColor: '#111', padding: 15, borderRadius: 8, marginBottom: 10 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#aaa', fontSize: 12, marginTop: 4 },
  qrCode: { color: '#39ff14', fontSize: 10, marginTop: 10, fontFamily: 'monospace' },
  empty: { color: '#555', fontStyle: 'italic', marginBottom: 20 }
});
