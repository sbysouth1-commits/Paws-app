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
import { useResources } from '../../state/ResourcesContext';
import { pickAndUploadFile } from '../../lib/fileUpload';
import ScreenHeader from '../../components/ScreenHeader';

// Add or edit a catalogue resource. With route.params.id, prefills from the
// existing resource and updates it; without, creates a new one.
export default function ResourceFormScreen({ route, navigation }) {
  const { getById, reload } = useResources();
  const existing = route.params?.id ? getById(route.params.id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState(existing?.category ?? categoryList[0]);
  const [ageRange, setAgeRange] = useState(existing?.age ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [description, setDescription] = useState(existing?.blurb ?? '');
  const [tag, setTag] = useState(existing?.tag ?? '');
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl ?? null);
  const [fileName, setFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handlePickFile = async () => {
    setError(null);
    setUploading(true);
    const result = await pickAndUploadFile('resource-files');
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
    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return setError('Please enter a valid price.');
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      category,
      age_range: ageRange.trim() || null,
      price_aud: parsedPrice,
      description: description.trim() || null,
      tag: tag.trim() || null,
      file_url: fileUrl,
    };

    const { error: saveError } = existing
      ? await supabase.from('resources').update(payload).eq('id', existing.id)
      : await supabase.from('resources').insert(payload);
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    await reload();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title={existing ? 'Edit resource' : 'Add resource'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Big Feelings Toolkit"
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

        <Text style={styles.label}>Age range</Text>
        <TextInput
          style={styles.input}
          value={ageRange}
          onChangeText={setAgeRange}
          placeholder="e.g. 4–8 yrs"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Price (AUD)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 12.50"
          placeholderTextColor={colors.inkSoft}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="What families get with this resource"
          placeholderTextColor={colors.inkSoft}
          multiline
        />

        <Text style={styles.label}>Tag (optional)</Text>
        <TextInput
          style={styles.input}
          value={tag}
          onChangeText={setTag}
          placeholder="e.g. Bestseller, New"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>File</Text>
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
                {fileName || fileUrl || 'Choose a file to upload'}
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
            <Text style={styles.saveText}>{existing ? 'Save changes' : 'Add resource'}</Text>
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
