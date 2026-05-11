'use client';
import { useState, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import { login, logout } from '@/app/actions/auth';
import { getAdminData, setUserStatus } from '@/app/actions/admin';
import type { User } from '@/lib/types';

export default function AdminPage() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [aUser, setAUser]         = useState('');
  const [aPass, setAPass]         = useState('');
  const [aAlert, setAAlert]       = useState('');
  const [aLoading, setALoading]   = useState(false);
  const [users, setUsers]         = useState<User[]>([]);

  useEffect(() => {
    getAdminData().then(data => {
      if (data) { setLoggedIn(true); setAdminUser(data.username); setUsers(data.users); }
    });
  }, []);

  async function refresh() {
    const data = await getAdminData();
    if (data) setUsers(data.users);
  }

  async function doLogin() {
    if (!aUser || !aPass) return setAAlert('Please enter your username and password.');
    setALoading(true);
    const result = await login(aUser, aPass);
    if (result.error) { setALoading(false); return setAAlert(result.error); }
    const data = await getAdminData();
    setALoading(false);
    if (!data) return setAAlert('This account does not have admin access.');
    setAdminUser(data.username);
    setUsers(data.users);
    setLoggedIn(true);
  }

  async function doLogout() {
    await logout();
    setLoggedIn(false);
    setAdminUser('');
    setAUser('');
    setAPass('');
  }

  async function approve(userId: number) {
    await setUserStatus(userId, 'approved');
    await refresh();
  }

  async function reject(userId: number) {
    await setUserStatus(userId, 'rejected');
    await refresh();
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
        <button className="btn-submit-purple" onClick={doLogin} disabled={aLoading}>
          {aLoading ? 'Signing in…' : 'Sign In'}
        </button>
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
        <div className="stat-box s-total">  <div className="sv">{users.length}</div>   <div className="sl">Total Users</div></div>
        <div className="stat-box s-pending"><div className="sv">{pending.length}</div>  <div className="sl">Pending</div></div>
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
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td><code style={{ fontSize: 12, color: '#4b5563' }}>{u.username}</code></td>
                  <td className="date-cell">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-approve" onClick={() => approve(u.id)}>✓ Approve</button>
                      <button className="btn-reject"  onClick={() => reject(u.id)}>✗ Reject</button>
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
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><code style={{ fontSize: 12, color: '#4b5563' }}>{u.username}</code></td>
                    <td><span className={`status-pill ${st}`}>{st.charAt(0).toUpperCase() + st.slice(1)}</span></td>
                    <td className="date-cell">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>
                      <div className="action-btns">
                        {st === 'pending'  && <><button className="btn-approve" onClick={() => approve(u.id)}>✓ Approve</button><button className="btn-reject" onClick={() => reject(u.id)}>✗ Reject</button></>}
                        {st === 'approved' && <button className="btn-revoke"  onClick={() => reject(u.id)}>⊘ Revoke</button>}
                        {st === 'rejected' && <button className="btn-restore" onClick={() => approve(u.id)}>↩ Restore</button>}
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
