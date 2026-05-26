import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export function VideoStudioScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase.from('video_productions').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) setVideos(data);
      setLoading(false);
    }
    fetchVideos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Studio</Text>
      </View>
      <View style={styles.recordAction}>
        <TouchableOpacity style={styles.recordBtn}>
          <Text style={styles.recordText}>🔴 Record New Video</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.topic} numberOfLines={1}>{item.topic}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.audience}>Audience: {item.target_audience}</Text>
              <Text style={styles.tone}>Tone: {item.tone}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No video productions found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  topic: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { backgroundColor: '#3b82f633', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
  audience: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  tone: { color: '#aaa', fontSize: 14 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  recordAction: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  recordBtn: { backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  recordText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
