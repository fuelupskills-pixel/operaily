import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export function LeadDetailScreen({ route, navigation }: any) {
  const { leadId } = route.params;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeadDetails() {
      const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (data) setLead(data);
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
            <Text style={styles.value}>{lead.first_name} {lead.last_name}</Text>
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
            <Text style={styles.value}>{lead.email || 'N/A'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{lead.company_name || 'N/A'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{lead.industry || 'N/A'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Lead Score</Text>
            <Text style={styles.value}>{lead.lead_score || 0}</Text>
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
