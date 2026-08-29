'use client';

import { useState, useCallback, useEffect } from 'react';
import { planRepository } from '../repositories/plan-repository';
import { Plan, PlanFormData } from '../types/plan';
import { Session } from '../types/session';

export function usePlans(studentId?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (studentId) {
      setPlans(planRepository.getPlansByStudent(studentId));
    } else {
      setPlans(planRepository.getAll());
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPlan = useCallback(
    (data: PlanFormData): { plan: Plan; sessions: Session[] } => {
      const result = planRepository.createPlan(data);
      refresh();
      return result;
    },
    [refresh]
  );

  const deletePlan = useCallback(
    (planId: string) => {
      planRepository.deletePlanWithSessions(planId);
      refresh();
    },
    [refresh]
  );

  const getActivePlan = useCallback(
    (sid: string) => {
      return planRepository.getActivePlan(sid);
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
