import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Stats } from '../types';

function Stat({ label, value, testID }: { label: string; value: string; testID: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.value} testID={testID}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export const StatsBar = React.memo(function StatsBar({ stats }: { stats: Stats }) {
  return (
    <View style={styles.row}>
      <Stat label="Applied" value={String(stats.total)} testID="stat-total" />
      <Stat label="Interviews" value={String(stats.interviews)} testID="stat-interviews" />
      <Stat label="Offers" value={String(stats.offers)} testID="stat-offers" />
      <Stat label="Response" value={`${stats.responseRate}%`} testID="stat-response" />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '700', color: colors.text },
  label: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
