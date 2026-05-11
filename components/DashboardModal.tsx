'use client';
import { useEffect, useRef } from 'react';
import type { TPNData } from '@/lib/types';
import { fmt } from '@/lib/calculations';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend,
  ChartDataLabels,
);

const BLUE = '#1a6fc4', AMBER = '#b45309', PURPLE = '#6d28d9',
      GREEN = '#1a8754', TEAL = '#0f766e', RED = '#b91c1c';

interface Props { open: boolean; onClose: () => void; data: TPNData | null; }

export default function DashboardModal({ open, onClose, data: d }: Props) {
  const prevOpen = useRef(false);

  useEffect(() => { prevOpen.current = open; }, [open]);

  if (!open || !d) return null;

  const girColor = d.gir < 4 ? AMBER : d.gir > 8 ? RED : GREEN;

  return (
    <div className="dash-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dash-modal">
        <div className="dash-modal-header">
          <div>
            <h3>📊 TPN Dashboard</h3>
            <p>Visual summary of all components</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* KPI strip */}
        <div className="dash-kpi-strip">
          <div className="dash-kpi"><div className="kv">{fmt(d.fluid, 0)}</div><div className="kl">Total Vol (ml/kg/day)</div></div>
          <div className="dash-kpi"><div className="kv">{fmt(d.calTot / d.W, 0)}</div><div className="kl">Total kcal/kg/day</div></div>
          <div className="dash-kpi"><div className="kv">{fmt(d.gir, 2)}</div><div className="kl">GIR (mg/kg/min)</div></div>
          <div className="dash-kpi"><div className="kv">{fmt(d.AA_DOSE, 1)}</div><div className="kl">Amino Acids (g/kg/day)</div></div>
          <div className="dash-kpi"><div className="kv">{fmt(d.IL_DOSE, 1)}</div><div className="kl">Intralipid (g/kg/day)</div></div>
          <div className="dash-kpi"><div className="kv">{fmt(d.dxConc, 1)}%</div><div className="kl">Dextrose (D__W %)</div></div>
        </div>

        <div className="dash-grid">
          {/* 1. Volume Distribution */}
          <div className="dash-card">
            <h4>Volume Distribution (ml/day)</h4>
            <Bar
              data={{
                labels: ['TPN (AA + Dextrose)', 'Intralipid'],
                datasets: [{ data: [d.combinedVol, d.ilVol], backgroundColor: [BLUE + 'cc', AMBER + 'cc'], borderColor: [BLUE, AMBER], borderWidth: 2, borderRadius: 8 }],
              }}
              options={{
                indexAxis: 'y',
                plugins: {
                  legend: { display: false },
                  datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toFixed(1) + ' ml', font: { weight: 'bold', size: 12 }, color: '#374151' },
                },
                scales: { x: { beginAtZero: true, ticks: { callback: (v) => v + ' ml' } }, y: { grid: { display: false } } },
                layout: { padding: { right: 60 } },
              }}
            />
          </div>

          {/* 2. Caloric Breakdown */}
          <div className="dash-card">
            <h4>Caloric Breakdown (kcal)</h4>
            <Bar
              data={{
                labels: ['Amino Acids', 'Intralipid', 'Dextrose'],
                datasets: [{ data: [d.calAA, d.calIL, d.calDx], backgroundColor: [BLUE + 'cc', AMBER + 'cc', PURPLE + 'cc'], borderColor: [BLUE, AMBER, PURPLE], borderWidth: 2, borderRadius: 8 }],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  datalabels: { anchor: 'end', align: 'end', formatter: (v: number) => v.toFixed(0) + ' kcal', font: { weight: 'bold', size: 11 }, color: '#374151' },
                },
                scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
                layout: { padding: { top: 24 } },
              }}
            />
          </div>

          {/* 3. Macronutrients */}
          <div className="dash-card">
            <h4>Macronutrients (g/kg/day)</h4>
            <Bar
              data={{
                labels: ['Amino Acids', 'Intralipid', 'Dextrose'],
                datasets: [{ label: 'g/kg/day', data: [d.AA_DOSE, d.IL_DOSE, +(d.dxGrams / d.W).toFixed(2)], backgroundColor: [BLUE, AMBER, PURPLE], borderRadius: 6 }],
              }}
              options={{
                plugins: { legend: { display: false }, datalabels: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'g/kg/day', font: { size: 10 } } }, x: { grid: { display: false } } },
              }}
            />
          </div>

          {/* 4. GIR (mixed: bar + line references) */}
          <div className="dash-card">
            <h4>Glucose Infusion Rate (mg/kg/min) · target 4–8</h4>
            <Chart
              type="bar"
              data={{
                labels: ['GIR'],
                datasets: [
                  { type: 'bar' as const, label: 'GIR', data: [d.gir], backgroundColor: girColor + '33', borderColor: girColor, borderWidth: 2, borderRadius: 6 },
                  { type: 'line' as const, label: 'Low target (4)',  data: [4], borderColor: '#9ca3af', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false },
                  { type: 'line' as const, label: 'High target (8)', data: [8], borderColor: '#9ca3af', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false },
                ],
              }}
              options={{
                indexAxis: 'y',
                plugins: { legend: { display: false }, datalabels: { display: false } },
                scales: { x: { min: 0, max: 14, title: { display: true, text: 'mg/kg/min', font: { size: 10 } } }, y: { grid: { display: false } } },
              }}
            />
          </div>

          {/* 5. Electrolytes */}
          <div className="dash-card">
            <h4>Electrolytes — Total/day</h4>
            <Bar
              data={{
                labels: ['NaCl', 'Na Acetate', 'Na Phosphate', 'KCl', 'K Phosphate'],
                datasets: [{ label: 'Total/day', data: [d.nacl*d.W, d.naac*d.W, d.naph*d.W, d.kcl*d.W, d.kph*d.W], backgroundColor: [BLUE, '#2563eb', '#3b82f6', TEAL, '#14b8a6'], borderRadius: 5 }],
              }}
              options={{
                indexAxis: 'y',
                plugins: { legend: { display: false }, datalabels: { display: false } },
                scales: { x: { beginAtZero: true, max: 10, title: { display: true, text: 'mEq / mmol per day', font: { size: 10 } } }, y: { grid: { display: false } } },
              }}
            />
          </div>

          {/* 6. Minerals */}
          <div className="dash-card">
            <h4>Minerals — Total/day</h4>
            <Bar
              data={{
                labels: ['Calcium', 'Phosphorus', 'Magnesium'],
                datasets: [{ label: 'Total/day', data: [d.ca*d.W, (d.phos + d.naph + d.kph)*d.W, d.mg*d.W], backgroundColor: [PURPLE, '#7c3aed', '#a78bfa'], borderRadius: 5 }],
              }}
              options={{
                indexAxis: 'y',
                plugins: { legend: { display: false }, datalabels: { display: false } },
                scales: { x: { beginAtZero: true, max: 10, title: { display: true, text: 'mmol / mEq per day', font: { size: 10 } } }, y: { grid: { display: false } } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
