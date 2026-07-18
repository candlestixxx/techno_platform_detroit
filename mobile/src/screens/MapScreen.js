import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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

  // Default region: Downtown Detroit
  const initialRegion = {
    latitude: 42.3314,
    longitude: -83.0458,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LIVE RADAR EVENTS</Text>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        userInterfaceStyle="dark"
      >
        {events.map((event) => {
          let coords = event.coordinates;

          // Next.js API sometimes returns parsed objects or strings
          if (typeof coords === 'string') {
            try {
              coords = JSON.parse(coords);
            } catch (e) {
              console.error("Failed to parse coordinates for", event.id);
            }
          }

          if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
             return null;
          }

          return (
            <Marker
              key={event.id}
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              title={event.title}
              description={`${event.venue} | ${new Date(event.date).toLocaleDateString()}`}
              pinColor="#39ff14"
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 15, letterSpacing: 2, paddingHorizontal: 5 },
  map: { flex: 1, borderRadius: 8 }
});
