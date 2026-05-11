'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { getAllCalculations } from '@/app/actions/calculations';
import { fmt } from '@/lib/calculations';
import type { TPNData, TPNInputs } from '@/lib/types';

interface CalcRow {
  id: number;
  mrn: string;
  inputs: TPNInputs;
  results: TPNData;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [userName, setUserName]   = useState('');
  const [rows, setRows]           = useState<CalcRow[]>([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) { router.replace('/login'); return; }
      setUserName(user.name);
    });
    getAllCalculations().then(data => { setRows(data); setLoading(false); });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const query = search.trim().toUpperCase();
  const filtered = query ? rows.filter(r => r.mrn.includes(query)) : rows;

  // Group by MRN preserving most-recent-first order
  const groups = filtered.reduce<Record<string, CalcRow[]>>((acc, row) => {
    (acc[row.mrn] ??= []).push(row);
    return acc;
  }, {});

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div style={{ padding: '24px 16px 48px' }}>
      {/* User bar */}
      {userName && (
        <div className="auth-bar">
          <span className="user-chip">👤 {userName}</span>
          <a href="/calculator" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>← Calculator</a>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      )}

      {/* Header */}
      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
        </div>
        <div className="badge badge-blue">Neonatology Tool</div>
        <h1>Calculation History</h1>
        <p>Saved TPN calculations — searchable by MRN</p>
      </header>

      {/* Search */}
      <div className="card">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by MRN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          )}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
          {loading ? 'Loading…' : `${rows.length} calculation${rows.length !== 1 ? 's' : ''} saved · ${Object.keys(groups).length} patient${Object.keys(groups).length !== 1 ? 's' : ''} shown`}
        </div>
      </div>

      {/* Results */}
      {!loading && Object.keys(groups).length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 24px' }}>
          {query ? `No calculations found for MRN "${query}"` : 'No saved calculations yet. Use the Calculator and press 💾 Save to MRN.'}
        </div>
      )}

      {Object.entries(groups).map(([mrn, calcRows]) => (
        <div key={mrn} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9ca3af' }}>MRN</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginLeft: 8 }}>{mrn}</span>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 999, padding: '3px 10px' }}>
              {calcRows.length} saved
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={th}>Date</th>
                <th style={th}>Weight</th>
                <th style={th}>GIR</th>
                <th style={th}>AA</th>
                <th style={th}>IL</th>
                <th style={th}>Total kcal</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {calcRows.map(row => (
                <>
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  >
                    <td style={td}>{fmtDate(row.createdAt)}</td>
                    <td style={td}><strong>{fmt(row.results.W, 2)}</strong> kg</td>
                    <td style={td}>
                      <span style={{ color: row.results.gir < 4 ? '#b45309' : row.results.gir > 8 ? '#b91c1c' : '#1a8754', fontWeight: 600 }}>
                        {fmt(row.results.gir, 2)}
                      </span> mg/kg/min
                    </td>
                    <td style={td}>{fmt(row.results.AA_DOSE, 1)} g/kg/d</td>
                    <td style={td}>{fmt(row.results.IL_DOSE, 1)} g/kg/d</td>
                    <td style={td}><strong>{fmt(row.results.calTot, 0)}</strong> kcal</td>
                    <td style={{ ...td, color: '#9ca3af', fontSize: 11 }}>{expanded === row.id ? '▲ hide' : '▼ details'}</td>
                  </tr>
                  {expanded === row.id && (
                    <tr key={`${row.id}-exp`}>
                      <td colSpan={7} style={{ padding: '12px 8px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <ExpandedDetail row={row} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="signoff">
        <div className="signoff-inner">
          <div style={{ fontSize: 12, color: '#6b7280' }}>Done and reviewed by</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 3 }}>Dr Ahmed Hussain Buzaid</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1a6fc4', marginTop: 2 }}>Neonatology Consultant</div>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 8px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: '#6b7280' };
const td: React.CSSProperties = { padding: '10px 8px', color: '#374151' };

function ExpandedDetail({ row }: { row: CalcRow }) {
  const r = row.results;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
      {[
        { label: 'Total Volume',      val: `${fmt(r.totalVol, 1)} ml/day`,    color: '#1a6fc4' },
        { label: 'TPN Rate',          val: `${fmt(r.combinedHr, 2)} ml/hr`,   color: '#1a6fc4' },
        { label: 'IL Rate',           val: `${fmt(r.ilHr, 2)} ml/hr`,         color: '#b45309' },
        { label: 'Amino Acids',       val: `${fmt(r.aaGrams, 1)} g/day`,      color: '#1a6fc4' },
        { label: 'Intralipid',        val: `${fmt(r.ilGrams, 1)} g/day`,      color: '#b45309' },
        { label: 'Dextrose',          val: `${fmt(r.dxGrams, 2)} g/day`,      color: '#6d28d9' },
        { label: 'Dextrose Conc.',    val: `D${fmt(r.dxConc, 1)}W`,           color: '#6d28d9' },
        { label: 'Total kcal/kg/day', val: `${fmt(r.calTot / r.W, 0)} kcal`, color: '#b91c1c' },
        { label: 'Total Na',          val: `${fmt(r.totalNa, 2)} mEq/day`,    color: '#0f766e' },
        { label: 'Total K',           val: `${fmt(r.totalK, 2)} mEq/day`,     color: '#0f766e' },
      ].map(item => (
        <div key={item.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.val}</div>
        </div>
      ))}
    </div>
  );
}
