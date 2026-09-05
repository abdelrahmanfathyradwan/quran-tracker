'use client';

import { useState, useCallback, useEffect } from 'react';
import { planRepository } from '../repositories/plan-repository';
import { Plan, PlanFormData } from '../types/plan';
import { Session } from '../types/session';

export function usePlans(studentId?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (studentId) {
        setPlans(await planRepository.getPlansByStudent(studentId));
      } else {
        setPlans(await planRepository.getAll());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPlan = useCallback(
    async (data: PlanFormData): Promise<{ plan: Plan; sessions: Session[] }> => {
      const result = await planRepository.createPlan(data);
      await refresh();
      return result;
    },
    [refresh]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      await planRepository.deletePlanWithSessions(planId);
      await refresh();
    },
    [refresh]
  );

  const getActivePlan = useCallback(
    async (sid: string) => {
      return await planRepository.getActivePlan(sid);
    },
    []
  );

  return {
    plans,
    loading,
    createPlan,
    deletePlan,
    getActivePlan,
    refresh,
  };
}

