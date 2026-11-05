import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {filtered ? 'No matching applications' : 'No applications yet'}
      </Text>
      <Text style={styles.body}>
        {filtered
          ? 'Try a different search or status.'
          : 'Tap "Add application" to start tracking your job hunt.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.muted, marginTop: 6, textAlign: 'center' },
});
