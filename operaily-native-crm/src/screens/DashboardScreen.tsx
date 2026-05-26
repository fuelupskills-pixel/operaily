import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export function DashboardScreen() {
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    async function fetchMetrics() {
      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      if (count !== null) setTotalLeads(count);
    }
    fetchMetrics();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Total Leads</Text>
          <Text style={styles.metricValue}>{totalLeads}</Text>
        </View>

        <View style={styles.syncWidget}>
          <Text style={styles.widgetTitle}>Landing Page & Lead Sources Sync</Text>
          <View style={styles.syncItem}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncName}>Main Website Funnel</Text>
              <Text style={styles.syncDetail}>Syncing: 45 Leads Today</Text>
            </View>
            <View style={styles.syncStatusActive} />
          </View>
          <View style={styles.syncItem}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncName}>Facebook Ad Campaign</Text>
              <Text style={styles.syncDetail}>Syncing: 12 Leads Today</Text>
            </View>
            <View style={styles.syncStatusActive} />
          </View>
          <View style={styles.syncItem}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncName}>Instagram DMs</Text>
              <Text style={styles.syncDetail}>Offline</Text>
            </View>
            <View style={styles.syncStatusOffline} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutBtn: {
    padding: 8,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  metricTitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  metricValue: {
    color: '#3b82f6',
    fontSize: 36,
    fontWeight: 'bold',
  },
  syncWidget: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 16,
  },
  widgetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  syncInfo: {
    flex: 1,
  },
  syncName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  syncDetail: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  syncStatusActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  syncStatusOffline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
});
