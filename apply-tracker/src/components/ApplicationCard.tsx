import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Application } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  application: Application;
  followUpDue: boolean;
  onPress: (application: Application) => void;
}

// Memoised so editing one card doesn't re-render the whole list.
export const ApplicationCard = React.memo(function ApplicationCard({
  application,
  followUpDue,
  onPress,
}: Props) {
  const { company, role, status, appliedOn, followUpOn } = application;
  return (
    <Pressable
      onPress={() => onPress(application)}
      accessibilityRole="button"
      accessibilityLabel={`${company}, ${role}, ${status}`}
      accessibilityHint="Opens the application to edit"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.company} numberOfLines={1}>
            {company}
          </Text>
          <Text style={styles.role} numberOfLines={1}>
            {role}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.meta}>Applied {appliedOn}</Text>
      {followUpDue ? (
        <View style={styles.dueBanner}>
          <Text style={styles.dueText}>Follow-up due ({followUpOn})</Text>
        </View>
      ) : followUpOn ? (
        <Text style={styles.meta}>Follow up on {followUpOn}</Text>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleBlock: { flex: 1 },
  company: { fontSize: 16, fontWeight: '700', color: colors.text },
  role: { fontSize: 14, color: colors.text, marginTop: 2 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 8 },
  dueBanner: {
    marginTop: 8,
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dueText: { color: colors.warning, fontSize: 12, fontWeight: '600' },
});
