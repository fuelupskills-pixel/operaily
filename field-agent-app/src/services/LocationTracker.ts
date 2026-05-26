import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';
const API_BASE_URL = "http://YOUR_SERVER_IP:3000/api/field-sales"; // User must replace with their local IP

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location tracking error", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    try {
      // Send location directly to backend
      const response = await fetch(`${API_BASE_URL}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      });
      if (!response.ok) {
        // If offline, we could queue these in AsyncStorage similar to SyncEngine
        console.log("Failed to push location, server unreachable");
      }
    } catch (e) {
      console.log("Network error while pushing location");
    }
  }
});

export class LocationTracker {
  static async requestPermissions() {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      return backgroundStatus === 'granted';
    }
    return false;
  }

  static async startTracking() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Location permissions denied');
      return;
    }

    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!isTracking) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // Update every 1 minute
        distanceInterval: 50, // Or every 50 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Live Tracking Active',
          notificationBody: 'Your location is being shared with dispatch.',
        }
      });
      console.log("Background location tracking started");
    }
  }

  static async stopTracking() {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Background location tracking stopped");
    }
  }
}
