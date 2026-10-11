import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'medication-reminders';
const DATA_MARKER = 'medication-reminder';

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
    // Expo Go on recent SDKs doesn't support scheduled notifications on
    // Android — fails closed rather than crashing the rest of the app.
    return false;
  }
}

// Cancels every medication-reminder notification this app previously
// scheduled, then schedules one daily-repeating alert per active
// medication's dose time. Call this any time a medication is added, edited,
// deactivated, or removed — it's cheap to just resync everything from
// scratch rather than tracking individual notification ids.
export async function resyncMedicationNotifications(childName, medications) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.type === DATA_MARKER)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );

    const granted = await ensureNotificationPermission();
    if (!granted) return { ok: false, reason: 'permission-denied' };

    for (const med of medications) {
      if (!med.active) continue;
      for (const time of med.times ?? []) {
        const [hour, minute] = time.split(':').map(Number);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${childName}'s medication`,
            body: `Time for ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
            data: { type: DATA_MARKER, medicationId: med.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
      }
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown' };
  }
}
