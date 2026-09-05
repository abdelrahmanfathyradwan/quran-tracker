/**
 * Quran Tracker — End-to-End API Integration Tests
 * =================================================
 * Tests all API endpoints after migrating from localStorage to MongoDB.
 *
 * Prerequisites:
 *   1. Dev server running: `npm run dev`
 *   2. Run: `npx tsx tests/api-integration.test.ts`
 *
 * The tests use a "test_" prefix for all IDs so they can be cleaned up
 * without affecting real data.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api';
const TEST_PREFIX = 'test_' + Date.now() + '_';

// ─── Helpers ───────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function testId(suffix: string): string {
  return TEST_PREFIX + suffix;
}

async function api<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  let data: T;
  try {
    data = await res.json() as T;
  } catch {
    data = null as T;
  }
  return { status: res.status, data };
}

function assert(condition: boolean, message: string, details?: string): void {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    const line = `  ❌ ${message}${details ? ' — ' + details : ''}`;
    console.log(line);
    failures.push(line);
  }
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, message, match ? undefined : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function section(title: string): void {
  console.log(`\n━━━ ${title} ━━━`);
}

// ─── Test Data Factories ───────────────────────────────────────────────

function makeStudent(idSuffix: string) {
  const now = new Date().toISOString();
  return {
    id: testId('student_' + idSuffix),
    name: 'طالب اختبار ' + idSuffix,
    grade: 'grade_5',
    startDate: '2026-09-01',
    currentMemorization: 'جزء واحد',
    currentPosition: 'سورة البقرة — الآية 50',
    notes: 'ملاحظة تجريبية',
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
  };
}

function makePlan(idSuffix: string, studentId: string) {
  const now = new Date().toISOString();
  return {
    id: testId('plan_' + idSuffix),
    studentId,
    name: 'خطة اختبار ' + idSuffix,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    recitationDays: [0, 2, 4],
    totalSessions: 13,
    createdAt: now,
    updatedAt: now,
  };
}

function makeSession(idSuffix: string, planId: string, studentId: string, date: string) {
  const emptyItem = { content: '', status: 'excellent' as const, mistakes: 0, notes: '' };
  return {
    id: testId('session_' + idSuffix),
    planId,
    studentId,
    date,
    sessionNumber: 1,
    newMemorization: { ...emptyItem },
    recentRevision: { ...emptyItem },
    distantRevision: { ...emptyItem },
    completed: false,
  };
}

// ─── Cleanup Helpers ───────────────────────────────────────────────────

async function cleanupTestData(): Promise<void> {
  for (const collection of ['sessions', 'plans', 'students']) {
    const { data: items } = await api<{ id: string }[]>(`/${collection}`);
    if (Array.isArray(items)) {
      const testIds = items.filter((i) => i.id?.startsWith(TEST_PREFIX)).map((i) => i.id);
      if (testIds.length > 0) {
        await api(`/${collection}/delete-many`, {
          method: 'POST',
          body: JSON.stringify({ ids: testIds }),
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════

async function testStudentsCRUD(): Promise<void> {
  section('1. Students — CRUD');

  const student = makeStudent('1');

  // CREATE
  const { status: createStatus, data: created } = await api<typeof student>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
  assertEqual(createStatus, 201, 'POST /students → 201');
  assertEqual(created.id, student.id, 'Created student has correct ID');
  assertEqual(created.name, student.name, 'Created student has correct name');

  // READ ALL
  const { status: allStatus, data: allStudents } = await api<typeof student[]>('/students');
  assertEqual(allStatus, 200, 'GET /students → 200');
  const found = (allStudents as typeof student[]).find((s) => s.id === student.id);
  assert(!!found, 'Created student appears in getAll');

  // READ BY ID
  const { status: getStatus, data: fetched } = await api<typeof student>(`/students/${student.id}`);
  assertEqual(getStatus, 200, 'GET /students/:id → 200');
  assertEqual(fetched.id, student.id, 'Fetched student has correct ID');
  assertEqual(fetched.name, student.name, 'Fetched student has correct name');
  assertEqual(fetched.grade, 'grade_5', 'Fetched student has correct grade');
  assertEqual(fetched.currentMemorization, 'جزء واحد', 'Fetched student has correct memorization');

  // UPDATE
  const { status: updateStatus, data: updated } = await api<typeof student>(
    `/students/${student.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: 'طالب اختبار معدل',
        updatedAt: new Date().toISOString(),
      }),
    }
  );
  assertEqual(updateStatus, 200, 'PUT /students/:id → 200');
  assertEqual(updated.name, 'طالب اختبار معدل', 'Updated student has new name');
  assertEqual(updated.grade, 'grade_5', 'Update preserved non-updated fields');

  // Verify update persisted
  const { data: refetched } = await api<typeof student>(`/students/${student.id}`);
  assertEqual(refetched.name, 'طالب اختبار معدل', 'Updated name persisted on re-fetch');

  // DELETE
  const { status: deleteStatus } = await api(`/students/${student.id}`, {
    method: 'DELETE',
  });
  assertEqual(deleteStatus, 200, 'DELETE /students/:id → 200');

  // Verify deleted
  const { status: afterDelete } = await api(`/students/${student.id}`);
  assertEqual(afterDelete, 404, 'GET deleted student → 404');
}

async function testPlansCRUD(): Promise<void> {
  section('2. Plans — CRUD');

  const student = makeStudent('plan_owner');
  await api('/students', { method: 'POST', body: JSON.stringify(student) });

  const plan = makePlan('1', student.id);

  // CREATE
  const { status: createStatus, data: created } = await api<typeof plan>('/plans', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  assertEqual(createStatus, 201, 'POST /plans → 201');
  assertEqual(created.id, plan.id, 'Created plan has correct ID');
  assertEqual(created.studentId, student.id, 'Created plan linked to student');

  // READ ALL
  const { data: allPlans } = await api<typeof plan[]>('/plans');
  const found = (allPlans as typeof plan[]).find((p) => p.id === plan.id);
  assert(!!found, 'Created plan appears in getAll');

  // READ BY ID
  const { status: getStatus, data: fetched } = await api<typeof plan>(`/plans/${plan.id}`);
  assertEqual(getStatus, 200, 'GET /plans/:id → 200');
  assertEqual(fetched.name, plan.name, 'Fetched plan has correct name');
  assert(Array.isArray(fetched.recitationDays), 'recitationDays is array');
  assertEqual(fetched.recitationDays, [0, 2, 4], 'recitationDays preserved correctly');

  // UPDATE
  const { status: updateStatus, data: updated } = await api<typeof plan>(`/plans/${plan.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: 'خطة معدلة' }),
  });
  assertEqual(updateStatus, 200, 'PUT /plans/:id → 200');
  assertEqual(updated.name, 'خطة معدلة', 'Plan name updated');
  assertEqual(updated.studentId, student.id, 'Update preserved studentId');

  // DELETE
  const { status: deleteStatus } = await api(`/plans/${plan.id}`, { method: 'DELETE' });
  assertEqual(deleteStatus, 200, 'DELETE /plans/:id → 200');

  // Cleanup
  await api(`/students/${student.id}`, { method: 'DELETE' });
}

async function testSessionsCRUD(): Promise<void> {
  section('3. Sessions — CRUD');

  const student = makeStudent('session_owner');
  await api('/students', { method: 'POST', body: JSON.stringify(student) });

  const plan = makePlan('sess_plan', student.id);
  await api('/plans', { method: 'POST', body: JSON.stringify(plan) });

  const session = makeSession('1', plan.id, student.id, '2026-09-04');

  // CREATE
  const { status: createStatus, data: created } = await api<typeof session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
  assertEqual(createStatus, 201, 'POST /sessions → 201');
  assertEqual(created.id, session.id, 'Created session has correct ID');
  assertEqual(created.completed, false, 'Session starts as not completed');

  // READ BY ID
  const { status: getStatus, data: fetched } = await api<typeof session>(`/sessions/${session.id}`);
  assertEqual(getStatus, 200, 'GET /sessions/:id → 200');
  assertEqual(fetched.planId, plan.id, 'Session linked to correct plan');
  assertEqual(fetched.studentId, student.id, 'Session linked to correct student');
  assert(typeof fetched.newMemorization === 'object', 'newMemorization is an object');
  assert(typeof fetched.recentRevision === 'object', 'recentRevision is an object');
  assert(typeof fetched.distantRevision === 'object', 'distantRevision is an object');

  // UPDATE (complete session)
  const { status: updateStatus, data: updated } = await api<typeof session & { overallRating?: string; completedAt?: string }>(
    `/sessions/${session.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString(),
        newMemorization: {
          content: 'سورة البقرة الآيات 50-60',
          amount: 'صفحة',
          status: 'excellent',
          mistakes: 1,
          notes: 'ممتاز',
        },
        overallRating: 'excellent',
      }),
    }
  );
  assertEqual(updateStatus, 200, 'PUT /sessions/:id → 200');
  assertEqual(updated.completed, true, 'Session marked as completed');
  assertEqual(updated.newMemorization?.content, 'سورة البقرة الآيات 50-60', 'Memorization content updated');
  assertEqual(updated.overallRating, 'excellent', 'Overall rating set');

  // DELETE
  const { status: deleteStatus } = await api(`/sessions/${session.id}`, { method: 'DELETE' });
  assertEqual(deleteStatus, 200, 'DELETE /sessions/:id → 200');

  // Cleanup
  await api(`/plans/${plan.id}`, { method: 'DELETE' });
  await api(`/students/${student.id}`, { method: 'DELETE' });
}

async function testSettings(): Promise<void> {
  section('4. Settings — Read/Write/Upsert');

  // READ (should return default or existing)
  const { status: getStatus, data: initial } = await api<Record<string, unknown>>('/settings');
  assertEqual(getStatus, 200, 'GET /settings → 200');

  // WRITE (upsert)
  const newSettings = {
    teacherName: 'الشيخ اختبار',
    centerName: 'مركز اختبار',
    theme: 'light' as const,
  };
  const { status: postStatus } = await api('/settings', {
    method: 'POST',
    body: JSON.stringify(newSettings),
  });
  assertEqual(postStatus, 200, 'POST /settings → 200');

  // Verify write
  const { data: after } = await api<typeof newSettings>('/settings');
  assertEqual(after.teacherName, 'الشيخ اختبار', 'Settings teacherName persisted');
  assertEqual(after.centerName, 'مركز اختبار', 'Settings centerName persisted');
  assertEqual(after.theme, 'light', 'Settings theme persisted');

  // UPDATE (partial overwrite via POST)
  const updatedSettings = { ...after, teacherName: 'الشيخ أحمد' };
  await api('/settings', {
    method: 'POST',
    body: JSON.stringify(updatedSettings),
  });

  const { data: final } = await api<typeof newSettings>('/settings');
  assertEqual(final.teacherName, 'الشيخ أحمد', 'Settings updated correctly');
  assertEqual(final.centerName, 'مركز اختبار', 'Non-updated settings field preserved');

  // Restore original settings if they existed
  if (initial && typeof initial === 'object' && 'teacherName' in initial) {
    await api('/settings', {
      method: 'POST',
      body: JSON.stringify(initial),
    });
    console.log('  ℹ️  Restored original settings');
  }
}

async function testBulkOperations(): Promise<void> {
  section('5. Bulk Operations');

  const students = [makeStudent('bulk_1'), makeStudent('bulk_2'), makeStudent('bulk_3')];

  // First, get existing students to restore later
  const { data: existingStudents } = await api<{ id: string }[]>('/students');

  // Bulk set
  const { status: bulkStatus } = await api('/students', {
    method: 'POST',
    body: JSON.stringify({ _bulk: true, items: students }),
  });
  assertEqual(bulkStatus, 200, 'POST /students (bulk setAll) → 200');

  // Verify bulk set replaced data
  const { data: afterBulk } = await api<{ id: string }[]>('/students');
  assertEqual((afterBulk as { id: string }[]).length, 3, 'Bulk setAll replaced with exactly 3 items');

  const bulkIds = (afterBulk as { id: string }[]).map((s) => s.id);
  assert(bulkIds.includes(students[0].id), 'Bulk item 1 present');
  assert(bulkIds.includes(students[1].id), 'Bulk item 2 present');
  assert(bulkIds.includes(students[2].id), 'Bulk item 3 present');

  // ── deleteMany ──
  const { status: deleteManyStatus } = await api('/students/delete-many', {
    method: 'POST',
    body: JSON.stringify({ ids: [students[0].id, students[1].id] }),
  });
  assertEqual(deleteManyStatus, 200, 'POST /students/delete-many → 200');

  const { data: afterDeleteMany } = await api<{ id: string }[]>('/students');
  assertEqual((afterDeleteMany as { id: string }[]).length, 1, 'deleteMany removed 2 of 3 items');
  assertEqual((afterDeleteMany as { id: string }[])[0].id, students[2].id, 'Correct item survived deleteMany');

  // ── clear ──
  const { status: clearStatus } = await api('/students', { method: 'DELETE' });
  assertEqual(clearStatus, 200, 'DELETE /students (clear) → 200');

  const { data: afterClear } = await api<unknown[]>('/students');
  assertEqual((afterClear as unknown[]).length, 0, 'Clear emptied collection');

  // Restore original students
  if (Array.isArray(existingStudents) && existingStudents.length > 0) {
    await api('/students', {
      method: 'POST',
      body: JSON.stringify({ _bulk: true, items: existingStudents }),
    });
    console.log(`  ℹ️  Restored ${existingStudents.length} original students`);
  }
}

async function testRelationships(): Promise<void> {
  section('6. Relationships — Cascade Operations');

  const student = makeStudent('rel_owner');
  await api('/students', { method: 'POST', body: JSON.stringify(student) });

  const plan = makePlan('rel_plan', student.id);
  await api('/plans', { method: 'POST', body: JSON.stringify(plan) });

  const session1 = makeSession('rel_1', plan.id, student.id, '2026-09-04');
  const session2 = makeSession('rel_2', plan.id, student.id, '2026-09-06');
  const session3 = makeSession('rel_3', plan.id, student.id, '2026-09-08');

  await api('/sessions', { method: 'POST', body: JSON.stringify(session1) });
  await api('/sessions', { method: 'POST', body: JSON.stringify(session2) });
  await api('/sessions', { method: 'POST', body: JSON.stringify(session3) });

  // Verify all created
  const { data: allSessions } = await api<{ id: string; planId: string }[]>('/sessions');
  const planSessions = (allSessions as { id: string; planId: string }[]).filter(
    (s) => s.planId === plan.id
  );
  assertEqual(planSessions.length, 3, '3 sessions created for plan');

  // Delete sessions for the plan (simulate cascade)
  const sessionIds = planSessions.map((s) => s.id);
  await api('/sessions/delete-many', {
    method: 'POST',
    body: JSON.stringify({ ids: sessionIds }),
  });

  // Verify sessions deleted
  const { data: afterDeleteSessions } = await api<{ id: string; planId: string }[]>('/sessions');
  const remaining = (afterDeleteSessions as { id: string; planId: string }[]).filter(
    (s) => s.planId === plan.id
  );
  assertEqual(remaining.length, 0, 'All plan sessions deleted via deleteMany');

  // Delete plan
  await api(`/plans/${plan.id}`, { method: 'DELETE' });
  const { status: planAfter } = await api(`/plans/${plan.id}`);
  assertEqual(planAfter, 404, 'Plan deleted successfully');

  // Delete student
  await api(`/students/${student.id}`, { method: 'DELETE' });
  const { status: studentAfter } = await api(`/students/${student.id}`);
  assertEqual(studentAfter, 404, 'Student deleted successfully');
}

async function testErrorHandling(): Promise<void> {
  section('7. Error Handling — Edge Cases');

  const nonExistentId = testId('nonexistent_999');

  // GET non-existent
  const { status: get404 } = await api(`/students/${nonExistentId}`);
  assertEqual(get404, 404, 'GET non-existent student → 404');

  // PUT non-existent
  const { status: put404 } = await api(`/students/${nonExistentId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: 'لا يوجد' }),
  });
  assertEqual(put404, 404, 'PUT non-existent student → 404');

  // DELETE non-existent
  const { status: delete404 } = await api(`/students/${nonExistentId}`, {
    method: 'DELETE',
  });
  assertEqual(delete404, 404, 'DELETE non-existent student → 404');

  // GET non-existent plan
  const { status: planGet404 } = await api(`/plans/${nonExistentId}`);
  assertEqual(planGet404, 404, 'GET non-existent plan → 404');

  // GET non-existent session
  const { status: sessionGet404 } = await api(`/sessions/${nonExistentId}`);
  assertEqual(sessionGet404, 404, 'GET non-existent session → 404');

  // deleteMany with invalid input
  const { status: badDeleteMany } = await api('/students/delete-many', {
    method: 'POST',
    body: JSON.stringify({ ids: 'not-an-array' }),
  });
  assertEqual(badDeleteMany, 400, 'deleteMany with invalid ids → 400');
}

async function testDataIntegrity(): Promise<void> {
  section('8. Data Integrity — Types & Nested Objects');

  const student = makeStudent('integrity');
  await api('/students', { method: 'POST', body: JSON.stringify(student) });

  const plan = makePlan('integrity_plan', student.id);
  await api('/plans', { method: 'POST', body: JSON.stringify(plan) });

  // Session with complex nested objects
  const session = {
    id: testId('session_integrity'),
    planId: plan.id,
    studentId: student.id,
    date: '2026-09-04',
    sessionNumber: 1,
    newMemorization: {
      content: 'سورة البقرة الآيات 50-60',
      amount: 'صفحة ونصف',
      status: 'excellent',
      mistakes: 2,
      notes: 'أداء جيد مع بعض الأخطاء البسيطة',
    },
    recentRevision: {
      content: 'سورة البقرة الآيات 40-49',
      amount: 'صفحة',
      status: 'very_good',
      mistakes: 1,
      notes: '',
    },
    distantRevision: {
      content: 'سورة الفاتحة كاملة',
      amount: 'سورة كاملة',
      status: 'excellent',
      mistakes: 0,
      notes: 'ممتاز',
    },
    overallRating: 'excellent',
    completed: true,
    completedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    durationSeconds: 1800,
    notes: 'جلسة ممتازة',
  };

  await api('/sessions', { method: 'POST', body: JSON.stringify(session) });

  // Fetch and verify all nested data preserved
  const { data: fetched } = await api<typeof session>(`/sessions/${session.id}`);

  // Verify nested objects
  assertEqual(fetched.newMemorization?.content, 'سورة البقرة الآيات 50-60', 'Nested newMemorization.content preserved');
  assertEqual(fetched.newMemorization?.amount, 'صفحة ونصف', 'Nested newMemorization.amount preserved');
  assertEqual(fetched.newMemorization?.status, 'excellent', 'Nested newMemorization.status preserved');
  assertEqual(fetched.newMemorization?.mistakes, 2, 'Nested newMemorization.mistakes preserved (number)');

  assertEqual(fetched.recentRevision?.status, 'very_good', 'Nested recentRevision.status preserved');
  assertEqual(fetched.distantRevision?.notes, 'ممتاز', 'Nested distantRevision.notes preserved (Arabic)');

  // Verify primitive types
  assertEqual(fetched.completed, true, 'Boolean field preserved');
  assertEqual(fetched.durationSeconds, 1800, 'Number field preserved');
  assertEqual(fetched.overallRating, 'excellent', 'String field preserved');
  assertEqual(fetched.sessionNumber, 1, 'Number field (sessionNumber) preserved');

  // Verify date strings
  assert(typeof fetched.completedAt === 'string', 'completedAt is a string');
  assert(typeof fetched.startedAt === 'string', 'startedAt is a string');

  // Verify plan recitationDays array
  const { data: fetchedPlan } = await api<typeof plan>(`/plans/${plan.id}`);
  assert(Array.isArray(fetchedPlan.recitationDays), 'recitationDays is array after fetch');
  assertEqual(fetchedPlan.recitationDays.length, 3, 'recitationDays has correct length');
  assertEqual(fetchedPlan.totalSessions, 13, 'totalSessions number preserved');

  // Cleanup
  await api(`/sessions/${session.id}`, { method: 'DELETE' });
  await api(`/plans/${plan.id}`, { method: 'DELETE' });
  await api(`/students/${student.id}`, { method: 'DELETE' });
}

async function testCollectionIsolation(): Promise<void> {
  section('9. Collection Isolation');

  const student = makeStudent('iso_1');
  const plan = makePlan('iso_1', student.id);

  await api('/students', { method: 'POST', body: JSON.stringify(student) });
  await api('/plans', { method: 'POST', body: JSON.stringify(plan) });

  // Delete from one collection shouldn't affect other
  await api(`/students/${student.id}`, { method: 'DELETE' });

  // Plan should still exist
  const { status: planStatus } = await api(`/plans/${plan.id}`);
  assertEqual(planStatus, 200, 'Deleting student does not delete plan (at API level)');

  // Cleanup
  await api(`/plans/${plan.id}`, { method: 'DELETE' });
}

async function testMongoDBSpecifics(): Promise<void> {
  section('10. MongoDB Specifics — _id Stripping');

  const student = makeStudent('mongo_1');
  const { data: created } = await api<Record<string, unknown>>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
  assert(!('_id' in created), 'POST response does not contain MongoDB _id');

  const { data: fetched } = await api<Record<string, unknown>>(`/students/${student.id}`);
  assert(!('_id' in fetched), 'GET response does not contain MongoDB _id');

  const { data: updated } = await api<Record<string, unknown>>(`/students/${student.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: 'تعديل' }),
  });
  assert(!('_id' in updated), 'PUT response does not contain MongoDB _id');

  const { data: allStudents } = await api<Record<string, unknown>[]>('/students');
  const testItem = (allStudents as Record<string, unknown>[]).find(
    (s) => s.id === student.id
  );
  assert(testItem !== undefined && !('_id' in testItem), 'GET all response items do not contain MongoDB _id');

  // Cleanup
  await api(`/students/${student.id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// Main Runner
// ═══════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Quran Tracker — API Integration Tests                  ║');
  console.log('║   Testing localStorage → MongoDB migration               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Test prefix: ${TEST_PREFIX}\n`);

  // Verify server is reachable
  try {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch (error) {
    console.error('❌ Cannot reach dev server at', BASE_URL);
    console.error('   Make sure `npm run dev` is running.');
    process.exit(1);
  }

  console.log('✅ Server is reachable\n');

  try {
    await testStudentsCRUD();
    await testPlansCRUD();
    await testSessionsCRUD();
    await testSettings();
    await testBulkOperations();
    await testRelationships();
    await testErrorHandling();
    await testDataIntegrity();
    await testCollectionIsolation();
    await testMongoDBSpecifics();
  } catch (error) {
    console.error('\n💥 Unexpected error during tests:', error);
    failed++;
  }

  // Final cleanup
  section('Cleanup');
  try {
    await cleanupTestData();
    console.log('  ✅ Test data cleaned up');
  } catch (error) {
    console.error('  ⚠️  Cleanup failed:', error);
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║   Results: ${passed} passed, ${failed} failed${' '.repeat(Math.max(0, 30 - String(passed).length - String(failed).length))}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach((f) => console.log(f));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
