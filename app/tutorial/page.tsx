import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'How to Use — Neonatal TPN Calculator' };

function Step({ n, title, color = '#3E8A95', children }: { n: number; title: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ position: 'relative', paddingTop: 28 }}>
      <div style={{
        position: 'absolute', top: -18, left: 24,
        width: 36, height: 36, borderRadius: '50%',
        background: color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, boxShadow: '0 2px 6px rgba(33,51,94,.18)',
      }}>{n}</div>
      <h2 style={{ fontFamily: 'Montserrat, system-ui, sans-serif', fontSize: 16, fontWeight: 700, color: '#21335E', marginBottom: 14, marginTop: 4 }}>{title}</h2>
      <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Row({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
      <span style={{ background: '#D9ECEE', color: '#3E8A95', border: '1px solid #B3D9DD', borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', marginTop: 1 }}>{label}</span>
      <span style={{ color: '#4b5563' }}>{desc}</span>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginTop: 12 }}>
      ⚠️ {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', marginTop: 12 }}>
      ✅ {children}
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div style={{ padding: '24px 16px 60px' }}>

      {/* Nav */}
      <div style={{ maxWidth: 720, margin: '0 auto 12px', display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
        <Link href="/login" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none', borderBottom: '1px dashed #CBD5E1' }}>Sign In</Link>
        <Link href="/calculator" style={{ fontSize: 12, color: '#3E8A95', textDecoration: 'none', borderBottom: '1px dashed #7CB3B9' }}>← Back to Calculator</Link>
      </div>

      {/* Header */}
      <header className="site-header">
        <div className="logo-row">
          <Image src="/1.png" alt="Alahsa Health Cluster" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
          <Image src="/2.png" alt="King Faisal General Hospital" width={120} height={56} style={{ objectFit: 'contain', height: 56, width: 'auto' }} />
        </div>
        <a href="/" className="badge badge-blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>Neonatology Tool</a>
        <h1>How to Use the TPN Calculator</h1>
        <p>Step-by-step guide to registration, calculation, and patient history</p>
      </header>

      {/* ── Step 1: Registration ── */}
      <Step n={1} title="Create an Account" color="#3E8A95">
        <p>Go to the <strong>Sign In</strong> page and click the <strong>Register</strong> tab.</p>
        <div style={{ margin: '14px 0 6px' }}>
          <Row label="Full Name"         desc="Enter your full name (e.g. Dr. Ahmed Buzaid). This will appear on saved records." />
          <Row label="Username"          desc="Choose a unique username — used to log in." />
          <Row label="Password"          desc="At least 6 characters." />
          <Row label="Confirm Password"  desc="Repeat the same password." />
        </div>
        <p style={{ marginTop: 12 }}>Before creating your account you must tick <strong>both</strong> consent checkboxes:</p>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 2 }}>
          <li>Confirm you are trained and competent in writing neonatal parenteral nutrition orders.</li>
          <li>Accept that you use this calculator at your own risk and will always verify calculations independently.</li>
        </ul>
        <Tip>After registration you are logged in automatically and taken straight to the Calculator — no admin approval needed.</Tip>
      </Step>

      {/* ── Step 2: Login ── */}
      <Step n={2} title="Sign In" color="#3E8A95">
        <p>If you already have an account, enter your <strong>username</strong> and <strong>password</strong> on the <strong>Sign In</strong> tab and press <em>Sign In</em> or hit <kbd style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 6px', fontSize: 12 }}>Enter</kbd>.</p>
        <p style={{ marginTop: 10 }}>The <strong>Neonatology Tool</strong> badge at the top of every page is a smart home link — it takes you to the Calculator if you are logged in, or to Sign In if you are not.</p>
      </Step>

      {/* ── Step 3: Calculator inputs ── */}
      <Step n={3} title="Enter Patient Data in the Calculator" color="#21335E">
        <p>The calculator is split into two sections: <strong>Macronutrients</strong> and <strong>Electrolytes &amp; Minerals</strong>.</p>

        <p style={{ fontWeight: 700, marginTop: 14, marginBottom: 6, color: '#21335E' }}>Macronutrients</p>
        <Row label="Weight (kg)"         desc="Patient weight in kilograms — all doses are calculated per kg." />
        <Row label="TFI (ml/kg/day)"     desc="Total fluid intake. Drives the total daily volume." />
        <Row label="Amino Acid (g/kg/d)" desc="Trophamine dose. Typical range: 1.5 – 4 g/kg/day." />
        <Row label="Intralipid (g/kg/d)" desc="20% Intralipid dose. Typical range: 1 – 3 g/kg/day." />
        <Row label="GIR (mg/kg/min)"     desc="Glucose infusion rate. Drives dextrose volume and concentration." />

        <p style={{ fontWeight: 700, marginTop: 14, marginBottom: 6, color: '#3E8A95' }}>Electrolytes &amp; Minerals (all per kg/day)</p>
        <Row label="NaCl"         desc="Sodium chloride — mEq/kg/day." />
        <Row label="Na Acetate"   desc="Sodium acetate — mEq/kg/day." />
        <Row label="Na Phosphate" desc="Sodium phosphate — mmol/kg/day (contributes 2 mEq Na per mmol)." />
        <Row label="KCl"          desc="Potassium chloride — mEq/kg/day." />
        <Row label="K Phosphate"  desc="Potassium phosphate — mmol/kg/day." />
        <Row label="Ca Gluconate" desc="Calcium gluconate — mEq/kg/day." />
        <Row label="Phosphate"    desc="Additional phosphate — mmol/kg/day." />
        <Row label="Mg Sulfate"   desc="Magnesium sulfate — mEq/kg/day." />

        <Tip>Press <strong>Calculate</strong> (or hit Enter in any field) to update results instantly. All fields default to 0 if left blank.</Tip>
      </Step>

      {/* ── Step 4: Reading results ── */}
      <Step n={4} title="Read the Results" color="#21335E">
        <p>Results appear immediately below the inputs in colour-coded cards:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, margin: '14px 0' }}>
          {[
            { color: '#3E8A95', label: 'Teal cards',   desc: 'Volumes and rates (TPN, IL, total volume, ml/hr)' },
            { color: '#21335E', label: 'Navy cards',   desc: 'Dextrose data (concentration, grams, D%W)' },
            { color: '#b45309', label: 'Amber cards',  desc: 'Intralipid data' },
            { color: '#DC2626', label: 'Red cards',    desc: 'Calories (kcal/kg/day, total kcal)' },
            { color: '#3E8A95', label: 'Teal cards',   desc: 'Electrolyte totals (Na, K)' },
          ].map(item => (
            <div key={item.label} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block', marginRight: 6 }} />
              <strong style={{ fontSize: 13 }}>{item.label}</strong>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p>The <strong>GIR</strong> is colour-coded: <span style={{ color: '#b45309', fontWeight: 700 }}>amber</span> if &lt; 4, <span style={{ color: '#DC2626', fontWeight: 700 }}>red</span> if &gt; 8, <span style={{ color: '#15803D', fontWeight: 700 }}>green</span> if in the safe range.</p>
      </Step>

      {/* ── Step 5: Dashboard ── */}
      <Step n={5} title="View Charts (Dashboard)" color="#21335E">
        <p>Click the <strong>Dashboard</strong> button (purple) in the action bar to open a visual breakdown of the TPN order:</p>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 2 }}>
          <li>Macronutrient calorie distribution (pie chart)</li>
          <li>Volume breakdown — AA / IL / Dextrose (bar chart)</li>
          <li>Electrolyte summary</li>
        </ul>
        <Tip>The Dashboard only appears after you have pressed Calculate and results are available.</Tip>
      </Step>

      {/* ── Step 6: Order Table ── */}
      <Step n={6} title="Print the Order Table" color="#3E8A95">
        <p>Click the <strong>Order Table</strong> button (teal) to open a printable TPN order summary.</p>
        <p style={{ marginTop: 10 }}>The order sheet includes all volumes, rates, and electrolyte quantities formatted for clinical documentation. Use your browser&apos;s <strong>Print</strong> function (<kbd style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 6px', fontSize: 12 }}>Ctrl/⌘ P</kbd>) to print or save as PDF.</p>
      </Step>

      {/* ── Step 7: Aspen reference ── */}
      <Step n={7} title="Aspen Reference Table" color="#3E8A95">
        <p>Click the <strong>Aspen</strong> button to open a reference table of standard Aspen parenteral nutrition formulations.</p>
        <p style={{ marginTop: 10 }}>Use this to cross-check your calculated concentrations against standard solutions — no data entry required.</p>
      </Step>

      {/* ── Step 8: Save to MRN ── */}
      <Step n={8} title="Save a Calculation to a Patient MRN" color="#b45309">
        <p>After calculating, enter the patient&apos;s <strong>MRN</strong> in the save box and press the <strong>💾 Save</strong> button.</p>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 2 }}>
          <li>MRN is stored in uppercase automatically.</li>
          <li>Multiple saves for the same MRN are kept — the most recent appears first in History.</li>
          <li>Any logged-in user can see all saved records.</li>
        </ul>
        <Note>Always verify the MRN before saving. Saved records cannot be deleted from the calculator interface.</Note>
      </Step>

      {/* ── Step 9: History ── */}
      <Step n={9} title="View Patient TPN History" color="#3E8A95">
        <p>Navigate to the <strong>History</strong> page using the link in the calculator header.</p>

        <p style={{ fontWeight: 700, marginTop: 14, marginBottom: 8 }}>Searching</p>
        <p>Type part or all of an MRN in the search box. Results filter in real time. All patients saved by any user are shown.</p>

        <p style={{ fontWeight: 700, marginTop: 14, marginBottom: 8 }}>Show Last TPN</p>
        <p>Each patient row has a <strong>Show Last TPN</strong> button. Click it to expand a full clinical summary of the most recent saved TPN, organised into four sections:</p>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 2 }}>
          <li><strong>Patient &amp; Fluids</strong> — MRN, weight, TFI, total volume, TPN/IL rates</li>
          <li><strong>Macronutrients</strong> — AA (g/kg/day), IL (g/kg/day), GIR, dextrose concentration, kcal/kg/day</li>
          <li><strong>Electrolytes &amp; Minerals</strong> — all eight electrolytes per kg/day</li>
          <li><strong>Daily Totals</strong> — total Na, K, AA grams, IL grams, dextrose grams, total kcal</li>
        </ul>
        <Tip>Click <strong>Hide TPN</strong> on the same button to collapse the detail panel.</Tip>
      </Step>

      {/* Disclaimer */}
      <p className="disclaimer" style={{ marginTop: 32 }}>
        This tool is intended for use by trained neonatal clinicians only.
        All calculations must be independently verified by a licensed neonatologist or clinical pharmacist before administration.
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
