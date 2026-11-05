export const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'] as const;

export type Status = (typeof STATUSES)[number];

export type StatusFilterValue = Status | 'All';

export interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  /** ISO date, YYYY-MM-DD */
  appliedOn: string;
  /** ISO date, YYYY-MM-DD */
  followUpOn?: string;
  link?: string;
  notes?: string;
  /** ISO timestamp of the last change */
  updatedAt: string;
}

/** The fields a user can enter or edit in the form. */
export type ApplicationDraft = Omit<Application, 'id' | 'updatedAt'>;

export interface Stats {
  total: number;
  interviews: number;
  offers: number;
  rejected: number;
  /** Percentage of applications that got any response (interview, offer or rejection). */
  responseRate: number;
}
