import { Status } from './types';

export const colors = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#1C1E26',
  muted: '#6B7080',
  border: '#E1E3EB',
  primary: '#3D5AFE',
  primaryText: '#FFFFFF',
  danger: '#D32F2F',
  warning: '#B26A00',
  warningBg: '#FFF3E0',
};

export const statusColors: Record<Status, { bg: string; text: string }> = {
  Applied: { bg: '#E8EAF6', text: '#303F9F' },
  Interview: { bg: '#E0F2F1', text: '#00796B' },
  Offer: { bg: '#E8F5E9', text: '#2E7D32' },
  Rejected: { bg: '#FBE9E7', text: '#BF360C' },
};
