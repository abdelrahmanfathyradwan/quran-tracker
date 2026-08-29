'use client';

import { useState, useCallback, useEffect } from 'react';
import { sessionRepository } from '../repositories/session-repository';
import { Session, SessionFormData } from '../types/session';

export function useSessions(planId?: string, studentId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (planId) {
      setSessions(sessionRepository.getByPlan(planId));
    } else if (studentId) {
      setSessions(sessionRepository.getByStudent(studentId));
    } else {
      setSessions(sessionRepository.getAll());
    }
    setLoading(false);
  }, [planId, studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeSession = useCallback(
    (id: string, data: SessionFormData) => {
      const session = sessionRepository.completeSession(id, data);
      refresh();
      return session;
    },
    [refresh]
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<Session>) => {
      const session = sessionRepository.update(id, updates);
      refresh();
      return session;
    },
    [refresh]
  );

  const getTodaySessions = useCallback(() => {
    return sessionRepository.getTodaySessions();
  }, []);

  return {
    sessions,
    loading,
    completeSession,
    updateSession,
    getTodaySessions,
    refresh,
  };
}
