'use client';
import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { login, register } from '@/app/actions/auth';

type Tab = 'login' | 'register';
type AlertType = 'error' | 'success' | '';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');

  // login fields
  const [lUser, setLUser] = useState('');
  const [lPass, setLPass] = useState('');
  const [lAlert, setLAlert] = useState<{ msg: string; type: AlertType }>({ msg: '', type: '' });
  const [lLoading, setLLoading] = useState(false);

  // register fields
  const [rName, setRName] = useState('');
  const [rUser, setRUser] = useState('');
  const [rPass, setRPass] = useState('');
  const [rPass2, setRPass2] = useState('');
  const [rAgree1, setRAgree1] = useState(false);
  const [rAgree2, setRAgree2] = useState(false);
  const [rAlert, setRAlert] = useState<{ msg: string; type: AlertType }>({ msg: '', type: '' });
  const [rLoading, setRLoading] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    setLAlert({ msg: '', type: '' });
    setRAlert({ msg: '', type: '' });
  }

  async function doLogin() {
    if (!lUser || !lPass) return setLAlert({ msg: 'Please enter your username and password.', type: 'error' });
    setLLoading(true);
    try {
      const result = await login(lUser, lPass);
      if (result.error) return setLAlert({ msg: result.error, type: 'error' });
      router.replace('/calculator');
    } catch {
      setLAlert({ msg: 'A server error occurred. Please try again.', type: 'error' });
    } finally {
      setLLoading(false);
    }
  }

  async function doRegister() {
    if (rPass !== rPass2) return setRAlert({ msg: 'Passwords do not match.', type: 'error' });
    if (!rAgree1) return setRAlert({ msg: 'You must confirm you are trained in neonatal parenteral nutrition.', type: 'error' });
    if (!rAgree2) return setRAlert({ msg: 'You must accept the calculator disclaimer before registering.', type: 'error' });
    setRLoading(true);
    try {
      const result = await register(rName, rUser, rPass);
      if (result.error) return setRAlert({ msg: result.error, type: 'error' });
      router.push('/calculator');
    } catch {
      setRAlert({ msg: 'A server error occurred. Please try again.', type: 'error' });
    } finally {
      setRLoading(false);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    if (tab === 'login') doLogin(); else doRegister();
  }

  return (
    <div className="auth-page" onKeyDown={onKey}>
      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
        </div>
        <a href="/" className="badge badge-blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>Neonatology Tool</a>
        <h1>Neonatal TPN Calculator</h1>
        <p>Please sign in to continue</p>
      </header>

      <div className="auth-card">
        <div className="tabs">
          <button className={`tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`tab-btn${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Register</button>
        </div>

        {/* Login */}
        {tab === 'login' && (
          <div>
            {lAlert.msg && <div className={`alert-msg ${lAlert.type}`}>{lAlert.msg}</div>}
            <div className="auth-field">
              <label>Username</label>
              <input type="text" placeholder="Enter your username" autoComplete="username" value={lUser} onChange={e => setLUser(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" autoComplete="current-password" value={lPass} onChange={e => setLPass(e.target.value)} />
            </div>
            <button className="btn-submit-blue" onClick={doLogin} disabled={lLoading}>
              {lLoading ? 'Signing in…' : 'Sign In'}
            </button>
            <div className="switch-link">
              Don&apos;t have an account? <button onClick={() => switchTab('register')}>Register</button>
            </div>
          </div>
        )}

        {/* Register */}
        {tab === 'register' && (
          <div>
            {rAlert.msg && <div className={`alert-msg ${rAlert.type}`}>{rAlert.msg}</div>}
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="Dr. First Last" autoComplete="name" value={rName} onChange={e => setRName(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Username</label>
              <input type="text" placeholder="Choose a username" autoComplete="username" value={rUser} onChange={e => setRUser(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="At least 6 characters" autoComplete="new-password" value={rPass} onChange={e => setRPass(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" autoComplete="new-password" value={rPass2} onChange={e => setRPass2(e.target.value)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={rAgree1}
                  onChange={e => setRAgree1(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#3E8A95', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  I confirm that I am trained and competent in writing <strong>neonatal parenteral nutrition</strong> orders.
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={rAgree2}
                  onChange={e => setRAgree2(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#3E8A95', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  I understand that I am using this calculator <strong>at my own risk</strong> and will always independently verify all calculations before clinical use.
                </span>
              </label>
            </div>

            <button className="btn-submit-blue" onClick={doRegister} disabled={rLoading}>
              {rLoading ? 'Creating account…' : 'Create Account'}
            </button>
            <div className="switch-link">
              Already have an account? <button onClick={() => switchTab('login')}>Sign In</button>
            </div>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 14, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <a href="/tutorial" style={{ fontSize: 11, color: '#6b7280', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>
          ❓ How to use
        </a>
        <a href="/admin" style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>
          Admin Panel
        </a>
      </p>

      <p className="disclaimer" style={{ marginTop: 20 }}>
        Access is restricted to authorised clinical staff only.
        Always verify all TPN calculations with a licensed neonatologist or clinical pharmacist.
      </p>

      <div className="signoff">
        <div className="signoff-inner">
          <div style={{ fontSize: 12, color: '#6b7280' }}>Done and reviewed by</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#21335E', marginTop: 3 }}>Dr Ahmed Hussain Buzaid</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#3E8A95', marginTop: 2 }}>Neonatology Consultant</div>
        </div>
      </div>
    </div>
  );
}
