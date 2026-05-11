'use client';

interface Props { open: boolean; onClose: () => void; }

export default function AspenModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3>ASPEN Recommended Doses — Neonatal PN</h3>
            <p>American Society for Parenteral and Enteral Nutrition · 2023 Preterm Guidelines</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-section">
          <h4>Fluids</h4>
          <table className="ref-table">
            <thead><tr><th>Day of Life</th><th>Preterm &lt;1000 g</th><th>Preterm 1000–2500 g</th><th>Term &gt;2500 g</th></tr></thead>
            <tbody>
              <tr><td>Day 1</td><td>80–100 ml/kg</td><td>60–80 ml/kg</td><td>60 ml/kg</td></tr>
              <tr><td>Day 2–3</td><td>Advance 20 ml/kg/day</td><td>Advance 20 ml/kg/day</td><td>Advance 20 ml/kg/day</td></tr>
              <tr><td>Maintenance goal</td><td>130–150 ml/kg</td><td>130–150 ml/kg</td><td>140–170 ml/kg</td></tr>
            </tbody>
          </table>
        </div>

        <div className="modal-section">
          <h4>Macronutrients</h4>
          <table className="ref-table">
            <thead><tr><th>Nutrient</th><th>Starting dose</th><th>Goal dose</th><th>Max</th></tr></thead>
            <tbody>
              <tr><td>Amino Acids (preterm)</td><td>1.5–2 g/kg/day</td><td>3–3.5 g/kg/day</td><td>4 g/kg/day</td></tr>
              <tr><td>Amino Acids (term)</td><td>1–2 g/kg/day</td><td>2.5–3 g/kg/day</td><td>3.5 g/kg/day</td></tr>
              <tr><td>Intralipid</td><td>1–2 g/kg/day</td><td>3 g/kg/day</td><td>4 g/kg/day</td></tr>
              <tr><td>GIR</td><td>4–6 mg/kg/min</td><td>8–12 mg/kg/min</td><td>12–14 mg/kg/min</td></tr>
            </tbody>
          </table>
        </div>

        <div className="modal-section">
          <h4>Electrolytes</h4>
          <table className="ref-table">
            <thead><tr><th>Electrolyte</th><th>Preterm</th><th>Term</th><th>Unit</th></tr></thead>
            <tbody>
              <tr><td>Sodium (total)</td><td>2–5</td><td>2–5</td><td>mEq/kg/day</td></tr>
              <tr><td>Potassium (total)</td><td>2–4</td><td>2–3</td><td>mEq/kg/day</td></tr>
            </tbody>
          </table>
        </div>

        <div className="modal-section">
          <h4>Minerals</h4>
          <table className="ref-table">
            <thead><tr><th>Mineral</th><th>Initial (first 48 h)</th><th>Goal</th><th>Unit</th></tr></thead>
            <tbody>
              <tr><td>Calcium</td><td>0.8–1</td><td>1.25–2</td><td>mmol/kg/day</td></tr>
              <tr><td>Phosphorus</td><td>1</td><td>1.25–2</td><td>mmol/kg/day</td></tr>
              <tr><td>Magnesium</td><td>0.25–0.5</td><td>0.25–0.5</td><td>mEq/kg/day</td></tr>
            </tbody>
          </table>
        </div>

        <div className="modal-section">
          <h4>Energy Targets</h4>
          <table className="ref-table">
            <thead><tr><th>Phase</th><th>Target</th></tr></thead>
            <tbody>
              <tr><td>First 4 days</td><td>40–60 kcal/kg/day</td></tr>
              <tr><td>Maintenance (stable)</td><td>75–120 kcal/kg/day</td></tr>
              <tr><td>Ca : P molar ratio</td><td>0.8–1.3 : 1 (optimal bone mineralisation)</td></tr>
            </tbody>
          </table>
        </div>

        <div className="modal-source">
          Source: ASPEN Guidelines for Parenteral Nutrition in Preterm Infants (JPEN 2023) &amp;
          ESPGHAN/ESPEN/ESPR Pediatric PN Guidelines. For full guidance refer to the original publications.
        </div>
      </div>
    </div>
  );
}
