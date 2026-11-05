import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DraftErrors, validateDraft } from '../logic/applications';
import { colors, statusColors } from '../theme';
import { ApplicationDraft, STATUSES } from '../types';

interface Props {
  /** When provided, the form edits an existing application. */
  initial?: ApplicationDraft;
  today: string;
  onSubmit: (draft: ApplicationDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url' | 'numbers-and-punctuation';
}

function Field({ label, error, multiline, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        multiline={multiline}
        autoCapitalize={inputProps.keyboardType === 'url' ? 'none' : 'sentences'}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
        placeholderTextColor={colors.muted}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function ApplicationForm({ initial, today, onSubmit, onCancel, onDelete }: Props) {
  const [draft, setDraft] = useState<ApplicationDraft>(
    initial ?? { company: '', role: '', status: 'Applied', appliedOn: today },
  );
  const [errors, setErrors] = useState<DraftErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(draft);
  };

  const handleDelete = () => {
    // Two taps to delete, so a slip of the finger can't remove an application.
    if (confirmDelete) onDelete?.();
    else setConfirmDelete(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title} accessibilityRole="header">
          {initial ? 'Edit application' : 'New application'}
        </Text>

        <Field
          label="Company"
          value={draft.company}
          onChangeText={(text) => set('company', text)}
          error={errors.company}
          placeholder="e.g. Quixta"
        />
        <Field
          label="Role"
          value={draft.role}
          onChangeText={(text) => set('role', text)}
          error={errors.role}
          placeholder="e.g. React Native Developer"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((status) => {
            const selected = draft.status === status;
            return (
              <Pressable
                key={status}
                onPress={() => set('status', status)}
                accessibilityRole="radio"
                accessibilityLabel={`Status ${status}`}
                accessibilityState={{ checked: selected }}
                style={[
                  styles.statusChip,
                  selected && { backgroundColor: statusColors[status].bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    selected && { color: statusColors[status].text, fontWeight: '700' },
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Applied on (YYYY-MM-DD)"
          value={draft.appliedOn}
          onChangeText={(text) => set('appliedOn', text)}
          error={errors.appliedOn}
          keyboardType="numbers-and-punctuation"
        />
        <Field
          label="Follow up on (optional, YYYY-MM-DD)"
          value={draft.followUpOn ?? ''}
          onChangeText={(text) => set('followUpOn', text)}
          error={errors.followUpOn}
          keyboardType="numbers-and-punctuation"
        />
        <Field
          label="Job link (optional)"
          value={draft.link ?? ''}
          onChangeText={(text) => set('link', text)}
          error={errors.link}
          placeholder="https://"
          keyboardType="url"
        />
        <Field
          label="Notes (optional)"
          value={draft.notes ?? ''}
          onChangeText={(text) => set('notes', text)}
          placeholder="Recruiter name, salary discussed, next steps..."
          multiline
        />

        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            style={[styles.button, styles.secondary]}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            style={[styles.button, styles.primary]}
          >
            <Text style={styles.primaryText}>Save</Text>
          </Pressable>
        </View>

        {onDelete ? (
          <Pressable onPress={handleDelete} accessibilityRole="button" style={styles.deleteButton}>
            <Text style={styles.deleteText}>
              {confirmDelete ? 'Tap again to delete' : 'Delete application'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statusChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: { color: colors.text, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  deleteButton: { marginTop: 20, alignItems: 'center', paddingVertical: 10 },
  deleteText: { color: colors.danger, fontWeight: '600' },
});
