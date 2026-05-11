import type { TPNData, TPNInputs } from './types';

export function calculate(p: TPNInputs): TPNData {
  const { W, fluid, AA_DOSE, IL_DOSE, gir, nacl, naac, naph, kcl, kph, ca, phos, mg } = p;

  const totalVol   = fluid * W;
  const aaGrams    = AA_DOSE * W;
  const aaVol      = aaGrams / 0.10;
  const ilGrams    = IL_DOSE * W;
  const ilVol      = ilGrams / 0.20;
  const dxVol      = totalVol - aaVol - ilVol;
  const combinedVol = aaVol + dxVol;
  const dxGrams    = gir * W * 60 * 24 / 1000;
  const dxConc     = (dxGrams / combinedVol) * 100;

  const totalHr    = totalVol    / 24;
  const aaHr       = aaVol       / 24;
  const ilHr       = ilVol       / 24;
  const dxHr       = dxVol       / 24;
  const combinedHr = combinedVol / 24;

  const calAA  = aaGrams * 4;
  const calIL  = ilVol   * 2;
  const calDx  = dxGrams * 3.4;
  const calTot = calAA + calIL + calDx;

  const totalNa = (nacl * W) + (naac * W) + (naph * W * 2);
  const totalK  = (kcl  * W) + (kph  * W);

  return {
    ...p,
    totalVol, aaVol, aaGrams, ilVol, ilGrams,
    dxVol, dxGrams, combinedVol, dxConc,
    totalHr, aaHr, ilHr, dxHr, combinedHr,
    calAA, calIL, calDx, calTot,
    totalNa, totalK,
  };
}

export function fmt(n: number, d = 1): string {
  return Number(n.toFixed(d)).toString();
}
