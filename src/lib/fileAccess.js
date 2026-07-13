import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from './supabase';

// Signed URLs are short-lived on purpose — generated fresh each time someone
// taps "Open resource", not stored or reused.
const SIGNED_URL_TTL_SECONDS = 60 * 5;

// Opens a private Storage file in the system/in-app browser. `path` is the
// value stored in a resource's file_url column (the object's path within the
// given bucket, set by you when you upload the file in the dashboard).
export async function openStorageFile(bucket, path) {
  if (!isSupabaseConfigured) {
    return { error: 'File downloads need Supabase to be connected.' };
  }
  if (!path) {
    return { error: 'No file has been uploaded for this yet.' };
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) return { error: error.message };

  await WebBrowser.openBrowserAsync(data.signedUrl);
  return {};
}
