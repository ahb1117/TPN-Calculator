'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function login(username: string, password: string): Promise<{ error?: string }> {
  const user = await db.query.users.findFirst({ where: eq(users.username, username.toLowerCase().trim()) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: 'Incorrect username or password.' };
  }
  if (user.status === 'pending')  return { error: 'Your account is awaiting admin approval. Please check back later.' };
  if (user.status === 'rejected') return { error: 'Your registration was not approved. Please contact the administrator.' };

  const session = await getSession();
  session.userId   = user.id;
  session.username = user.username;
  session.name     = user.name;
  session.role     = user.role as 'user' | 'admin';
  await session.save();
  return {};
}

export async function register(name: string, username: string, password: string): Promise<{ error?: string }> {
  if (!name.trim())        return { error: 'Full name is required.' };
  if (!username.trim())    return { error: 'Username is required.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

  const existing = await db.query.users.findFirst({ where: eq(users.username, username.toLowerCase().trim()) });
  if (existing) return { error: 'Username already exists.' };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    name: name.trim(),
    username: username.toLowerCase().trim(),
    passwordHash,
    status: 'pending',
    role: 'user',
  });
  return {};
}

export async function logout(): Promise<void> {
  const session = await getSession();
  await session.destroy();
}

export async function getCurrentUser(): Promise<{ name: string; username: string; role: string } | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return { name: session.name, username: session.username, role: session.role };
}
