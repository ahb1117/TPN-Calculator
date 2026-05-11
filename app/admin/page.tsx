'use client';
import { useState, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import {
  sha256, getUsers, saveUsers,
  getAdminSession, setAdminSession, clearAdminSession,
  ADMIN_USERNAME, ADMIN_PASS_RAW,
} from '@/lib/auth';
import type { User } from '@/lib/types';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [aUser, setAUser] = useState('');
  const [aPass, setAPass] = useState('');
  const [aAlert, setAAlert] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const s = getAdminSession();
    if (s) { setLoggedIn(true); setAdminUser(s.username); refresh(); }
  }, []);

  function refresh() { setUsers(getUsers()); }

  async function doLogin() {
    if (!aUser || !aPass) return setAAlert('Please enter your username and password.');
    if (aUser.toLowerCase() !== ADMIN_USERNAME) return setAAlert('Incorrect admin credentials.');
    const entered  = await sha256(aPass);
    const expected = await sha256(ADMIN_PASS_RAW);
    if (entered !== expected) return setAAlert('Incorrect admin credentials.');
    setAdminSession(aUser.toLowerCase());
    setAdminUser(aUser.toLowerCase());
    setLoggedIn(true);
    refresh();
  }

  function doLogout() { clearAdminSession(); setLoggedIn(false); setAUser(''); setAPass(''); }

  function approve(username: string) {
    const updated = getUsers().map(u => u.username === username ? { ...u, status: 'approved' as const } : u);
    saveUsers(updated); setUsers(updated);
  }

  function reject(username: string) {
    const updated = getUsers().map(u => u.username === username ? { ...u, status: 'rejected' as const } : u);
    saveUsers(updated); setUsers(updated);
  }

  function onKey(e: KeyboardEvent) { if (e.key === 'Enter' && !loggedIn) doLogin(); }

  const pending  = users.filter(u => u.status === 'pending');
  const approved = users.filter(u => u.status === 'approved');
  const rejected = users.filter(u => u.status === 'rejected');

  /* ── Login screen ── */
  if (!loggedIn) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 48px' }} onKeyDown={onKey}>
      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
        </div>
        <div className="badge badge-purple">Admin Panel</div>
        <h1>TPN Administrator</h1>
        <p>Restricted access — authorised personnel only</p>
      </header>

      <div className="login-card">
        <h2>🔐 Admin Sign In</h2>
        {aAlert && <div className="alert-msg error" style={{ marginBottom: 16 }}>{aAlert}</div>}
        <div className="auth-field">
          <label>Admin Username</label>
          <input type="text" placeholder="Enter admin username" value={aUser} onChange={e => setAUser(e.target.value)} />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={aPass} onChange={e => setAPass(e.target.value)} />
        </div>
        <button className="btn-submit-purple" onClick={doLogin}>Sign In</button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16 }}>
        <a href="/login" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>← Back to User Login</a>
      </p>
    </div>
  );

  /* ── Dashboard ── */
  return (
    <div className="admin-page">
      <p style={{ maxWidth: 900, margin: '0 auto 16px' }}>
        <a href="/login" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>← User Login</a>
      </p>

      <div className="topbar">
        <div className="topbar-title">🛡️ Admin Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="user-chip">🛡️ {adminUser}</span>
          <button className="btn-refresh" onClick={refresh}>↻ Refresh</button>
          <button className="btn-logout" onClick={doLogout}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat-box s-total"><div className="sv">{users.length}</div><div className="sl">Total Users</div></div>
        <div className="stat-box s-pending"><div className="sv">{pending.length}</div><div className="sl">Pending</div></div>
        <div className="stat-box s-approved"><div className="sv">{approved.length}</div><div className="sl">Approved</div></div>
        <div className="stat-box s-rejected"><div className="sv">{rejected.length}</div><div className="sl">Rejected</div></div>
      </div>

      {/* Pending approvals */}
      <div className={`admin-card${pending.length > 0 ? ' pending-hl' : ''}`}>
        <div className="card-title">
          ⏳ Pending Approvals
          <span className="count-badge">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <div className="empty-state">No pending registrations</div>
        ) : (
          <table className="user-table">
            <thead><tr><th>Full Name</th><th>Username</th><th>Registered</th><th>Actions</th></tr></thead>
            <tbody>
              {pending.map(u => (
                <tr key={u.username}>
                  <td><strong>{u.name}</strong></td>
                  <td><code style={{ fontSize: 12, color: '#4b5563' }}>{u.username}</code></td>
                  <td className="date-cell">{u.registeredAt || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-approve" onClick={() => approve(u.username)}>✓ Approve</button>
                      <button className="btn-reject"  onClick={() => reject(u.username)}>✗ Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All users */}
      <div className="admin-card">
        <div className="card-title">
          👥 All Users
          <span className="count-badge g">{users.length}</span>
        </div>
        {users.length === 0 ? (
          <div className="empty-state">No registered users yet</div>
        ) : (
          <table className="user-table">
            <thead><tr><th>Full Name</th><th>Username</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => {
                const st = u.status || 'approved';
                return (
                  <tr key={u.username}>
                    <td><strong>{u.name}</strong></td>
                    <td><code style={{ fontSize: 12, color: '#4b5563' }}>{u.username}</code></td>
                    <td><span className={`status-pill ${st}`}>{st.charAt(0).toUpperCase() + st.slice(1)}</span></td>
                    <td className="date-cell">{u.registeredAt || '—'}</td>
                    <td>
                      <div className="action-btns">
                        {st === 'pending'  && <><button className="btn-approve" onClick={() => approve(u.username)}>✓ Approve</button><button className="btn-reject" onClick={() => reject(u.username)}>✗ Reject</button></>}
                        {st === 'approved' && <button className="btn-revoke"  onClick={() => reject(u.username)}>⊘ Revoke</button>}
                        {st === 'rejected' && <button className="btn-restore" onClick={() => approve(u.username)}>↩ Restore</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
