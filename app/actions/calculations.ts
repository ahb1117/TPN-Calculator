'use server';

import { db } from '@/db';
import { calculations } from '@/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import type { TPNData, TPNInputs } from '@/lib/types';

export async function saveCalculation(mrn: string, data: TPNData): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session.userId) return { error: 'Not authenticated.' };
  if (!mrn.trim())     return { error: 'MRN is required to save.' };

  const { W, fluid, AA_DOSE, IL_DOSE, gir, nacl, naac, naph, kcl, kph, ca, phos, mg } = data;
  const inputs: TPNInputs = { W, fluid, AA_DOSE, IL_DOSE, gir, nacl, naac, naph, kcl, kph, ca, phos, mg };

  await db.insert(calculations).values({
    userId: session.userId,
    mrn: mrn.trim().toUpperCase(),
    inputs: JSON.stringify(inputs),
    results: JSON.stringify(data),
  });
  return { success: true };
}

export async function getCalculationsByMRN(mrn: string) {
  const session = await getSession();
  if (!session.userId) return [];

  const rows = await db
    .select()
    .from(calculations)
    .where(and(eq(calculations.mrn, mrn.trim().toUpperCase()), eq(calculations.userId, session.userId)))
    .orderBy(desc(calculations.createdAt));

  return rows.map(r => ({
    id: r.id,
    mrn: r.mrn,
    inputs: JSON.parse(r.inputs) as TPNInputs,
    results: JSON.parse(r.results) as TPNData,
    createdAt: r.createdAt,
  }));
}
