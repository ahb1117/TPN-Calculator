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
  const [userName, setUserName] = useState('');
  const [rows, setRows]         = useState<CalcRow[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [shown, setShown]       = useState<Record<string, boolean>>({});

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

  function toggleShown(mrn: string) {
    setShown(prev => ({ ...prev, [mrn]: !prev[mrn] }));
  }

  return (
    <div style={{ padding: '24px 16px 48px' }}>
      {userName && (
        <div className="auth-bar">
          <span className="user-chip">👤 {userName}</span>
          <a href="/calculator" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>← Calculator</a>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      )}

      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
        </div>
        <a href="/" className="badge badge-blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>Neonatology Tool</a>
        <h1>TPN History</h1>
        <p>Search by MRN to view saved TPN orders</p>
      </header>

      {/* Search */}
      <div className="card">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by MRN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 15, outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          )}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
          {loading ? 'Loading…' : `${rows.length} record${rows.length !== 1 ? 's' : ''} · ${Object.keys(groups).length} patient${Object.keys(groups).length !== 1 ? 's' : ''} shown`}
        </div>
      </div>

      {!loading && Object.keys(groups).length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 24px' }}>
          {query ? `No records found for MRN "${query}"` : 'No saved TPN records yet. Use the Calculator and press 💾 Save to MRN.'}
        </div>
      )}

      {Object.entries(groups).map(([mrn, calcRows]) => {
        const last = calcRows[0];
        const isShown = !!shown[mrn];
        return (
          <div key={mrn} className="card" style={{ marginBottom: 16 }}>
            {/* MRN header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9ca3af' }}>MRN</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#21335E', marginLeft: 8 }}>{mrn}</span>
                </div>
                <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 999, padding: '3px 10px' }}>
                  {calcRows.length} saved
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Last: {fmtDate(last.createdAt)}</span>
                <button
                  onClick={() => toggleShown(mrn)}
                  style={{
                    background: isShown ? '#3E8A95' : '#fff',
                    color: isShown ? '#fff' : '#3E8A95',
                    border: '1.5px solid #3E8A95',
                    borderRadius: 8,
                    padding: '7px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {isShown ? 'Hide TPN' : 'Show Last TPN'}
                </button>
              </div>
            </div>

            {/* Expanded last TPN detail */}
            {isShown && (
              <div style={{ marginTop: 18, borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
                <LastTPNDetail row={last} />
              </div>
            )}
          </div>
        );
      })}

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6b7280', marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid #f3f4f6' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ label, value, color = '#3E8A95', unit = '' }: { label: string; value: string | number; color?: string; unit?: string }) {
  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 3 }}>
        {value}<span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

function LastTPNDetail({ row }: { row: { mrn: string; results: TPNData; createdAt: string } }) {
  const r = row.results;
  const W = r.W;

  return (
    <div>
      <Section title="Patient & Fluids">
        <Chip label="MRN"              value={row.mrn}                        color="#21335E" />
        <Chip label="Weight"           value={fmt(W, 2)}                      color="#21335E"  unit="kg" />
        <Chip label="TFI"              value={fmt(r.fluid, 0)}                color="#3E8A95"  unit="ml/kg/day" />
        <Chip label="Total Volume"     value={fmt(r.totalVol, 1)}             color="#3E8A95"  unit="ml/day" />
        <Chip label="TPN Rate"         value={fmt(r.combinedHr, 2)}           color="#3E8A95"  unit="ml/hr" />
        <Chip label="IL Rate"          value={fmt(r.ilHr, 2)}                 color="#b45309"  unit="ml/hr" />
      </Section>

      <Section title="Macronutrients (per kg/day)">
        <Chip label="Amino Acid"       value={fmt(r.AA_DOSE, 1)}              color="#3E8A95"  unit="g/kg/day" />
        <Chip label="Intralipid"       value={fmt(r.IL_DOSE, 1)}              color="#b45309"  unit="g/kg/day" />
        <Chip label="GIR"              value={fmt(r.gir, 2)}                  color="#21335E"  unit="mg/kg/min" />
        <Chip label="Dextrose Conc."   value={`D${fmt(r.dxConc, 1)}W`}       color="#21335E" />
        <Chip label="Total kcal/kg/d"  value={fmt(r.calTot / W, 0)}          color="#DC2626"  unit="kcal" />
      </Section>

      <Section title="Electrolytes & Minerals (per kg/day)">
        <Chip label="NaCl"             value={fmt(r.nacl, 1)}                 color="#3E8A95"  unit="mEq/kg/day" />
        <Chip label="Na Acetate"       value={fmt(r.naac, 1)}                 color="#3E8A95"  unit="mEq/kg/day" />
        <Chip label="Na Phosphate"     value={fmt(r.naph, 1)}                 color="#3E8A95"  unit="mmol/kg/day" />
        <Chip label="KCl"              value={fmt(r.kcl, 1)}                  color="#21335E"  unit="mEq/kg/day" />
        <Chip label="K Phosphate"      value={fmt(r.kph, 1)}                  color="#21335E"  unit="mmol/kg/day" />
        <Chip label="Ca Gluconate"     value={fmt(r.ca, 1)}                   color="#b45309"  unit="mEq/kg/day" />
        <Chip label="Phosphate"        value={fmt(r.phos, 1)}                 color="#b45309"  unit="mmol/kg/day" />
        <Chip label="Mg Sulfate"       value={fmt(r.mg, 1)}                   color="#3E8A95"  unit="mEq/kg/day" />
      </Section>

      <Section title="Daily Totals">
        <Chip label="Total Na"         value={fmt(r.totalNa, 2)}              color="#3E8A95"  unit="mEq/day" />
        <Chip label="Total K"          value={fmt(r.totalK, 2)}               color="#21335E"  unit="mEq/day" />
        <Chip label="Amino Acids"      value={fmt(r.aaGrams, 1)}              color="#3E8A95"  unit="g/day" />
        <Chip label="Intralipid"       value={fmt(r.ilGrams, 1)}              color="#b45309"  unit="g/day" />
        <Chip label="Dextrose"         value={fmt(r.dxGrams, 2)}              color="#21335E"  unit="g/day" />
        <Chip label="Total kcal"       value={fmt(r.calTot, 0)}               color="#DC2626"  unit="kcal/day" />
      </Section>
    </div>
  );
}
