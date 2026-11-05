import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  STORAGE_KEY,
  loadApplications,
  saveApplications,
} from '../src/storage/applicationsStorage';
import { Application } from '../src/types';

const app: Application = {
  id: '1',
  company: 'Quixta',
  role: 'React Native Developer',
  status: 'Interview',
  appliedOn: '2026-11-05',
  updatedAt: '2026-11-05T10:00:00.000Z',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('returns an empty list when nothing is saved', async () => {
  expect(await loadApplications()).toEqual([]);
});

it('saves and loads applications', async () => {
  await saveApplications([app]);
  expect(await loadApplications()).toEqual([app]);
});

it('recovers from corrupted JSON instead of crashing', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, '{not json');
  expect(await loadApplications()).toEqual([]);
});

it('drops entries that are not valid applications', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([app, { id: 2 }, { ...app, id: '3', status: 'Ghosted' }]),
  );
  expect(await loadApplications()).toEqual([app]);
});
