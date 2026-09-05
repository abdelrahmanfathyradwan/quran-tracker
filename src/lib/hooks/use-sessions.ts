'use client';

import { useState, useCallback, useEffect } from 'react';
import { sessionRepository } from '../repositories/session-repository';
import { Session, SessionFormData } from '../types/session';

export function useSessions(planId?: string, studentId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (planId) {
        setSessions(await sessionRepository.getByPlan(planId));
      } else if (studentId) {
        setSessions(await sessionRepository.getByStudent(studentId));
      } else {
        setSessions(await sessionRepository.getAll());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [planId, studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeSession = useCallback(
    async (id: string, data: SessionFormData) => {
      const session = await sessionRepository.completeSession(id, data);
      await refresh();
      return session;
    },
    [refresh]
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<Session>) => {
      const session = await sessionRepository.update(id, updates);
      await refresh();
      return session;
    },
    [refresh]
  );

  const getTodaySessions = useCallback(async () => {
    return await sessionRepository.getTodaySessions();
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

