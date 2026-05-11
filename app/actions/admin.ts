'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, ne } from 'drizzle-orm';
import { getSession } from '@/lib/session';

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId || session.role !== 'admin') throw new Error('Unauthorized');
  return session;
}

export async function getAdminData() {
  const session = await getSession();
  if (!session.userId || session.role !== 'admin') return null;

  const userList = await db
    .select({ id: users.id, name: users.name, username: users.username, status: users.status, role: users.role, createdAt: users.createdAt })
    .from(users)
    .where(ne(users.role, 'admin'));

  return { username: session.username, users: userList };
}

export async function setUserStatus(userId: number, status: 'approved' | 'rejected'): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ status }).where(eq(users.id, userId));
}
