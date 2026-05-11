export interface User {
  id: number;
  name: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Session {
  userId: number;
  name: string;
  username: string;
  role: 'user' | 'admin';
}

export interface TPNInputs {
  W: number;
  fluid: number;
  AA_DOSE: number;
  IL_DOSE: number;
  gir: number;
  nacl: number;
  naac: number;
  naph: number;
  kcl: number;
  kph: number;
  ca: number;
  phos: number;
  mg: number;
}

export interface TPNData extends TPNInputs {
  totalVol: number;
  aaVol: number;
  aaGrams: number;
  ilVol: number;
  ilGrams: number;
  dxVol: number;
  dxGrams: number;
  combinedVol: number;
  dxConc: number;
  totalHr: number;
  aaHr: number;
  ilHr: number;
  dxHr: number;
  combinedHr: number;
  calAA: number;
  calIL: number;
  calDx: number;
  calTot: number;
  totalNa: number;
  totalK: number;
}
