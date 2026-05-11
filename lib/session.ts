import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId: number;
  username: string;
  name: string;
  role: 'user' | 'admin';
}

export const sessionOptions = {
  cookieName: 'tpn_session',
  password: process.env.SESSION_SECRET ?? 'tpn-neonatal-session-secret-key-minimum-32-characters-long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
