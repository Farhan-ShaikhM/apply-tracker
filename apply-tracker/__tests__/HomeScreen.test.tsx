import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import React from 'react';

import { ApplicationsProvider } from '../src/context/ApplicationsContext';
import { HomeScreen } from '../src/screens/HomeScreen';
import { STORAGE_KEY } from '../src/storage/applicationsStorage';
import { Application } from '../src/types';

const TODAY = '2026-11-06';

function savedApp(overrides: Partial<Application>): Application {
  return {
    id: Math.random().toString(36).slice(2),
    company: 'Company',
    role: 'Role',
    status: 'Applied',
    appliedOn: '2026-11-01',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

async function renderApp(saved: Application[] = []) {
  if (saved.length) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  render(
    <ApplicationsProvider today={TODAY}>
      <HomeScreen />
    </ApplicationsProvider>,
  );
  // Wait for saved data to load.
  await screen.findByText('Apply Tracker');
}

async function addApplication(company: string, role: string) {
  fireEvent.press(screen.getByLabelText('Add application'));
  fireEvent.changeText(await screen.findByLabelText('Company'), company);
  fireEvent.changeText(screen.getByLabelText('Role'), role);
  fireEvent.press(screen.getByText('Save'));
  await screen.findByText(company);
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('shows the empty state when there are no applications', async () => {
  await renderApp();
  expect(screen.getByText('No applications yet')).toBeOnTheScreen();
  expect(screen.getByTestId('stat-total')).toHaveTextContent('0');
});

it('adds an application, updates stats and saves it', async () => {
  await renderApp();

  await addApplication('Quixta', 'Junior React Native Developer');

  expect(screen.getByText('Junior React Native Developer')).toBeOnTheScreen();
  expect(screen.getByTestId('stat-total')).toHaveTextContent('1');
  expect(screen.queryByText('No applications yet')).toBeNull();

  await waitFor(async () => {
    const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ company: 'Quixta', status: 'Applied', appliedOn: TODAY });
  });
});

it('loads saved applications on start', async () => {
  await renderApp([savedApp({ company: 'JLL', role: 'Software Engineer I' })]);
  expect(screen.getByText('JLL')).toBeOnTheScreen();
  expect(screen.getByTestId('stat-total')).toHaveTextContent('1');
});

it('filters by search text and status', async () => {
  await renderApp([
    savedApp({ company: 'Quixta', role: 'React Native Developer', status: 'Interview' }),
    savedApp({ company: 'JLL', role: 'Software Engineer I' }),
  ]);

  fireEvent.changeText(screen.getByLabelText('Search applications'), 'quix');
  expect(screen.getByText('Quixta')).toBeOnTheScreen();
  expect(screen.queryByText('JLL')).toBeNull();

  fireEvent.changeText(screen.getByLabelText('Search applications'), '');
  fireEvent.press(screen.getByLabelText('Show Applied'));
  expect(screen.getByText('JLL')).toBeOnTheScreen();
  expect(screen.queryByText('Quixta')).toBeNull();

  fireEvent.press(screen.getByLabelText('Show Offer'));
  expect(screen.getByText('No matching applications')).toBeOnTheScreen();
});

it('edits the status and updates the stats', async () => {
  await renderApp([savedApp({ company: 'Quixta', role: 'React Native Developer' })]);
  expect(screen.getByTestId('stat-interviews')).toHaveTextContent('0');

  fireEvent.press(screen.getByLabelText('Quixta, React Native Developer, Applied'));
  fireEvent.press(await screen.findByLabelText('Status Interview'));
  fireEvent.press(screen.getByText('Save'));

  expect(
    await screen.findByLabelText('Quixta, React Native Developer, Interview'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId('stat-interviews')).toHaveTextContent('1');
  expect(screen.getByTestId('stat-response')).toHaveTextContent('100%');
});

it('highlights follow-ups that are due', async () => {
  await renderApp([
    savedApp({ company: 'Amber', role: 'AI Intern', followUpOn: '2026-11-04' }),
    savedApp({ company: 'JLL', role: 'SE I', followUpOn: '2026-11-20' }),
  ]);

  expect(screen.getByText('1 follow-up due')).toBeOnTheScreen();
  const amberCard = screen.getByLabelText('Amber, AI Intern, Applied');
  expect(within(amberCard).getByText('Follow-up due (2026-11-04)')).toBeOnTheScreen();
  expect(screen.getByText('Follow up on 2026-11-20')).toBeOnTheScreen();
});

it('deletes an application after confirmation', async () => {
  await renderApp([savedApp({ company: 'Hidani', role: 'Intern' })]);

  fireEvent.press(screen.getByLabelText('Hidani, Intern, Applied'));
  fireEvent.press(await screen.findByText('Delete application'));
  fireEvent.press(screen.getByText('Tap again to delete'));

  await waitFor(() => expect(screen.queryByText('Hidani')).toBeNull());
  expect(screen.getByText('No applications yet')).toBeOnTheScreen();
});
