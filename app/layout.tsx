import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neonatal TPN Calculator',
  description: 'Preterm & Term Newborn Parenteral Nutrition Calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}<Analytics /><SpeedInsights /></body>
    </html>
  );
}
