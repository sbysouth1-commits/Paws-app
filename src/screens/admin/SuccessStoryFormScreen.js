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
import { colors, fonts } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import ScreenHeader from '../../components/ScreenHeader';

// Logs a milestone update for one child (route.params.childId).
export default function SuccessStoryFormScreen({ route, navigation }) {
  const { childId } = route.params;
  const [title, setTitle] = useState('');
  const [therapistName, setTherapistName] = useState('');
  const [story, setStory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) return setError('Please enter a title.');
    if (!story.trim()) return setError('Please write the story.');

    setSaving(true);
    const { error: saveError } = await supabase.from('success_stories').insert({
      child_id: childId,
      title: title.trim(),
      therapist_name: therapistName.trim() || null,
      story: story.trim(),
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
      <ScreenHeader title="Add success story" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. First full day at school!"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Your name (shown to the family)</Text>
        <TextInput
          style={styles.input}
          value={therapistName}
          onChangeText={setTherapistName}
          placeholder="e.g. Priya (OT)"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Story</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={story}
          onChangeText={setStory}
          placeholder="What happened, why it matters..."
          placeholderTextColor={colors.inkSoft}
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>Save story</Text>
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
  multiline: { minHeight: 110, textAlignVertical: 'top' },

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
