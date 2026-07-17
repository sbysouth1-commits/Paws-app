import * as DocumentPicker from 'expo-document-picker';
import { supabase, isSupabaseConfigured } from './supabase';

// Lets the admin pick a file from their device and upload it straight into a
// private Storage bucket (resource-files or therapist-files), returning the
// object path to save into a file_url column. Replaces the old flow of
// uploading via the dashboard and copy-pasting the path by hand.
export async function pickAndUploadFile(bucket) {
  if (!isSupabaseConfigured) {
    return { error: 'File uploads need Supabase to be connected.' };
  }

  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return { cancelled: true };

  const file = result.assets[0];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}-${safeName}`;

  try {
    const response = await fetch(file.uri);
    const arrayBuffer = await response.arrayBuffer();
    const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
      contentType: file.mimeType || 'application/octet-stream',
      upsert: false,
    });
    if (error) return { error: error.message };
    return { path, name: file.name };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload failed.' };
  }
}
