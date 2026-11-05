import {
  applicationsReducer,
  cleanDraft,
  countByStatus,
  filterApplications,
  getStats,
  isFollowUpDue,
  isValidDate,
  validateDraft,
} from '../src/logic/applications';
import type { Application, ApplicationDraft } from '../src/types';

const TODAY = '2026-11-06';

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    company: 'Quixta',
    role: 'React Native Developer',
    status: 'Applied',
    appliedOn: '2026-11-01',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

const validDraft: ApplicationDraft = {
  company: 'Quixta',
  role: 'Junior React Native Developer',
  status: 'Applied',
  appliedOn: '2026-11-06',
};

describe('isValidDate', () => {
  it('accepts real dates', () => {
    expect(isValidDate('2026-11-06')).toBe(true);
    expect(isValidDate('2024-02-29')).toBe(true); // leap year
  });

  it('rejects wrong formats and impossible dates', () => {
    expect(isValidDate('06-11-2026')).toBe(false);
    expect(isValidDate('2026-2-3')).toBe(false);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2025-02-29')).toBe(false); // not a leap year
    expect(isValidDate('')).toBe(false);
  });
});

describe('validateDraft', () => {
  it('returns no errors for a valid draft', () => {
    expect(validateDraft(validDraft)).toEqual({});
  });

  it('requires company and role (whitespace does not count)', () => {
    const errors = validateDraft({ ...validDraft, company: '   ', role: '' });
    expect(errors.company).toBe('Company is required');
    expect(errors.role).toBe('Role is required');
  });

  it('rejects an invalid applied date', () => {
    expect(validateDraft({ ...validDraft, appliedOn: '2026-13-01' }).appliedOn).toBeDefined();
  });

  it('rejects a follow-up date before the applied date', () => {
    const errors = validateDraft({ ...validDraft, followUpOn: '2026-11-01' });
    expect(errors.followUpOn).toBe('Follow-up cannot be before the applied date');
  });

  it('rejects links without http(s)', () => {
    expect(validateDraft({ ...validDraft, link: 'cutshort.io/job' }).link).toBeDefined();
    expect(validateDraft({ ...validDraft, link: 'https://cutshort.io/job' }).link).toBeUndefined();
  });
});

describe('cleanDraft', () => {
  it('trims text and drops empty optional fields', () => {
    const cleaned = cleanDraft({
      ...validDraft,
      company: '  Quixta  ',
      followUpOn: '',
      link: '   ',
      notes: ' Spoke to Anand ',
    });
    expect(cleaned).toEqual({
      company: 'Quixta',
      role: 'Junior React Native Developer',
      status: 'Applied',
      appliedOn: '2026-11-06',
      notes: 'Spoke to Anand',
    });
  });
});

describe('applicationsReducer', () => {
  it('adds new applications to the top', () => {
    const first = makeApp({ id: 'a' });
    const second = makeApp({ id: 'b' });
    const state = applicationsReducer([first], { type: 'add', application: second });
    expect(state.map((app) => app.id)).toEqual(['b', 'a']);
  });

  it('updates only the matching application and its timestamp', () => {
    const state = [makeApp({ id: 'a' }), makeApp({ id: 'b' })];
    const next = applicationsReducer(state, {
      type: 'update',
      id: 'b',
      changes: { status: 'Interview' },
      updatedAt: '2026-11-06T09:00:00.000Z',
    });
    expect(next[0]).toBe(state[0]); // untouched item keeps its reference
    expect(next[1].status).toBe('Interview');
    expect(next[1].updatedAt).toBe('2026-11-06T09:00:00.000Z');
  });

  it('removes an application', () => {
    const state = [makeApp({ id: 'a' }), makeApp({ id: 'b' })];
    expect(applicationsReducer(state, { type: 'remove', id: 'a' }).map((a) => a.id)).toEqual([
      'b',
    ]);
  });

  it('replaces state on load', () => {
    const loaded = [makeApp({ id: 'x' })];
    expect(applicationsReducer([makeApp()], { type: 'load', applications: loaded })).toBe(loaded);
  });
});

describe('isFollowUpDue', () => {
  it('is due on or after the follow-up date for open applications', () => {
    expect(isFollowUpDue(makeApp({ followUpOn: '2026-11-06' }), TODAY)).toBe(true);
    expect(isFollowUpDue(makeApp({ followUpOn: '2026-11-02', status: 'Interview' }), TODAY)).toBe(
      true,
    );
  });

  it('is not due in the future, without a date, or once closed', () => {
    expect(isFollowUpDue(makeApp({ followUpOn: '2026-11-07' }), TODAY)).toBe(false);
    expect(isFollowUpDue(makeApp(), TODAY)).toBe(false);
    expect(isFollowUpDue(makeApp({ followUpOn: '2026-11-01', status: 'Offer' }), TODAY)).toBe(
      false,
    );
    expect(isFollowUpDue(makeApp({ followUpOn: '2026-11-01', status: 'Rejected' }), TODAY)).toBe(
      false,
    );
  });
});

describe('filterApplications', () => {
  const apps = [
    makeApp({ id: 'old', company: 'JLL', role: 'Software Engineer I', appliedOn: '2026-10-20' }),
    makeApp({ id: 'new', company: 'Quixta', role: 'React Native Dev', appliedOn: '2026-11-05' }),
    makeApp({
      id: 'due',
      company: 'Amber',
      role: 'AI Engineering Intern',
      status: 'Interview',
      appliedOn: '2026-10-01',
      followUpOn: '2026-11-03',
    }),
  ];

  it('puts due follow-ups first, then newest applications', () => {
    const result = filterApplications(apps, { query: '', status: 'All', today: TODAY });
    expect(result.map((a) => a.id)).toEqual(['due', 'new', 'old']);
  });

  it('searches company and role, ignoring case and spaces', () => {
    expect(
      filterApplications(apps, { query: '  quix ', status: 'All', today: TODAY }).map((a) => a.id),
    ).toEqual(['new']);
    expect(
      filterApplications(apps, { query: 'engineer', status: 'All', today: TODAY }).map((a) => a.id),
    ).toEqual(['due', 'old']);
  });

  it('filters by status', () => {
    expect(
      filterApplications(apps, { query: '', status: 'Interview', today: TODAY }).map((a) => a.id),
    ).toEqual(['due']);
  });

  it('does not mutate the original array', () => {
    const copy = [...apps];
    filterApplications(apps, { query: '', status: 'All', today: TODAY });
    expect(apps).toEqual(copy);
  });
});

describe('getStats and countByStatus', () => {
  it('returns zeros for no applications', () => {
    expect(getStats([])).toEqual({
      total: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
      responseRate: 0,
    });
  });

  it('counts statuses and rounds the response rate', () => {
    const apps = [
      makeApp({ status: 'Applied' }),
      makeApp({ status: 'Interview' }),
      makeApp({ status: 'Rejected' }),
    ];
    expect(getStats(apps)).toEqual({
      total: 3,
      interviews: 1,
      offers: 0,
      rejected: 1,
      responseRate: 67,
    });
    expect(countByStatus(apps)).toEqual({
      All: 3,
      Applied: 1,
      Interview: 1,
      Offer: 0,
      Rejected: 1,
    });
  });
});
