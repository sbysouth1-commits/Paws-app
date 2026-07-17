import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paperclip } from 'lucide-react-native';
import { colors, fonts, categoryList } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { pickAndUploadFile } from '../../lib/fileUpload';
import ScreenHeader from '../../components/ScreenHeader';

// Shares a private resource with one child (route.params.childId).
export default function TherapistResourceFormScreen({ route, navigation }) {
  const { childId } = route.params;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryList[0]);
  const [therapistName, setTherapistName] = useState('');
  const [note, setNote] = useState('');
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handlePickFile = async () => {
    setError(null);
    setUploading(true);
    const result = await pickAndUploadFile('therapist-files');
    setUploading(false);
    if (result.cancelled) return;
    if (result.error) {
      setError(result.error);
      return;
    }
    setFileUrl(result.path);
    setFileName(result.name);
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) return setError('Please enter a title.');

    setSaving(true);
    const { error: saveError } = await supabase.from('therapist_resources').insert({
      child_id: childId,
      title: title.trim(),
      category,
      therapist_name: therapistName.trim() || null,
      note: note.trim() || null,
      file_url: fileUrl,
    });
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title="Add therapist resource" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Morning Routine Cards"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categoryList.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Your name (shown to the family)</Text>
        <TextInput
          style={styles.input}
          value={therapistName}
          onChangeText={setTherapistName}
          placeholder="e.g. Priya (OT)"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Note to the family</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={note}
          onChangeText={setNote}
          placeholder="Why you're sharing this, how to use it..."
          placeholderTextColor={colors.inkSoft}
          multiline
        />

        <Text style={styles.label}>File (optional)</Text>
        <Pressable
          onPress={handlePickFile}
          disabled={uploading}
          style={({ pressed }) => [styles.fileButton, (pressed || uploading) && styles.pressed]}
        >
          {uploading ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <Paperclip size={16} color={colors.ink} />
              <Text style={styles.fileButtonText} numberOfLines={1}>
                {fileName || 'Choose a file to upload'}
              </Text>
            </>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>Share with family</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },

  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink, marginTop: 14, marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.sageLight,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.ink },
  chipTextActive: { color: colors.white },

  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fileButtonText: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink },

  error: {
    marginTop: 14,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: '#B3261E',
    textAlign: 'center',
  },

  saveButton: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.clay,
  },
  saveText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.white },
});
