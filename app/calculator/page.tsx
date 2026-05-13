'use client';
import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { calculate, fmt } from '@/lib/calculations';
import type { TPNData } from '@/lib/types';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { saveCalculation } from '@/app/actions/calculations';
import AspenModal from '@/components/AspenModal';
import OrderTableModal from '@/components/OrderTableModal';

const DashboardModal = dynamic(() => import('@/components/DashboardModal'), { ssr: false });

function n(v: string) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }

export default function CalculatorPage() {
  const router = useRouter();

  // Macro inputs
  const [weight, setWeight] = useState('');
  const [fluid,  setFluid]  = useState('');
  const [aa,     setAa]     = useState('');
  const [il,     setIl]     = useState('');
  const [gir,    setGir]    = useState('');

  // Electrolyte inputs
  const [nacl, setNacl] = useState('');
  const [naac, setNaac] = useState('');
  const [naph, setNaph] = useState('');
  const [kcl,  setKcl]  = useState('');
  const [kph,  setKph]  = useState('');
  const [ca,   setCa]   = useState('');
  const [phos, setPhos] = useState('');
  const [mg,   setMg]   = useState('');

  // Patient MRN
  const [mrn, setMrn] = useState('');

  // Modals & results
  const [aspenOpen, setAspenOpen] = useState(false);
  const [dashOpen,  setDashOpen]  = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [result,    setResult]    = useState<TPNData | null>(null);
  const [userName,  setUserName]  = useState('');

  // Save state
  type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMsg,    setSaveMsg]    = useState('');

  // Auth guard — reads server session
  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) { router.replace('/login'); return; }
      setUserName(user.name);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  useEffect(() => {
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') { setAspenOpen(false); setDashOpen(false); setOrderOpen(false); }
      if (e.key === 'Enter' && !aspenOpen && !dashOpen && !orderOpen) doCalculate();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  function doCalculate() {
    const W      = parseFloat(weight);
    const fluidV = parseFloat(fluid);
    const aaDose = parseFloat(aa);
    const ilDose = parseFloat(il);
    const girV   = parseFloat(gir);

    if (isNaN(W) || W <= 0)                           return alert('Please enter a valid birth weight.');
    if (isNaN(fluidV) || fluidV <= 0)                 return alert('Please enter a valid total fluid intake.');
    if (isNaN(aaDose) || aaDose < 0.5 || aaDose > 4) return alert('Amino acid dose must be between 0.5 and 4 g/kg/day.');
    if (isNaN(ilDose) || ilDose < 1   || ilDose > 3) return alert('Intralipid dose must be between 1 and 3 g/kg/day.');
    if (isNaN(girV)   || girV <= 0)                   return alert('Please enter a valid Glucose Infusion Rate.');

    const data = calculate({
      W, fluid: fluidV, AA_DOSE: aaDose, IL_DOSE: ilDose, gir: girV,
      nacl: n(nacl), naac: n(naac), naph: n(naph),
      kcl:  n(kcl),  kph:  n(kph),
      ca:   n(ca),   phos: n(phos), mg: n(mg),
    });
    setResult(data);
    setSaveStatus('idle');
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function handleSave() {
    if (!result) return;
    setSaveStatus('saving');
    const r = await saveCalculation(mrn, result);
    if (r.error) {
      setSaveStatus('error');
      setSaveMsg(r.error);
    } else {
      setSaveStatus('saved');
      setSaveMsg('Calculation saved successfully.');
    }
    setTimeout(() => setSaveStatus('idle'), 4000);
  }

  const girStatus = result
    ? result.gir < 4 ? { label: '⚠ Below target range', cls: 'low' }
    : result.gir > 8 ? { label: '⚠ Above target range', cls: 'high' }
    : { label: '✓ Within target range', cls: 'ok' }
    : null;

  const elecRows = result ? [
    { group: 'Sodium' },
    { label: 'Sodium Chloride (NaCl)',  dose: result.nacl, total: result.nacl * result.W, unit: 'mEq' },
    { label: 'Sodium Acetate',          dose: result.naac, total: result.naac * result.W, unit: 'mEq' },
    { label: 'Sodium Phosphate',        dose: result.naph, total: result.naph * result.W, unit: 'mmol' },
    { totalRow: true, label: 'Total Sodium (NaCl + NaAc)', total: result.totalNa, unit: 'mEq' },
    { group: 'Potassium' },
    { label: 'Potassium Chloride (KCl)', dose: result.kcl, total: result.kcl * result.W, unit: 'mEq' },
    { label: 'Potassium Phosphate',      dose: result.kph, total: result.kph * result.W, unit: 'mmol' },
    { totalRow: true, label: 'Total Potassium (KCl)', total: result.totalK, unit: 'mEq' },
    { group: 'Minerals' },
    { label: 'Calcium',    dose: result.ca,   total: result.ca   * result.W, unit: 'mmol' },
    { label: 'Phosphorus', dose: result.phos, total: result.phos * result.W, unit: 'mmol' },
    { label: 'Magnesium',  dose: result.mg,   total: result.mg   * result.W, unit: 'mEq'  },
  ] : [];

  const calItems = result ? [
    { name: 'Amino Acids', kcal: result.calAA, color: '#1a6fc4' },
    { name: 'Intralipid',  kcal: result.calIL, color: '#b45309' },
    { name: 'Dextrose',    kcal: result.calDx, color: '#6d28d9' },
  ] : [];

  return (
    <div style={{ padding: '24px 16px 48px' }}>
      {/* User bar */}
      {userName && (
        <div className="auth-bar">
          <span className="user-chip">👤 {userName}</span>
          <a href="/history" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>📋 History</a>
          <a href="/tutorial" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', borderBottom: '1px dashed #d1d5db' }}>❓ How to use</a>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      )}

      {/* Header */}
      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={64} style={{ objectFit: 'contain', height: 64, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={64} style={{ objectFit: 'contain', height: 64, width: 'auto' }} />
        </div>
        <a href="/" className="badge badge-blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>Neonatology Tool</a>
        <h1>Neonatal TPN Calculator</h1>
        <p>Preterm &amp; Term Newborn &nbsp;·&nbsp; Parenteral Nutrition</p>
        <div style={{ marginTop: 12 }}>
          <button className="info-btn" onClick={() => setAspenOpen(true)}>ℹ️ ASPEN Recommended Doses</button>
        </div>
      </header>

      {/* Macronutrients card */}
      <div className="card">
        <h2>Macronutrients &amp; Fluids</h2>

        {/* Patient MRN */}
        <div className="input-row" style={{ marginBottom: 8 }}>
          <div className="field">
            <label>Patient MRN</label>
            <input
              type="text"
              placeholder="e.g. 1234567"
              value={mrn}
              onChange={e => setMrn(e.target.value)}
              style={{ textTransform: 'uppercase' }}
            />
            <span className="unit">required to save</span>
          </div>
        </div>

        <div className="input-row">
          <div className="field">
            <label>Birth Weight</label>
            <input type="number" min="0.3" max="6" step="0.01" placeholder="e.g. 1.5" value={weight} onChange={e => setWeight(e.target.value)} />
            <span className="unit">kg</span>
          </div>
          <div className="field">
            <label>Total Fluid Intake</label>
            <input type="number" min="10" max="200" step="1" placeholder="e.g. 80" value={fluid} onChange={e => setFluid(e.target.value)} />
            <span className="unit">ml/kg/day</span>
          </div>
          <div className="field">
            <label>Amino Acid</label>
            <input type="number" min="0.5" max="4" step="0.1" placeholder="e.g. 3" value={aa} onChange={e => setAa(e.target.value)} />
            <span className="unit">g/kg/day &nbsp;·&nbsp; range 0.5–4</span>
          </div>
          <div className="field">
            <label>Intralipid</label>
            <input type="number" min="1" max="3" step="0.1" placeholder="e.g. 2" value={il} onChange={e => setIl(e.target.value)} />
            <span className="unit">g/kg/day &nbsp;·&nbsp; range 1–3</span>
          </div>
          <div className="field">
            <label>GIR</label>
            <input type="number" min="0.1" max="20" step="0.1" placeholder="e.g. 6" value={gir} onChange={e => setGir(e.target.value)} />
            <span className="unit">mg/kg/min &nbsp;·&nbsp; target 4–8</span>
          </div>
        </div>
        <div className="assumptions">
          <span className="pill green">Amino acids · 10% solution</span>
          <span className="pill amber">Intralipid · 20% solution</span>
        </div>
      </div>

      {/* Electrolytes card */}
      <div className="card">
        <h2>Electrolytes <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(all optional)</span></h2>

        <div className="egroup">
          <div className="egroup-label">Sodium</div>
          <div className="egroup-row">
            <div className="field"><label>Sodium Chloride (NaCl)</label><input type="number" min="0" max="5" step="0.1" placeholder="e.g. 3" value={nacl} onChange={e => setNacl(e.target.value)} /><span className="unit">mEq/kg/day · range 2–5</span></div>
            <div className="field"><label>Sodium Acetate</label><input type="number" min="0" max="5" step="0.1" placeholder="optional" value={naac} onChange={e => setNaac(e.target.value)} /><span className="unit">mEq/kg/day</span></div>
            <div className="field"><label>Sodium Phosphate</label><input type="number" min="0" max="2" step="0.1" placeholder="optional" value={naph} onChange={e => setNaph(e.target.value)} /><span className="unit">mmol/kg/day</span></div>
          </div>
        </div>

        <div className="egroup">
          <div className="egroup-label">Potassium</div>
          <div className="egroup-row">
            <div className="field"><label>Potassium Chloride (KCl)</label><input type="number" min="0" max="4" step="0.1" placeholder="e.g. 2" value={kcl} onChange={e => setKcl(e.target.value)} /><span className="unit">mEq/kg/day · range 2–4</span></div>
            <div className="field"><label>Potassium Phosphate</label><input type="number" min="0" max="2" step="0.1" placeholder="optional" value={kph} onChange={e => setKph(e.target.value)} /><span className="unit">mmol/kg/day</span></div>
          </div>
        </div>

        <div className="egroup">
          <div className="egroup-label">Minerals</div>
          <div className="egroup-row">
            <div className="field"><label>Calcium</label><input type="number" min="0" max="2" step="0.05" placeholder="e.g. 1" value={ca} onChange={e => setCa(e.target.value)} /><span className="unit">mmol/kg/day · range 0.8–2</span></div>
            <div className="field"><label>Phosphorus</label><input type="number" min="0" max="2" step="0.1" placeholder="e.g. 1.5" value={phos} onChange={e => setPhos(e.target.value)} /><span className="unit">mmol/kg/day · range 1–2</span></div>
            <div className="field"><label>Magnesium</label><input type="number" min="0" max="0.5" step="0.05" placeholder="e.g. 0.3" value={mg} onChange={e => setMg(e.target.value)} /><span className="unit">mEq/kg/day · range 0.25–0.5</span></div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-calc" onClick={doCalculate}>Calculate TPN</button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div id="results">
          {/* Summary */}
          <div className="card">
            <h2>Summary</h2>
            <div className="summary-grid">
              <div className="summary-box blue">  <div className="val">{fmt(result.totalVol, 1)}</div><div className="lbl">Total Volume (ml/day)</div></div>
              <div className="summary-box green">  <div className="val">{fmt(result.aaGrams, 1)}</div> <div className="lbl">Amino Acid (g/day)</div></div>
              <div className="summary-box amber">  <div className="val">{fmt(result.ilGrams, 1)}</div> <div className="lbl">Intralipid (g/day)</div></div>
              <div className="summary-box purple"> <div className="val">{fmt(result.dxGrams, 2)}</div><div className="lbl">Dextrose (g/day)</div></div>
              <div className="summary-box red">    <div className="val">{fmt(result.calTot, 0)}</div> <div className="lbl">Total kcal/day</div></div>
            </div>

            <div className="gir-block">
              <div className="gir-title">Glucose Infusion Rate (GIR)</div>
              <div className="gir-value">{fmt(result.gir, 2)} <span style={{ fontSize: 16, fontWeight: 500 }}>mg/kg/min</span></div>
              <div className="gir-sub">Normal neonatal range: 4 – 8 mg/kg/min</div>
              <div className="gir-range">
                <span className="gir-range-label">0</span>
                <div className="gir-range-bar">
                  <div className="gir-range-fill" style={{ width: `${Math.min((result.gir / 12) * 100, 100)}%` }} />
                </div>
                <span className="gir-range-label">12 mg/kg/min</span>
              </div>
              {girStatus && <span className={`gir-status ${girStatus.cls}`}>{girStatus.label}</span>}
            </div>

            <div className="rate-strip">
              <div className="rate-chip"><div className="chip-val">{fmt(result.totalHr, 2)}</div>   <div className="chip-lbl">Total (ml/hr)</div></div>
              <div className="rate-chip"><div className="chip-val">{fmt(result.combinedHr, 2)}</div><div className="chip-lbl">TPN Volume (ml/hr)</div></div>
              <div className="rate-chip"><div className="chip-val">{fmt(result.ilHr, 2)}</div>      <div className="chip-lbl">Intralipid (ml/hr)</div></div>
            </div>

            {/* Action buttons + Save */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {saveStatus !== 'idle' && (
                <span style={{ fontSize: 13, color: saveStatus === 'saved' ? '#15803d' : saveStatus === 'error' ? '#dc2626' : '#6b7280', marginRight: 8 }}>
                  {saveStatus === 'saving' ? 'Saving…' : saveMsg}
                </span>
              )}
              <button
                className="btn-ordertable"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                style={{ background: '#15803d', borderColor: '#15803d' }}
              >
                💾 Save to MRN
              </button>
              <button className="btn-dashboard"  onClick={() => setDashOpen(true)}>📊 Dashboard</button>
              <button className="btn-ordertable" onClick={() => setOrderOpen(true)}>📋 Order Table</button>
            </div>
          </div>

          {/* Macronutrient breakdown */}
          <div className="card">
            <h2>Macronutrient Breakdown</h2>
            <table>
              <thead>
                <tr><th>Component</th><th>Dose</th><th>Solution</th><th>Volume/day</th><th>Volume/hr</th><th>Grams/day</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="name-cell"><span className="row-icon" style={{ background: '#e8f1fb', color: '#1a6fc4' }}>💧</span><strong>Amino Acids</strong></td>
                  <td>{fmt(result.AA_DOSE, 1)} g/kg/day</td><td>10% Trophamine</td>
                  <td>{fmt(result.aaVol, 1)} ml</td><td>{fmt(result.aaHr, 2)} ml/hr</td><td>{fmt(result.aaGrams, 1)} g</td>
                </tr>
                <tr>
                  <td className="name-cell"><span className="row-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>🍬</span><strong>Dextrose</strong></td>
                  <td>{fmt(result.gir, 2)} mg/kg/min</td><td>—</td>
                  <td>{fmt(result.dxVol, 1)} ml</td><td>{fmt(result.dxHr, 2)} ml/hr</td><td>{fmt(result.dxGrams, 2)} g</td>
                </tr>
                <tr style={{ background: '#e8f1fb', fontWeight: 700 }}>
                  <td className="name-cell"><span className="row-icon" style={{ background: '#1a6fc4', color: '#fff' }}>+</span><strong>TPN</strong></td>
                  <td>—</td><td>D{fmt(result.dxConc, 1)}W ({fmt(result.dxConc, 1)}%)</td>
                  <td>{fmt(result.combinedVol, 1)} ml</td><td>{fmt(result.combinedHr, 2)} ml/hr</td><td>—</td>
                </tr>
                <tr>
                  <td className="name-cell"><span className="row-icon" style={{ background: '#fef3c7', color: '#b45309' }}>🟡</span><strong>Intralipid</strong></td>
                  <td>{fmt(result.IL_DOSE, 1)} g/kg/day</td><td>20% Intralipid</td>
                  <td>{fmt(result.ilVol, 1)} ml</td><td>{fmt(result.ilHr, 2)} ml/hr</td><td>{fmt(result.ilGrams, 1)} g</td>
                </tr>
                <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                  <td className="name-cell"><span className="row-icon" style={{ background: '#e6f4ee', color: '#1a8754' }}>Σ</span><strong>Total</strong></td>
                  <td>{fmt(result.fluid, 0)} ml/kg/day</td><td>—</td>
                  <td>{fmt(result.totalVol, 1)} ml</td><td>{fmt(result.totalHr, 2)} ml/hr</td>
                  <td>{fmt(result.aaGrams + result.ilGrams + result.dxGrams, 1)} g</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Electrolytes */}
          <div className="card">
            <h2>Electrolytes</h2>
            <table>
              <thead><tr><th>Electrolyte</th><th>Dose (per kg/day)</th><th>Total/day</th><th>Unit</th></tr></thead>
              <tbody>
                {elecRows.map((r, i) => {
                  if ('group' in r) return <tr key={i} className="elec-group-header"><td colSpan={4}>{r.group}</td></tr>;
                  if ('totalRow' in r) return (
                    <tr key={i} className="elec-total-row">
                      <td className="name-cell" style={{ paddingLeft: 28 }}><strong>{r.label}</strong></td>
                      <td>—</td><td>{fmt(r.total!, 2)}</td><td>{r.unit}/day</td>
                    </tr>
                  );
                  return (
                    <tr key={i}>
                      <td className="name-cell" style={{ paddingLeft: 28 }}>{r.label}</td>
                      <td>{r.dose! > 0 ? fmt(r.dose!, 2) : '—'}</td>
                      <td>{r.dose! > 0 ? fmt(r.total!, 2) : '—'}</td>
                      <td>{r.unit}/day</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Caloric breakdown */}
          <div className="card">
            <h2>Caloric Breakdown</h2>
            {calItems.map(item => {
              const pct = result.calTot > 0 ? (item.kcal / result.calTot * 100) : 0;
              return (
                <div key={item.name} className="cal-row">
                  <span className="cal-name">{item.name}</span>
                  <div className="cal-bar-wrap"><div className="cal-bar" style={{ width: `${pct.toFixed(1)}%`, background: item.color }} /></div>
                  <span className="cal-val">{fmt(item.kcal, 0)} kcal <span style={{ fontWeight: 400, color: '#9ca3af' }}>({pct.toFixed(0)}%)</span></span>
                </div>
              );
            })}
            <div className="cal-row" style={{ fontWeight: 700 }}>
              <span className="cal-name">Total</span>
              <div className="cal-bar-wrap"><div className="cal-bar" style={{ width: '100%', background: '#374151' }} /></div>
              <span className="cal-val">{fmt(result.calTot, 0)} kcal</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              = <strong>{fmt(result.calTot / result.W, 0)} kcal/kg/day</strong>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
              Dextrose 3.4 kcal/g &nbsp;·&nbsp; Amino Acids 4 kcal/g &nbsp;·&nbsp; Intralipid (20%) 2 kcal/ml
            </div>
          </div>
        </div>
      )}

      <p className="disclaimer">
        ⚠️ For educational and clinical decision-support only. Always verify all calculations
        with a licensed neonatologist or clinical pharmacist before administration.
        Individual patient requirements may vary.
      </p>

      <div className="signoff">
        <div className="signoff-inner">
          <div style={{ fontSize: 12, color: '#6b7280' }}>Done and reviewed by</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 3 }}>Dr Ahmed Hussain Buzaid</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1a6fc4', marginTop: 2 }}>Neonatology Consultant</div>
        </div>
      </div>

      <AspenModal open={aspenOpen} onClose={() => setAspenOpen(false)} />
      <DashboardModal open={dashOpen} onClose={() => setDashOpen(false)} data={result} />
      <OrderTableModal open={orderOpen} onClose={() => setOrderOpen(false)} data={result} />
    </div>
  );
}
