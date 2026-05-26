import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_WORKFLOWS = [
  {
    id: '1',
    name: 'B2B Lead Outreach',
    status: 'Active',
    steps: [
      { id: 's1', type: 'trigger', label: 'Lead Added to CRM' },
      { id: 's2', type: 'action', label: 'Send Welcome Email' },
      { id: 's3', type: 'delay', label: 'Wait 2 Days' },
      { id: 's4', type: 'action', label: 'Send LinkedIn Request' },
    ]
  },
  {
    id: '2',
    name: 'Invoice Follow-up',
    status: 'Paused',
    steps: [
      { id: 's1', type: 'trigger', label: 'Invoice Overdue' },
      { id: 's2', type: 'action', label: 'Send Reminder Email' },
    ]
  }
];

export function WorkflowScreen() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const renderSteps = (steps: any[]) => {
    return steps.map((step, index) => (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          {index !== steps.length - 1 && <View style={styles.stepLine} />}
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepType}>{step.type.toUpperCase()}</Text>
          <Text style={styles.stepLabel}>{step.label}</Text>
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Automated Workflows</Text>
      </View>
      
      <FlatList
        data={MOCK_WORKFLOWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.workflowCard}>
            <TouchableOpacity 
              style={styles.workflowHeader}
              onPress={() => setSelectedWorkflow(selectedWorkflow === item.id ? null : item.id)}
            >
              <Text style={styles.workflowName}>{item.name}</Text>
              <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusPaused]}>
                <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextPaused]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
            
            {selectedWorkflow === item.id && (
              <View style={styles.stepsWrapper}>
                {renderSteps(item.steps)}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16, gap: 16 },
  workflowCard: { backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  workflowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  workflowName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusActive: { backgroundColor: '#10b98133' },
  statusPaused: { backgroundColor: '#f59e0b33' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusTextActive: { color: '#10b981' },
  statusTextPaused: { color: '#f59e0b' },
  stepsWrapper: { padding: 16, paddingTop: 0, backgroundColor: '#111' },
  stepContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  stepIndicator: { alignItems: 'center', width: 24, marginRight: 12 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginTop: 8 },
  stepLine: { width: 2, height: 40, backgroundColor: '#333', marginTop: 4 },
  stepCard: { flex: 1, backgroundColor: '#222', padding: 12, borderRadius: 8, marginBottom: 12 },
  stepType: { color: '#888', fontSize: 10, marginBottom: 2 },
  stepLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
