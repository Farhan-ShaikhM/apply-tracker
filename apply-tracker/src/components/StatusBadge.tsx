import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { statusColors } from '../theme';
import { Status } from '../types';

export function StatusBadge({ status }: { status: Status }) {
  const { bg, text } = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});
