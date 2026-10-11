import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Plus } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { formatTime } from '../lib/medicationStatus';
import ScreenHeader from '../components/ScreenHeader';

// Add or edit a medication. route.params.medication present = edit mode;
// otherwise a new medication is created for route.params.childId.
export default function MedicationFormScreen({ route, navigation }) {
  const { childId, medication } = route.params ?? {};

  const [name, setName] = useState(medication?.name ?? '');
  const [dosage, setDosage] = useState(medication?.dosage ?? '');
  const [instructions, setInstructions] = useState(medication?.instructions ?? '');
  const [times, setTimes] = useState(medication?.times ?? []);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const addTime = (date) => {
    const value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    setTimes((prev) => (prev.includes(value) ? prev : [...prev, value].sort()));
  };

  const removeTime = (value) => setTimes((prev) => prev.filter((t) => t !== value));

  const openPicker = () => {
    setPickerTime(new Date());
    setShowPicker(true);
  };

  const handlePickerChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selected) addTime(selected);
    } else if (selected) {
      setPickerTime(selected);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) return setError('Please enter a medication name.');
    if (times.length === 0) return setError('Add at least one dose time.');

    setSaving(true);
    const payload = {
      name: name.trim(),
      dosage: dosage.trim() || null,
      instructions: instructions.trim() || null,
      times,
    };

    const { error: saveError } = medication
      ? await supabase.from('medications').update(payload).eq('id', medication.id)
      : await supabase.from('medications').insert({ ...payload, child_id: childId });
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenHeader title={medication ? 'Edit medication' : 'Add medication'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Panadol"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Dosage (optional)</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g. 5mL"
          placeholderTextColor={colors.inkSoft}
        />

        <Text style={styles.label}>Dose times</Text>
        <View style={styles.timeChipRow}>
          {times.map((t) => (
            <View key={t} style={styles.timeChip}>
              <Text style={styles.timeChipText}>{formatTime(t)}</Text>
              <Pressable onPress={() => removeTime(t)} hitSlop={8}>
                <X size={14} color={colors.ink} />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={openPicker}
            style={({ pressed }) => [styles.addTimeButton, pressed && styles.pressed]}
          >
            <Plus size={14} color={colors.ink} />
            <Text style={styles.addTimeText}>Add time</Text>
          </Pressable>
        </View>

        {showPicker && Platform.OS === 'android' ? (
          <DateTimePicker value={pickerTime} mode="time" onChange={handlePickerChange} />
        ) : null}
        {showPicker && Platform.OS === 'ios' ? (
          <View style={styles.iosPickerWrap}>
            <DateTimePicker value={pickerTime} mode="time" display="spinner" onChange={handlePickerChange} />
            <Pressable
              onPress={() => {
                addTime(pickerTime);
                setShowPicker(false);
              }}
              style={styles.iosPickerDone}
            >
              <Text style={styles.iosPickerDoneText}>Add this time</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.label}>Instructions (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="e.g. Take with food"
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
            <Text style={styles.saveText}>{medication ? 'Save changes' : 'Add medication'}</Text>
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },

  timeChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.sageLight,
  },
  timeChipText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  addTimeText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },

  iosPickerWrap: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  iosPickerDone: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  iosPickerDoneText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.clay },

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
