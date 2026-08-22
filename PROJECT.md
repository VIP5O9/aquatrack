# Project: Aqua Track UI/UX Redesign and Front-End Polish

## Architecture
Aqua Track is a Progressive Web Application (PWA) built with React 19, Vite, Tailwind CSS v4, Zustand, Recharts, and IndexedDB with offline outbox synchronization.
- **Visual Design**: Apple Human Interface Guidelines for Web (translucent glassmorphism, multi-tiered depth hierarchy, optical rim lighting, optical typography) and Emil Kowalski's Design Engineering standards (tactile press states, spring cubic-bezier curves).
- **Data Flow**: Pure calculation engine (`src/lib/metrics.js`) -> Zustand Store (`src/store/useStore.js` with `useEtat()` shallow selector) -> React UI components & visualizers.
- **Persistence**: IndexedDB (`kiosque-eau`) with transactional outbox queue and pull protection.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-tiered Surface & Glass Token System | CSS variables for `--fond`, `--surface`, `--surface-elevated`, `--glass-material`, `--border-subtle`, `--rim-light`, `--hero-gradient` in light & dark modes | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Optical Borders & Rim Light Highlights | 1px sub-pixel borders, inset rim highlights (`box-shadow: inset 0 1px 0 0 ...`) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Spring Easing & Motion Curve Tokens | Emil Kowalski animation framework (`cubic-bezier(0.23, 1, 0.32, 1)` and `cubic-bezier(0.32, 0.72, 0, 1)`) | M1 | ORIGINAL_REQUEST §R2 |
| 4 | Tactile Micro-Interactions Framework | Global `:active { transform: scale(0.97); }` press feedback across interactive elements | M1 | ORIGINAL_REQUEST §R2 |
| 5 | Glassmorphic Navigation Shell | Translucent `BottomNav.jsx` & `BarreLaterale.jsx` with `backdrop-filter: blur(20px) saturate(180%)` | M2 | ORIGINAL_REQUEST §R1, R3 |
| 6 | Translucent Header (`EnTete.jsx`) | Glassmorphic sticky header with blur, typography hierarchy, and status badges | M2 | ORIGINAL_REQUEST §R1, R3 |
| 7 | Fluid Splash Screen (`Splash.jsx`) | Engaging brand splash with fluid water iconography, glowing gradients, and tactile launch | M2 | ORIGINAL_REQUEST §R3 |
| 8 | Gesture-Ready Sheet Container (`Feuille.jsx`, `GestionnaireFeuille.jsx`) | Smooth velocity-based drawer on mobile, centered glass modal on desktop, backdrop blur | M2 | ORIGINAL_REQUEST §R2, R3 |
| 9 | Shared Primitives Polish | Buttons, cards, badges, pills, dialogs, image viewer (`Recus.jsx`, `VisionneuseImage.jsx`) | M2 | ORIGINAL_REQUEST §R1, R2 |
| 10 | Dashboard Hero Card (`CarteHero.jsx`) | Deep aqua gradient hero card with glowing metric typography and rapid action triggers | M3 | ORIGINAL_REQUEST §R3 |
| 11 | Dashboard Metrics & Stat Cards (`CarteStat.jsx`, `ComparaisonRevenus.jsx`) | Sleek comparison badges, delta chips, and tactile cards | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Journal Feed & Entry Rows (`Journal.jsx`, `LigneJournal.jsx`, `LigneApprovisionnement.jsx`) | Chronological timeline, category badge tags, receipt preview thumbnails, ripple press | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Interactive Calendar Grid (`VueCalendrier.jsx`, `FiltresJournal.jsx`) | Fluid month grid with intuitive delivery/sales markers and date filters | M3 | ORIGINAL_REQUEST §R3 |
| 14 | Analytiques Dashboard (`Analytiques.jsx`) | Responsive analytics layout, period selectors, and summary cards | M4 | ORIGINAL_REQUEST §R3 |
| 15 | Recharts Visualizers Polish (`GrapheRevenus.jsx`, `GraphePrixAppro.jsx`, `DonutCategories.jsx`) | Smooth gradient fills, customized frosted glass tooltips (`InfoBulle`), crisp axes | M4 | ORIGINAL_REQUEST §R3 |
| 16 | FIFO Delivery Lot Tracking (`SuiviLots.jsx`) | Illuminated progress bars, depletion visual cues, and unit cost timeline | M4 | ORIGINAL_REQUEST §R3 |
| 17 | Run-Out Forecast Visualizer (`CartePrevision.jsx`, `GrapheSemaine.jsx`, `BarreSplit.jsx`) | Solid/dashed prediction curves, 80% confidence interval, dot matrix weekly chart | M4 | ORIGINAL_REQUEST §R3 |
| 18 | Apple-Style Settings Groups (`Reglages.jsx`, `LigneReglage.jsx`) | Grouped inset lists, smooth toggle switches, navigation chevrons, master-detail rail | M5 | ORIGINAL_REQUEST §R3 |
| 19 | Security, PIN & Account Sections (`SectionCompte.jsx`, `SectionSecurite.jsx`, `PaveCode.jsx`) | Tactile 4-dot numpad with shake animations, biometric toggle, cloud sync status | M5 | ORIGINAL_REQUEST §R3 |
| 20 | Action Sheets & Data Input Forms (`FeuilleCloture.jsx`, `FeuilleDepense.jsx`, `FeuilleExport.jsx`) | Dynamic numpad/keypad, instant camera receipt drop zone, CSV/JSON export tiles | M5 | ORIGINAL_REQUEST §R3 |
| 21 | Business Logic & Offline Fidelity Maintenance | 100% mathematical fidelity in `metrics.js`, IndexedDB outbox in `db.js`, French & HTG | M1-M6 | ORIGINAL_REQUEST §R4 |
| 22 | Comprehensive Verification & Adversarial Polish | 121+ unit tests passing, production build, responsive layout, E2E test suite | M6 | ORIGINAL_REQUEST §Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design Tokens, CSS Architecture & Motion Foundations | `src/styles/tokens.css`, `src/styles/index.css`, `src/App.css` | none | COMPLETED |
| M2 | Navigation, Shell, Splash & Shared Core Components | `BottomNav.jsx`, `BarreLaterale.jsx`, `EnTete.jsx`, `Splash.jsx`, `Feuille.jsx`, `GestionnaireFeuille.jsx`, `Recus.jsx`, `VisionneuseImage.jsx`, `Carte.jsx`, `Badge.jsx` | M1 | COMPLETED |
| M3 | Dashboard & Journal Page Experience | `Dashboard.jsx`, `CarteHero.jsx`, `CarteStat.jsx`, `ComparaisonRevenus.jsx`, `Journal.jsx`, `VueCalendrier.jsx`, `LigneJournal.jsx`, `LigneApprovisionnement.jsx`, `FiltresJournal.jsx` | M1, M2 | COMPLETED |
| M4 | Analytiques & Advanced Recharts Visualizers | `Analytiques.jsx`, `CartePrevision.jsx`, `SuiviLots.jsx`, `GrapheRevenus.jsx`, `GraphePrixAppro.jsx`, `DonutCategories.jsx`, `GrapheSemaine.jsx`, `BarreSplit.jsx` | M1, M2 | COMPLETED |
| M5 | Réglages, Security, Sheets & Action Modals | `Reglages.jsx`, `LigneReglage.jsx`, `SectionCompte.jsx`, `SectionSecurite.jsx`, `PaveCode.jsx`, `ListeReordonnable.jsx`, `FeuilleCloture.jsx`, `FeuilleDepense.jsx`, `FeuilleExport.jsx`, `FeuilleLot.jsx`, `FeuillePeriode.jsx` | M1, M2 | COMPLETED |
| M6 | Final Verification: 100% E2E Test Suite & Adversarial Polish | E2E suite validation (Tiers 1-4), Vitest suite (280 tests), build verification, Tier 5 adversarial review | M1-M5 | COMPLETED |

## Interface Contracts
### Design Tokens ↔ Components
- Multi-tier surfaces: `var(--fond)`, `var(--surface)`, `var(--surface-elevated)`, `var(--glass-material)`, `var(--border-subtle)`, `var(--rim-light)`, `var(--hero-gradient)`
- Easing: `var(--transition-ui)` (`cubic-bezier(0.23, 1, 0.32, 1)`), `var(--transition-tiroir)` (`cubic-bezier(0.32, 0.72, 0, 1)`)
- Glass class: `.effet-verre`, `.effet-verre-subtil`, `.effet-verre-elevated`
- Tactile class: `.tactile-press` (`:active { transform: scale(0.97); }`)

### Metrics Engine ↔ UI Components
- `useEtat()` selector in `src/store/useStore.js` must remain untouched in contract.
- Calculations in `src/lib/metrics.js` (`coutMoyenPondere`, `suiviApprovisionnements`, `beneficeNet`, `margeActuelle`, `previsionMois`, `ecartCaisse`) must remain 100% pure and bit-for-bit identical.
- Currency formatting must exclusively use `formatHTG()` from `src/lib/format.js`.

## Code Layout
```
src/
├── styles/
│   ├── tokens.css       # Surface tokens, light/dark themes, rim lights, aqua gradients
│   └── index.css        # Global CSS, typography, glass utilities, Kowalski easings
├── pages/
│   ├── Splash.jsx       # PWA Splash Screen
│   ├── Dashboard.jsx    # Hero card, stat comparisons, quick actions
│   ├── Analytiques.jsx  # Recharts graphs, FIFO lots, forecasts
│   ├── Journal.jsx      # Chronological timeline, calendar view, filters
│   └── Reglages.jsx     # Grouped settings, PIN security, export
├── components/
│   ├── BottomNav.jsx    # Mobile glass bottom navigation
│   ├── BarreLaterale.jsx# Desktop glass side navigation
│   ├── EnTete.jsx       # Glass header
│   ├── Feuille.jsx      # Gesture-ready bottom sheet / modal
│   ├── CarteHero.jsx    # Glowing aqua gradient hero card
│   ├── CarteStat.jsx    # Metric comparison cards
│   ├── SuiviLots.jsx    # Illuminated FIFO lot tracking
│   ├── CartePrevision.jsx # Recharts prediction curves
│   ├── Graphe*.jsx      # Recharts revenue, costs, donut visualizers
│   ├── PaveCode.jsx     # Tactile PIN keypad
│   └── ...
├── lib/
│   ├── metrics.js       # Pure domain calculation engine (IMMUTABLE)
│   ├── db.js            # IndexedDB & transactional outbox (IMMUTABLE)
│   └── format.js        # Haitian Gourde & French date formatting
└── store/
    └── useStore.js      # Zustand state store
```
