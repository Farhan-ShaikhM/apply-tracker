import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ApplicationForm } from '../src/components/ApplicationForm';
import { ApplicationDraft } from '../src/types';

const TODAY = '2026-11-06';

function setup(props: Partial<React.ComponentProps<typeof ApplicationForm>> = {}) {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const onDelete = jest.fn();
  render(
    <ApplicationForm
      today={TODAY}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDelete={props.initial ? onDelete : undefined}
      {...props}
    />,
  );
  return { onSubmit, onCancel, onDelete };
}

it('pre-fills the applied date with today', () => {
  setup();
  expect(screen.getByLabelText('Applied on (YYYY-MM-DD)').props.value).toBe(TODAY);
  expect(screen.getByText('New application')).toBeOnTheScreen();
});

it('shows validation errors and does not submit an empty form', () => {
  const { onSubmit } = setup();

  fireEvent.press(screen.getByText('Save'));

  expect(screen.getByText('Company is required')).toBeOnTheScreen();
  expect(screen.getByText('Role is required')).toBeOnTheScreen();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('rejects a follow-up date earlier than the applied date', () => {
  const { onSubmit } = setup();

  fireEvent.changeText(screen.getByLabelText('Company'), 'Quixta');
  fireEvent.changeText(screen.getByLabelText('Role'), 'React Native Developer');
  fireEvent.changeText(screen.getByLabelText('Follow up on (optional, YYYY-MM-DD)'), '2026-11-01');
  fireEvent.press(screen.getByText('Save'));

  expect(screen.getByText('Follow-up cannot be before the applied date')).toBeOnTheScreen();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('submits the entered values with the chosen status', () => {
  const { onSubmit } = setup();

  fireEvent.changeText(screen.getByLabelText('Company'), 'Quixta');
  fireEvent.changeText(screen.getByLabelText('Role'), 'Junior React Native Developer');
  fireEvent.press(screen.getByLabelText('Status Interview'));
  fireEvent.changeText(screen.getByLabelText('Follow up on (optional, YYYY-MM-DD)'), '2026-11-10');
  fireEvent.press(screen.getByText('Save'));

  expect(onSubmit).toHaveBeenCalledWith({
    company: 'Quixta',
    role: 'Junior React Native Developer',
    status: 'Interview',
    appliedOn: TODAY,
    followUpOn: '2026-11-10',
  });
  expect(screen.queryByText('Company is required')).toBeNull();
});

it('calls onCancel', () => {
  const { onCancel } = setup();
  fireEvent.press(screen.getByText('Cancel'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

describe('editing', () => {
  const initial: ApplicationDraft = {
    company: 'JLL',
    role: 'Software Engineer I',
    status: 'Applied',
    appliedOn: '2026-11-03',
  };

  it('shows existing values', () => {
    setup({ initial });
    expect(screen.getByText('Edit application')).toBeOnTheScreen();
    expect(screen.getByLabelText('Company').props.value).toBe('JLL');
    expect(screen.getByLabelText('Status Applied')).toBeChecked();
  });

  it('needs two taps to delete', () => {
    const { onDelete } = setup({ initial });

    fireEvent.press(screen.getByText('Delete application'));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Tap again to delete')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Tap again to delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
