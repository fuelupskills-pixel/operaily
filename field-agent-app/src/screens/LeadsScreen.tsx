import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export function LeadsScreen({ navigation }: any) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      // 1. Try Next.js API backend
      try {
        const response = await fetch(`${API_BASE}/api/leads`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && Array.isArray(res.leads)) {
            setLeads(res.leads);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("[LeadsScreen] API fetch failed, trying Supabase client:", e);
      }

      // 2. Fallback to direct Supabase client
      try {
        const { data, error } = await supabase.from('leads').select('*').limit(50);
        if (data && !error) {
          setLeads(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("[LeadsScreen] Supabase fetch failed, using mock data:", e);
      }

      // 3. Client-side static fallback
      setLeads([
        { id: '1', firstName: 'John', lastName: 'Doe', companyName: 'PharmaCorp Inc', industry: 'Pharmaceutical', leadScore: 85, status: 'new' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', companyName: 'BioHealth UK', industry: 'Nutraceutical', leadScore: 92, status: 'new' },
        { id: '3', firstName: 'Ahmad', lastName: 'Al-Rashid', companyName: 'Gulf Medical Suppliers', industry: 'Medical Equipment', leadScore: 78, status: 'new' }
      ]);
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const name = lead.firstName || lead.first_name ? `${lead.firstName || lead.first_name} ${lead.lastName || lead.last_name}` : lead.fullName || lead.full_name || '';
    const company = lead.companyName || lead.company_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or company..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const name = item.firstName || item.first_name ? `${item.firstName || item.first_name} ${item.lastName || item.last_name}` : item.fullName || item.full_name || 'Unnamed Lead';
            const company = item.companyName || item.company_name || 'No Company';
            return (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })}
              >
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.company}>{company}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No leads found</Text>}
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
  name: { color: '#fff', fontSize: 18, fontWeight: '600' },
  company: { color: '#888', fontSize: 14, marginTop: 4 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 16 },
});
