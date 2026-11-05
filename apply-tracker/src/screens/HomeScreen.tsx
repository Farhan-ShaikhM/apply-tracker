import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApplicationCard } from '../components/ApplicationCard';
import { ApplicationForm } from '../components/ApplicationForm';
import { EmptyState } from '../components/EmptyState';
import { StatsBar } from '../components/StatsBar';
import { StatusFilter } from '../components/StatusFilter';
import { useApplications } from '../context/ApplicationsContext';
import {
  countByStatus,
  filterApplications,
  getStats,
  isFollowUpDue,
} from '../logic/applications';
import { colors } from '../theme';
import { Application, ApplicationDraft, StatusFilterValue } from '../types';

type Editor = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; application: Application };

function toDraft({ id, updatedAt, ...draft }: Application): ApplicationDraft {
  return draft;
}

export function HomeScreen() {
  const { applications, loaded, today, addApplication, updateApplication, removeApplication } =
    useApplications();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilterValue>('All');
  const [editor, setEditor] = useState<Editor>({ mode: 'closed' });

  // Derived data is memoised so typing in search doesn't recompute stats.
  const stats = useMemo(() => getStats(applications), [applications]);
  const counts = useMemo(() => countByStatus(applications), [applications]);
  const visible = useMemo(
    () => filterApplications(applications, { query, status, today }),
    [applications, query, status, today],
  );
  const dueCount = useMemo(
    () => applications.filter((app) => isFollowUpDue(app, today)).length,
    [applications, today],
  );

  const openEditor = useCallback(
    (application: Application) => setEditor({ mode: 'edit', application }),
    [],
  );
  const closeEditor = () => setEditor({ mode: 'closed' });

  const handleSubmit = (draft: ApplicationDraft) => {
    if (editor.mode === 'edit') updateApplication(editor.application.id, draft);
    else addApplication(draft);
    closeEditor();
  };

  const handleDelete = () => {
    if (editor.mode === 'edit') removeApplication(editor.application.id);
    closeEditor();
  };

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator testID="loading" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const filtered = query.trim() !== '' || status !== 'All';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Apply Tracker
        </Text>
        {dueCount > 0 ? (
          <Text style={styles.dueSummary}>
            {dueCount} follow-up{dueCount === 1 ? '' : 's'} due
          </Text>
        ) : null}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            followUpDue={isFollowUpDue(item, today)}
            onPress={openEditor}
          />
        )}
        ListHeaderComponent={
          <>
            <StatsBar stats={stats} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search company or role"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Search applications"
              style={styles.search}
              autoCorrect={false}
            />
            <StatusFilter value={status} counts={counts} onChange={setStatus} />
          </>
        }
        ListEmptyComponent={<EmptyState filtered={filtered} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        onPress={() => setEditor({ mode: 'new' })}
        accessibilityRole="button"
        accessibilityLabel="Add application"
        style={styles.fab}
      >
        <Text style={styles.fabText}>+ Add application</Text>
      </Pressable>

      <Modal
        visible={editor.mode !== 'closed'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditor}
      >
        {editor.mode !== 'closed' ? (
          <ApplicationForm
            key={editor.mode === 'edit' ? editor.application.id : 'new'}
            initial={editor.mode === 'edit' ? toDraft(editor.application) : undefined}
            today={today}
            onSubmit={handleSubmit}
            onCancel={closeEditor}
            onDelete={editor.mode === 'edit' ? handleDelete : undefined}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  dueSummary: { color: colors.warning, fontWeight: '600', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
});
