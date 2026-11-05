import {
  type Application,
  type ApplicationDraft,
  STATUSES,
  type Stats,
  type Status,
  type StatusFilterValue,
} from '../types';

// ---------- State ----------

export type Action =
  | { type: 'load'; applications: Application[] }
  | { type: 'add'; application: Application }
  | { type: 'update'; id: string; changes: Partial<ApplicationDraft>; updatedAt: string }
  | { type: 'remove'; id: string };

export function applicationsReducer(state: Application[], action: Action): Application[] {
  switch (action.type) {
    case 'load':
      return action.applications;
    case 'add':
      return [action.application, ...state];
    case 'update':
      return state.map((app) =>
        app.id === action.id ? { ...app, ...action.changes, updatedAt: action.updatedAt } : app,
      );
    case 'remove':
      return state.filter((app) => app.id !== action.id);
    default:
      return state;
  }
}

// ---------- Dates ----------

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date in YYYY-MM-DD format (rejects 2026-02-30). */
export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Today's date in the device's local time zone, as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------- Validation ----------

export type DraftErrors = Partial<
  Record<'company' | 'role' | 'appliedOn' | 'followUpOn' | 'link', string>
>;

export function validateDraft(draft: ApplicationDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!draft.company.trim()) errors.company = 'Company is required';
  if (!draft.role.trim()) errors.role = 'Role is required';

  if (!isValidDate(draft.appliedOn)) {
    errors.appliedOn = 'Use a valid date (YYYY-MM-DD)';
  }

  if (draft.followUpOn) {
    if (!isValidDate(draft.followUpOn)) {
      errors.followUpOn = 'Use a valid date (YYYY-MM-DD)';
    } else if (isValidDate(draft.appliedOn) && draft.followUpOn < draft.appliedOn) {
      errors.followUpOn = 'Follow-up cannot be before the applied date';
    }
  }

  if (draft.link && !/^https?:\/\/\S+$/i.test(draft.link)) {
    errors.link = 'Link must start with http:// or https://';
  }

  return errors;
}

/** Trims text fields and drops empty optional fields. */
export function cleanDraft(draft: ApplicationDraft): ApplicationDraft {
  const cleaned: ApplicationDraft = {
    company: draft.company.trim(),
    role: draft.role.trim(),
    status: draft.status,
    appliedOn: draft.appliedOn.trim(),
  };
  const followUpOn = draft.followUpOn?.trim();
  const link = draft.link?.trim();
  const notes = draft.notes?.trim();
  if (followUpOn) cleaned.followUpOn = followUpOn;
  if (link) cleaned.link = link;
  if (notes) cleaned.notes = notes;
  return cleaned;
}

// ---------- Derived data ----------

const OPEN_STATUSES: Status[] = ['Applied', 'Interview'];

/** A follow-up is due when the date has arrived and the application is still open. */
export function isFollowUpDue(app: Application, today: string): boolean {
  return Boolean(app.followUpOn) && OPEN_STATUSES.includes(app.status) && app.followUpOn! <= today;
}

export interface FilterOptions {
  query: string;
  status: StatusFilterValue;
  today: string;
}

/**
 * Filters by status and search text (company or role), then sorts:
 * due follow-ups first, then the most recently applied.
 */
export function filterApplications(
  apps: Application[],
  { query, status, today }: FilterOptions,
): Application[] {
  const q = query.trim().toLowerCase();
  return apps
    .filter((app) => status === 'All' || app.status === status)
    .filter(
      (app) =>
        !q || app.company.toLowerCase().includes(q) || app.role.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      const dueDiff = Number(isFollowUpDue(b, today)) - Number(isFollowUpDue(a, today));
      if (dueDiff !== 0) return dueDiff;
      return b.appliedOn.localeCompare(a.appliedOn);
    });
}

export function getStats(apps: Application[]): Stats {
  const count = (status: Status) => apps.filter((app) => app.status === status).length;
  const total = apps.length;
  const interviews = count('Interview');
  const offers = count('Offer');
  const rejected = count('Rejected');
  const responded = interviews + offers + rejected;
  return {
    total,
    interviews,
    offers,
    rejected,
    responseRate: total === 0 ? 0 : Math.round((responded / total) * 100),
  };
}

export function countByStatus(apps: Application[]): Record<StatusFilterValue, number> {
  const counts = { All: apps.length } as Record<StatusFilterValue, number>;
  for (const status of STATUSES) {
    counts[status] = apps.filter((app) => app.status === status).length;
  }
  return counts;
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
