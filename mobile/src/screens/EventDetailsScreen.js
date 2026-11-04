import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config';
const API_URL = config.API_URL;

export default function EventDetailsScreen({ event, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(null);

  const eventId = event?.id || event?.metadata?.id;

  const fetchReviews = async () => {
    if (!eventId) {
      setLoadingReviews(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('@auth_token');
      setToken(storedToken);
    };
    loadAuth();
    fetchReviews();
  }, [eventId]);

  const handleSubmitReview = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Log in via the ID tab to submit a rating or review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          content: reviewContent.trim() ? reviewContent : undefined,
        }),
      });

      if (res.ok) {
        setReviewContent('');
        Alert.alert('Success', 'Your review and rating have been recorded.');
        fetchReviews();
      } else {
        const data = await res.json();
        Alert.alert('Submission Error', data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not transmit review to the network.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <ScrollView style={styles.container}>
      {/* Top Header / Back Button */}
      <View style={styles.navBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>&lt; BACK TO FEED</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Event Details Card */}
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{event?.title || event?.content || 'Underground Gathering'}</Text>
        <Text style={styles.eventVenue}>
          {event?.venue || event?.metadata?.venue || 'Detroit Warehouse'}
        </Text>
        <Text style={styles.eventDate}>
          {event?.date || event?.metadata?.eventDate
            ? new Date(event?.date || event?.metadata?.eventDate).toLocaleDateString()
            : 'Upcoming'}
        </Text>
        {event?.lineup && <Text style={styles.eventLineup}>Lineup: {event.lineup}</Text>}

        {/* Rating Summary Pill */}
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingSummaryText}>
            COMMUNITY INTEL: {averageRating ? `★ ${averageRating} / 5.0` : 'NO RATINGS YET'}
          </Text>
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>
      </View>

      {/* Submit Review Section */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>TRANSMIT EVENT REPORT</Text>
        <Text style={styles.label}>RATING (1 - 5 STARS)</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={[styles.starBtn, rating >= star && styles.starBtnActive]}
            >
              <Text style={[styles.starText, rating >= star && styles.starTextActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>INTEL / VIBE REPORT (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Sound system quality, vibe, crowd atmosphere..."
          placeholderTextColor="#666"
          value={reviewContent}
          onChangeText={setReviewContent}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'TRANSMITTING...' : 'SUBMIT REPORT'}</Text>
        </TouchableOpacity>
      </View>

      {/* Historical Reviews List */}
      <View style={styles.reviewsCard}>
        <Text style={styles.reviewsTitle}>COMMUNITY TRANSMISSIONS</Text>
        {loadingReviews ? (
          <ActivityIndicator color="#39ff14" style={{ marginVertical: 15 }} />
        ) : reviews.length === 0 ? (
          <Text style={styles.emptyText}>Be the first to file a field report for this event.</Text>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{rev.author?.name || 'Anonymous Operative'}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(rev.rating)}</Text>
              </View>
              {rev.content ? <Text style={styles.reviewBody}>"{rev.content}"</Text> : null}
              <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 15 },
  navBar: { marginBottom: 10 },
  backButton: { paddingVertical: 8 },
  backButtonText: { color: '#39ff14', fontWeight: 'bold', letterSpacing: 1 },
  eventCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 15,
  },
  eventTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  eventVenue: { color: '#39ff14', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  eventDate: { color: '#888', fontSize: 12, marginBottom: 6 },
  eventLineup: { color: '#aaa', fontSize: 13, marginTop: 4 },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  ratingSummaryText: { color: '#39ff14', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  reviewCount: { color: '#666', fontSize: 12 },
  formCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  formTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  label: { color: '#888', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  starRow: { flexDirection: 'row', gap: 8 },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  starBtnActive: { backgroundColor: '#39ff14', borderColor: '#39ff14' },
  starText: { color: '#555', fontSize: 20 },
  starTextActive: { color: '#000' },
  textInput: {
    backgroundColor: '#000',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 60,
    marginBottom: 14,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#39ff14',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  reviewsCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 30,
  },
  reviewsTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  emptyText: { color: '#666', fontStyle: 'italic', fontSize: 13, textAlign: 'center', marginVertical: 10 },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  reviewStars: { color: '#39ff14', fontSize: 12 },
  reviewBody: { color: '#ccc', fontSize: 13, fontStyle: 'italic', marginBottom: 4 },
  reviewDate: { color: '#555', fontSize: 10 },
});
