import AsyncStorage from '@react-native-async-storage/async-storage';

import { Application, STATUSES } from '../types';

export const STORAGE_KEY = 'apply-tracker:applications:v1';

function isApplication(value: unknown): value is Application {
  if (typeof value !== 'object' || value === null) return false;
  const app = value as Record<string, unknown>;
  return (
    typeof app.id === 'string' &&
    typeof app.company === 'string' &&
    typeof app.role === 'string' &&
    typeof app.appliedOn === 'string' &&
    typeof app.updatedAt === 'string' &&
    (STATUSES as readonly unknown[]).includes(app.status)
  );
}

/** Loads saved applications. Corrupted or invalid data never crashes the app. */
export async function loadApplications(): Promise<Application[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isApplication) : [];
  } catch {
    return [];
  }
}

export async function saveApplications(applications: Application[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}
