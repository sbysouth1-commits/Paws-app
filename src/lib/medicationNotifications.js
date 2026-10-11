import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'medication-reminders';

// Requests (and remembers) notification permission. Used both to let a
// locally-displayed push actually show up, and as a prerequisite for getting
// a push token at all (see pushTokens.js).
export async function ensureNotificationPermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Medication reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    // Expo Go on recent SDKs doesn't support notifications on Android —
    // fails closed rather than crashing the rest of the app.
    return false;
  }
}
