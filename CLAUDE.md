# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint check
```

No test suite exists.

## Architecture

Next.js 16 App Router, fully client-side — no server actions, no API routes, no database. All state lives in the browser.

### Routes

| Path | Purpose |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | Login + register tabs; redirects to `/calculator` on success |
| `/calculator` | Main TPN calculator (auth-guarded) |
| `/admin` | Admin panel with its own separate auth |

### Auth model (`lib/auth.ts`)

- **Users** stored in `localStorage` (`tpn_users`) as a JSON array of `User` objects
- **User session** stored in `sessionStorage` (`tpn_session`) — cleared on tab close
- **Admin session** stored in `sessionStorage` (`tpn_admin`) — separate from user session
- Admin credentials are hardcoded constants: `ADMIN_USERNAME` / `ADMIN_PASS_RAW`
- New registrations have `status: 'pending'` until an admin approves them at `/admin`
- The calculator page checks `getSession()` on mount and redirects to `/login` if absent

### Calculation engine (`lib/calculations.ts`)

Pure function `calculate(inputs: TPNInputs): TPNData` — no side effects. The clinical formulas are:

- AA volume = `(AA_DOSE × W) / 0.10` (10% Trophamine)
- IL volume = `(IL_DOSE × W) / 0.20` (20% Intralipid)
- Dextrose grams = `GIR × W × 60 × 24 / 1000`
- Dextrose volume = `totalVol − aaVol − ilVol`
- Dextrose concentration = `(dxGrams / (aaVol + dxVol)) × 100`
- Calories: AA = 4 kcal/g, IL = 2 kcal/ml, Dextrose = 3.4 kcal/g
- Total sodium = `(nacl + naac) × W + naph × W × 2` (NaPhos contributes 2 mEq Na per mmol)

Change these formulas only with clinical justification.

### Components

- `DashboardModal` — **loaded with `dynamic(..., { ssr: false })`** because Chart.js requires the browser DOM. Do not remove the `ssr: false` flag.
- `AspenModal` — static reference table, no data dependency
- `OrderTableModal` — printable order summary from `TPNData`

### Styling

All styles are in `app/globals.css` — a single flat stylesheet with CSS custom properties (`--blue`, `--green`, etc.). Tailwind is imported but only used for the base reset; all layout uses hand-written CSS classes. Do not introduce Tailwind utility classes on elements; add new rules to `globals.css` instead.

Key layout classes: `.auth-bar` / `.user-chip` / `.btn-logout` for the top user bar; `.card` for content sections; `.site-header` / `.logo-row` for the page header.

### Images

`public/1.png` (Alahsa Health Cluster) and `public/2.png` (King Faisal General Hospital) are referenced by all page headers. They must stay in `public/`.
