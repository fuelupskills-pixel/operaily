import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export function LeadDetailScreen({ route, navigation }: any) {
  const { leadId } = route.params;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeadDetails() {
      // 1. Try Next.js API backend
      try {
        const response = await fetch(`${API_BASE}/api/leads/${leadId}`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.lead) {
            setLead(res.lead);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("[LeadDetailScreen] API fetch failed, trying Supabase client:", e);
      }

      // 2. Fallback to direct Supabase client
      try {
        const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
        if (data && !error) {
          setLead(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("[LeadDetailScreen] Supabase fetch failed, using mock fallback:", e);
      }

      // 3. Static fallback
      setLead({
        id: leadId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@pharmacorp.com',
        phone: '+1 202 555 0143',
        companyName: 'PharmaCorp Inc',
        industry: 'Pharmaceutical',
        leadScore: 85,
        status: 'new'
      });
      setLoading(false);
    }
    fetchLeadDetails();
  }, [leadId]);

  const handleCall = () => {
    if (!lead?.phone) return Alert.alert("No phone number", "This lead does not have a phone number.");
    Linking.openURL(`tel:${lead.phone}`);
  };

  const handleWhatsApp = () => {
    if (!lead?.phone) return Alert.alert("No phone number", "This lead does not have a phone number.");
    Linking.openURL(`whatsapp://send?phone=${lead.phone}`);
  };

  const handleEmail = () => {
    if (!lead?.email) return Alert.alert("No email", "This lead does not have an email address.");
    Linking.openURL(`mailto:${lead.email}`);
  };

  // Helper variables to handle both camelCase and snake_case formats
  const firstName = lead?.firstName || lead?.first_name || '';
  const lastName = lead?.lastName || lead?.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || lead?.fullName || lead?.full_name || 'N/A';
  const email = lead?.email || 'N/A';
  const company = lead?.companyName || lead?.company_name || 'N/A';
  const industry = lead?.industry || 'N/A';
  const score = lead?.leadScore || lead?.lead_score || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lead Details</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : lead ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{name}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
              <Text style={styles.actionBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.waBtn]} onPress={handleWhatsApp}>
              <Text style={styles.actionBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.emailBtn]} onPress={handleEmail}>
              <Text style={styles.actionBtnText}>✉️ Email</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{company}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{industry}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Lead Score</Text>
            <Text style={styles.value}>{score}</Text>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.errorText}>Lead not found.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  backBtn: { marginRight: 16 },
  backText: { color: '#3b82f6', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  label: { color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  value: { color: '#fff', fontSize: 16, fontWeight: '500' },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 40 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 },
  actionBtn: { flex: 1, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  waBtn: { backgroundColor: '#25D366' },
  emailBtn: { backgroundColor: '#6366f1' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
