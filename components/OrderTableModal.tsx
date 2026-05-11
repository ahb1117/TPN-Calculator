'use client';
import type { TPNData } from '@/lib/types';
import { fmt } from '@/lib/calculations';

interface Props { open: boolean; onClose: () => void; data: TPNData | null; }

export default function OrderTableModal({ open, onClose, data: d }: Props) {
  if (!open || !d) return null;
  return (
    <div className="dash-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ot-modal">
        <div className="ot-header">
          <div>
            <h3>📋 TPN Order Table</h3>
            <p>Weight: {fmt(d.W, 2)} kg · Fluid: {fmt(d.fluid, 0)} ml/kg/day</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ot-section">
          <div className="ot-section-title" style={{ background: 'var(--blue)' }}>Fluids &amp; Macronutrients</div>
          <table className="ot-table">
            <tbody>
              <tr className="ot-highlight"><td>TPN Volume</td><td>{fmt(d.combinedVol, 1)}</td><td>ml/day</td></tr>
              <tr><td>Amino Acids</td><td>{fmt(d.aaGrams, 1)}</td><td>g/day</td></tr>
              <tr><td>Intralipid</td><td>{fmt(d.ilGrams, 1)}</td><td>g/day</td></tr>
              <tr><td>Intralipid Volume</td><td>{fmt(d.ilVol, 1)}</td><td>ml/day</td></tr>
              <tr><td>Dextrose</td><td>{fmt(d.dxGrams, 2)}</td><td>g/day</td></tr>
            </tbody>
          </table>
        </div>

        <div className="ot-section">
          <div className="ot-section-title" style={{ background: 'var(--teal)' }}>Electrolytes</div>
          <table className="ot-table">
            <tbody>
              <tr><td>Sodium Chloride (NaCl)</td><td>{fmt(d.nacl * d.W, 2)}</td><td>mEq/day</td></tr>
              <tr><td>Sodium Phosphate</td><td>{fmt(d.naph * d.W, 2)}</td><td>mmol/day</td></tr>
              <tr><td>Sodium Acetate</td><td>{fmt(d.naac * d.W, 2)}</td><td>mEq/day</td></tr>
              <tr><td>Potassium Chloride (KCl)</td><td>{fmt(d.kcl * d.W, 2)}</td><td>mEq/day</td></tr>
              <tr><td>Potassium Phosphate</td><td>{fmt(d.kph * d.W, 2)}</td><td>mmol/day</td></tr>
            </tbody>
          </table>
        </div>

        <div className="ot-section">
          <div className="ot-section-title" style={{ background: 'var(--purple)' }}>Minerals</div>
          <table className="ot-table">
            <tbody>
              <tr><td>Calcium</td><td>{fmt(d.ca * d.W, 2)}</td><td>mmol/day</td></tr>
              <tr><td>Magnesium</td><td>{fmt(d.mg * d.W, 2)}</td><td>mEq/day</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={() => window.print()}
            style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}
