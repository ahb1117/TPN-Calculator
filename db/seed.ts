import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  const adminUsername = process.env.ADMIN_USERNAME ?? 'ahb1117';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '1Qaz1qaz@';

  const existing = await db.query.users.findFirst({ where: eq(users.username, adminUsername) });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      name: 'Dr Ahmed Hussain Buzaid',
      username: adminUsername,
      passwordHash,
      status: 'approved',
      role: 'admin',
    });
    console.log('Admin user created:', adminUsername);
  } else {
    console.log('Admin user already exists, skipping seed.');
  }
}

seed().catch(console.error).finally(() => process.exit(0));
