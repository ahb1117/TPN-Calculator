import type { User, Session } from './types';

export async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('tpn_users') || '[]');
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tpn_users', JSON.stringify(users));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const s = sessionStorage.getItem('tpn_session');
  return s ? JSON.parse(s) : null;
}

export function setSession(user: Session): void {
  sessionStorage.setItem('tpn_session', JSON.stringify(user));
}

export function clearSession(): void {
  sessionStorage.removeItem('tpn_session');
}

export function getAdminSession(): { username: string } | null {
  if (typeof window === 'undefined') return null;
  const s = sessionStorage.getItem('tpn_admin');
  return s ? JSON.parse(s) : null;
}

export function setAdminSession(username: string): void {
  sessionStorage.setItem('tpn_admin', JSON.stringify({ username }));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem('tpn_admin');
}

export const ADMIN_USERNAME = 'ahb1117';
export const ADMIN_PASS_RAW = '1Qaz1qaz@';
