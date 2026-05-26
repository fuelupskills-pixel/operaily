import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "http://YOUR_SERVER_IP:3000/api/field-sales"; // User must replace with their local IP or production URL
const SYNC_QUEUE_KEY = '@sync_queue';
const APPOINTMENTS_KEY = '@appointments';

export interface WorkLog {
  action_type: string;
  related_entity_id?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  sync_id: string;
}

export interface AppointmentUpdate {
  id: string;
  status: string;
  outcome_notes?: string;
}

export class SyncEngine {
  static async enqueueWorkLog(log: WorkLog) {
    const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue = queueStr ? JSON.parse(queueStr) : { workLogs: [], appointmentUpdates: [] };
    queue.workLogs.push(log);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static async enqueueAppointmentUpdate(update: AppointmentUpdate) {
    const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue = queueStr ? JSON.parse(queueStr) : { workLogs: [], appointmentUpdates: [] };
    queue.appointmentUpdates.push(update);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static async syncWithServer() {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!queueStr) return; // Nothing to sync

      const queue = JSON.parse(queueStr);
      if (queue.workLogs.length === 0 && queue.appointmentUpdates.length === 0) return;

      console.log('Syncing data with server...', queue);

      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queue),
      });

      if (response.ok) {
        // Clear queue on success
        await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
        console.log('Sync successful');
      } else {
        console.error('Server returned error during sync', await response.text());
      }
    } catch (e) {
      console.error('Network error during sync, will retry later.', e);
    }
  }

  static async fetchAppointments() {
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, { method: 'GET' });
      if (response.ok) {
        const json = await response.json();
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(json.data.appointments));
        return json.data.appointments;
      }
    } catch (e) {
      console.log('Offline: loading cached appointments');
      const cached = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  }
}
