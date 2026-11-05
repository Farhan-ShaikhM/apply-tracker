import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { applicationsReducer, cleanDraft, createId, todayISO } from '../logic/applications';
import { loadApplications, saveApplications } from '../storage/applicationsStorage';
import { Application, ApplicationDraft } from '../types';

interface ApplicationsContextValue {
  applications: Application[];
  loaded: boolean;
  today: string;
  addApplication: (draft: ApplicationDraft) => void;
  updateApplication: (id: string, draft: ApplicationDraft) => void;
  removeApplication: (id: string) => void;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  /** Lets tests fix "today" so follow-up reminders are predictable. */
  today?: string;
}

export function ApplicationsProvider({ children, today = todayISO() }: ProviderProps) {
  const [applications, dispatch] = useReducer(applicationsReducer, []);
  const [loaded, setLoaded] = useState(false);

  // Load saved data once on start.
  useEffect(() => {
    let active = true;
    loadApplications().then((saved) => {
      if (!active) return;
      dispatch({ type: 'load', applications: saved });
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Save after every change, but never overwrite saved data before it has loaded.
  useEffect(() => {
    if (loaded) {
      saveApplications(applications).catch(() => undefined);
    }
  }, [applications, loaded]);

  const addApplication = useCallback((draft: ApplicationDraft) => {
    dispatch({
      type: 'add',
      application: { ...cleanDraft(draft), id: createId(), updatedAt: new Date().toISOString() },
    });
  }, []);

  const updateApplication = useCallback((id: string, draft: ApplicationDraft) => {
    const cleaned = cleanDraft(draft);
    dispatch({
      type: 'update',
      id,
      // Explicitly clear optional fields the user emptied.
      changes: {
        ...cleaned,
        followUpOn: cleaned.followUpOn,
        link: cleaned.link,
        notes: cleaned.notes,
      },
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const removeApplication = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const value = useMemo(
    () => ({ applications, loaded, today, addApplication, updateApplication, removeApplication }),
    [applications, loaded, today, addApplication, updateApplication, removeApplication],
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsContextValue {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used inside ApplicationsProvider');
  }
  return context;
}
