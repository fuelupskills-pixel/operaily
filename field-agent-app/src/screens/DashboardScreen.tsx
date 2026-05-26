import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationTracker } from '../services/LocationTracker';
import { SyncEngine } from '../services/SyncEngine';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export function DashboardScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    // Force a sync of pending outbound logs
    await SyncEngine.syncWithServer();
    // Pull latest inbound appointments
    const data = await SyncEngine.fetchAppointments();
    setAppointments(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTracking = async () => {
    if (isTracking) {
      await LocationTracker.stopTracking();
      setIsTracking(false);
      // Log check-out
      await SyncEngine.enqueueWorkLog({
        action_type: 'clock_out',
        timestamp: new Date().toISOString(),
        sync_id: uuidv4()
      });
    } else {
      await LocationTracker.startTracking();
      setIsTracking(true);
      // Log check-in
      await SyncEngine.enqueueWorkLog({
        action_type: 'clock_in',
        timestamp: new Date().toISOString(),
        sync_id: uuidv4()
      });
    }
  };

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    Alert.alert(
      "Update Appointment",
      `Mark this appointment as ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            await SyncEngine.enqueueAppointmentUpdate({
              id,
              status: newStatus,
              outcome_notes: newStatus === 'completed' ? 'Meeting went well.' : ''
            });
            Alert.alert("Saved", "Status updated. It will sync automatically.");
            loadData(); // Reload to reflect cached changes if implemented in SyncEngine cache updater
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Field Agent CRM</Text>
        <TouchableOpacity 
          style={[styles.trackingBtn, isTracking ? styles.trackingBtnActive : {}]} 
          onPress={handleToggleTracking}
        >
          <Text style={styles.trackingBtnText}>
            {isTracking ? "Clock Out" : "Clock In"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Today's Appointments</Text>
      
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#fff" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, item.status === 'completed' ? styles.badgeSuccess : styles.badgePending]}>
                <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.cardTime}>
              {new Date(item.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
            {item.address && <Text style={styles.cardAddress}>{item.address}</Text>}
          </TouchableOpacity>
        )}
        ListFooterComponent={
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
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  trackingBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackingBtnActive: { backgroundColor: '#ef4444' },
  trackingBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { color: '#888', fontSize: 16, margin: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666', textAlign: 'center' },
  card: {
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgePending: { backgroundColor: '#f59e0b33' },
  badgeSuccess: { backgroundColor: '#10b98133' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  cardTime: { color: '#3b82f6', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  cardAddress: { color: '#aaa', fontSize: 14 },
  syncWidget: {
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  widgetTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  syncItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  syncInfo: { flex: 1 },
  syncName: { color: '#fff', fontSize: 14, fontWeight: '500' },
  syncDetail: { color: '#888', fontSize: 12, marginTop: 2 },
  syncStatusActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' },
});
