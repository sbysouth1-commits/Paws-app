import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase, isSupabaseConfigured } from './supabase';
import { ensureNotificationPermission } from './medicationNotifications';

// Registers this device to receive medication reminder pushes (sent by the
// send_due_medication_reminders cron job in schema.sql). Safe to call
// repeatedly — it upserts by token, so re-registering the same device after
// the first time is a no-op.
export async function registerPushToken(familyId) {
  if (!isSupabaseConfigured || !familyId) return { ok: false, reason: 'not-configured' };
  if (!Device.isDevice) return { ok: false, reason: 'simulator' }; // push tokens need a real device

  const granted = await ensureNotificationPermission();
  if (!granted) return { ok: false, reason: 'permission-denied' };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { ok: false, reason: 'no-project-id' };

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase
      .from('push_tokens')
      .upsert({ family_id: familyId, token, platform: Platform.OS }, { onConflict: 'token' });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown' };
  }
}
