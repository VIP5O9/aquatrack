# Aqua Track — 4-Tier E2E Test Infrastructure Specification (`TEST_INFRA.md`)

## Executive Summary & Architecture Overview

Aqua Track is a mission-critical Progressive Web Application (PWA) designed for water kiosk operators in Haiti. Operating under challenging conditions—including intermittent electricity, mobile network blackouts, varied payment methods (Cash and MonCash), and fluctuating water delivery costs—the system demands absolute data integrity, zero mathematical drift, and resilient offline-first persistence.

This document establishes the comprehensive **4-Tier Test Infrastructure** for Aqua Track, mapping 100% of the 22 inventoried features defined in `PROJECT.md` across:
- **Tier 1: Feature Coverage** (>=5 test cases per feature across all 22 features = 110+ feature tests)
- **Tier 2: Boundary & Corner Cases** (>=5 boundary cases per feature across all 22 features = 110+ boundary tests)
- **Tier 3: Cross-Feature Combinations** (Pairwise and multi-feature interaction matrix)
- **Tier 4: Real-World Application Scenarios** (End-to-end operational water kiosk lifecycles)

---

## Complete Feature Inventory (from `PROJECT.md`)

| # | Feature Code | Feature Name | Core Modules / Files |
|---|---|---|---|
| 1 | `F01-TOKENS` | Multi-tiered Surface & Glass Token System | `src/styles/tokens.css`, `src/lib/theme.js` |
| 2 | `F02-OPTICAL` | Optical Borders & Rim Light Highlights | `src/styles/tokens.css`, `src/styles/index.css` |
| 3 | `F03-EASING` | Spring Easing & Motion Curve Tokens | `src/styles/tokens.css`, `src/styles/index.css` |
| 4 | `F04-TACTILE` | Tactile Micro-Interactions Framework | `src/styles/index.css`, `src/styles/tokens.css` |
| 5 | `F05-NAV-SHELL` | Glassmorphic Navigation Shell | `src/components/BottomNav.jsx`, `src/components/BarreLaterale.jsx` |
| 6 | `F06-HEADER` | Translucent Header & Salutation System | `src/components/EnTete.jsx`, `src/lib/format.js` |
| 7 | `F07-SPLASH` | Fluid Splash Screen & Brand Launch | `src/pages/Splash.jsx`, `src/App.jsx` |
| 8 | `F08-SHEET` | Gesture-Ready Sheet & Modal Container | `src/components/Feuille.jsx`, `src/components/GestionnaireFeuille.jsx` |
| 9 | `F09-PRIMITIVES`| Shared Primitives & Haitian Formatters | `src/lib/format.js`, `src/components/Recus.jsx`, `Carte.jsx`, `Badge.jsx` |
| 10| `F10-HERO-CARD` | Dashboard Hero Card & Metric Typography | `src/components/CarteHero.jsx`, `src/pages/Dashboard.jsx` |
| 11| `F11-STAT-CARDS`| Dashboard Metrics & Stat Comparisons | `src/components/CarteStat.jsx`, `src/components/ComparaisonRevenus.jsx` |
| 12| `F12-JOURNAL` | Journal Feed, Entry Rows & Attribution | `src/pages/Journal.jsx`, `src/components/LigneJournal.jsx` |
| 13| `F13-CALENDAR` | Interactive Calendar Grid & Date Filters | `src/components/VueCalendrier.jsx`, `src/lib/format.js` |
| 14| `F14-ANALYTICS` | Analytiques Dashboard & Period Switcher | `src/pages/Analytiques.jsx`, `src/lib/metrics.js` |
| 15| `F15-RECHARTS` | Recharts Visualizers & Frosted Tooltips | `src/components/GrapheRevenus.jsx`, `GraphePrixAppro.jsx`, `DonutCategories.jsx` |
| 16| `F16-FIFO-LOTS` | FIFO Delivery Lot Tracking Engine | `src/lib/metrics.js` (`suiviApprovisionnements`), `SuiviLots.jsx` |
| 17| `F17-FORECAST` | Run-Out Forecast & Stock Depletion | `src/lib/metrics.js` (`previsionRupture`), `CartePrevision.jsx` |
| 18| `F18-SETTINGS` | Apple-Style Settings Groups & Parameters| `src/pages/Reglages.jsx`, `src/components/LigneReglage.jsx` |
| 19| `F19-SECURITY` | Security, PBKDF2 PIN & Lockout Timing | `src/lib/verrou.js`, `src/components/PaveCode.jsx`, `SectionSecurite.jsx` |
| 20| `F20-ACTIONS` | Action Sheets, Cash Closures & Exports | `src/components/FeuilleCloture.jsx`, `FeuilleDepense.jsx`, `FeuilleExport.jsx` |
| 21| `F21-OFFLINE-DB`| Business Logic & Transactional Outbox | `src/lib/db.js`, `src/lib/sync.js`, `src/store/useStore.js` |
| 22| `F22-INTEGRITY` | Comprehensive Verification & Data Integrity| `src/lib/metrics.js`, `src/lib/echange.js`, `src/lib/csv.js` |

---

## Tier 1: Feature Coverage Matrix (>= 5 Tests Per Feature = 110 Cases)

### Feature 1: Multi-tiered Surface & Glass Token System (`F01-TOKENS`)
- **T1.F01.01 (Light Mode Surface Hierarchy)**: Verify `--fond` (#f3f3f3), `--surface` (#ffffff), `--surface-doux` (#f3f3f3), and `--bordure` (#e6e6e6) are declared in root tokens.
- **T1.F01.02 (Dark Mode Surface Elevation)**: Verify dark mode overrides (`:root[data-theme='dark']`) set `--fond` (#0f0f12), `--surface` (#1a191f), `--surface-doux` (#26252c), and `--bordure` (#2e2d35).
- **T1.F01.03 (Aqua Accent Tokens)**: Verify `--accent` is `#2672dd` in light mode and `#5b9bf5` in dark mode for AA contrast compliance.
- **T1.F01.04 (Brand Theme Storage Sync)**: Verify `theme.lireMode()` defaults to `'system'`, persists changes to `localStorage['kiosque-theme']`, and applies `data-theme` attribute to `document.documentElement`.
- **T1.F01.05 (Data Color Transposition)**: Verify `couleurDonnees('#222026', true)` transposes dark brand ink to `#E8E8EA` and `#2672DD` to `#5B9BF5` when in dark mode.

### Feature 2: Optical Borders & Rim Light Highlights (`F02-OPTICAL`)
- **T1.F02.01 (Optical Border Token Mapping)**: Verify border variables and optical contrast styling across card containers.
- **T1.F02.02 (Hero Card Elevation Contrast)**: Verify hero container uses `--hero` token (#164E9E in light, #2f2d37 in dark) with white on-hero typography.
- **T1.F02.03 (Sub-pixel Card Shadow Tokens)**: Verify `--ombre-carte` provides subtle 1px elevation shadow (`0 1px 2px rgb(34 32 38 / 0.04)` in light, `0 1px 2px rgb(0 0 0 / 0.4)` in dark).
- **T1.F02.04 (Floating Modal Rim Shadow)**: Verify `--ombre-flottant` elevates modal sheets (`0 8px 24px ...`) above content backdrop.
- **T1.F02.05 (Backdrop Voile Token)**: Verify `--voile` scrim opacity provides backdrop isolation without washing out contrast.

### Feature 3: Spring Easing & Motion Curve Tokens (`F03-EASING`)
- **T1.F03.01 (Sheet Drawer Timing)**: Verify drawer animation utilizes smooth cubic-bezier easing with translateY entry.
- **T1.F03.02 (List Cascade Animation Stagger)**: Verify `.anim-liste` utilizes `cubic-bezier(0.16, 1, 0.3, 1)` with 28ms stagger intervals per index.
- **T1.F03.03 (Page View Transition)**: Verify `vue-entree` animation executes with 8px upward translation and 0.2s duration.
- **T1.F03.04 (Card Cascade Keyframes)**: Verify `.anim-cartes` applies stepped nth-child delays (45ms, 90ms, 135ms, 180ms, 215ms).
- **T1.F03.05 (Reduced Motion Media Query Compliance)**: Verify `@media (prefers-reduced-motion: reduce)` collapses durations to 0.01ms and iterations to 1.

### Feature 4: Tactile Micro-Interactions Framework (`F04-TACTILE`)
- **T1.F04.01 (Calendar Cell Active Scale)**: Verify `.case-cal:active` scales down to 0.95 for instant tactile response.
- **T1.F04.02 (Hover Elevation on Pointer Devices)**: Verify `@media (hover: hover)` applies translateY(-2px) and accent outline.
- **T1.F04.03 (Comfortable Touch Target Sizing)**: Verify `.cible-tactile` enforces minimum 44px x 44px dimensions.
- **T1.F04.04 (PIN Error Shake Animation)**: Verify `@keyframes secousse` executes bidirectional horizontal shake for failed PIN input.
- **T1.F04.05 (Scrollbar Concealment for Segment Pills)**: Verify `.defile-x` provides horizontal scrolling while concealing scrollbars.

### Feature 5: Glassmorphic Navigation Shell (`F05-NAV-SHELL`)
- **T1.F05.01 (Mobile Bottom Navigation Bar Items)**: Verify BottomNav renders links for Dashboard, Analytiques, Journal, and Réglages.
- **T1.F05.02 (Desktop Sidebar Integration)**: Verify BarreLaterale renders on widescreen viewports with full navigation hierarchy.
- **T1.F05.03 (Active Route Indicator)**: Verify current pathname matches active tab highlight.
- **T1.F05.04 (Quick-Action Center Trigger)**: Verify action button opens closure or expense action sheets.
- **T1.F05.05 (Responsive Layout Padding)**: Verify main content applies `--hauteur-nav` bottom padding on mobile and `pl-[260px]` on desktop.

### Feature 6: Translucent Header & Salutation System (`F06-HEADER`)
- **T1.F06.01 (Time-Dependent Salutation — Daytime)**: Verify `salutation(new Date('2026-07-20T10:00:00'))` returns `"Bonjour"`.
- **T1.F06.02 (Time-Dependent Salutation — Evening)**: Verify `salutation(new Date('2026-07-20T19:30:00'))` returns `"Bonsoir"`.
- **T1.F06.03 (Header User Name Binding)**: Verify header displays user name configured in settings (`reglages.nom_utilisateur`).
- **T1.F06.04 (Sync Badge State Display)**: Verify BadgeSync renders correct icon/text for `'local'`, `'en-cours'`, `'synchronise'`, and `'erreur'`.
- **T1.F06.05 (Manual Sync Trigger from Header)**: Verify clicking sync badge dispatches `synchroniserMaintenant()`.

### Feature 7: Fluid Splash Screen & Brand Launch (`F07-SPLASH`)
- **T1.F07.01 (Splash Route Detection)**: Verify route `/` renders Splash screen without top header or bottom navigation bar.
- **T1.F07.02 (Hero Water Icon & Branding)**: Verify Splash presents Aqua Track typography and water kiosk motif.
- **T1.F07.03 (App Launch Button)**: Verify pressing "Commencer" navigates to `/tableau-de-bord`.
- **T1.F07.04 (Cold Boot Initialization Gate)**: Verify App shows loading spinner while `pret === false`.
- **T1.F07.05 (First-Run Configuration Redirect)**: Verify unconfigured device redirects to `EcranConnexion`.

### Feature 8: Gesture-Ready Sheet & Modal Container (`F08-SHEET`)
- **T1.F08.01 (Opening Closure Sheet)**: Verify `ouvrirFeuille('cloture')` sets store `feuille.type = 'cloture'`.
- **T1.F08.02 (Opening Expense Sheet with Data)**: Verify `ouvrirFeuille('depense', { category_id: 'c1' })` populates initial payload.
- **T1.F08.03 (Sheet Closure & State Teardown)**: Verify `fermerFeuille()` resets store `feuille` to `null`.
- **T1.F08.04 (Backdrop Scrim Click Handling)**: Verify clicking backdrop scrim triggers `fermerFeuille()`.
- **T1.F08.05 (Escape Key Listener)**: Verify pressing `Escape` key dismisses active sheet container.

### Feature 9: Shared Primitives & Haitian Formatters (`F09-PRIMITIVES`)
- **T1.F09.01 (Currency Formatter `formatHTG`)**: Verify `formatHTG(1250)` returns `"1 250 HTG"` with narrow non-breaking space.
- **T1.F09.02 (Unit Price Formatter `formatPrix`)**: Verify `formatPrix(7.5)` returns `"7,50 HTG"`.
- **T1.F09.03 (Volume Formatter `formatGallons`)**: Verify `formatGallons(1)` returns `"1 gallon"` and `formatGallons(1200)` returns `"1 200 gallons"`.
- **T1.F09.04 (Percentage Formatter `formatPourcent`)**: Verify `formatPourcent(4.82, { signe: true })` returns `"+4,8 %"`.
- **T1.F09.05 (Masked Number Display)**: Verify amount masking displays fixed-width `"*******"`.

### Feature 10: Dashboard Hero Card & Metric Typography (`F10-HERO-CARD`)
- **T1.F10.01 (Net Profit Hero Calculation)**: Verify `beneficeNet(etat, moisCourant())` produces correct total on hero card.
- **T1.F10.02 (Tabular Numeral Typography)**: Verify hero numerals apply `.chiffre-hero` and `tabular-nums`.
- **T1.F10.03 (MonCash Breakdown Metric)**: Verify `splitPaiement(etat, moisCourant())` computes accurate Cash and MonCash proportions.
- **T1.F10.04 (Cumulative Net Trend Sparkline)**: Verify `serieNetteCumulee(etat, moisCourant())` generates daily progression points.
- **T1.F10.05 (Hero Quick-Action Navigation)**: Verify quick action buttons invoke corresponding sheet actions.

### Feature 11: Dashboard Metrics & Stat Comparisons (`F11-STAT-CARDS`)
- **T1.F11.01 (Gallons Sold Volume Card)**: Verify `gallonsVendus(etat, moisCourant())` sums all daily sales volumes.
- **T1.F11.02 (Current Unit Margin Metric)**: Verify `margeActuelle(etat)` computes accurate profit margin per gallon.
- **T1.F11.03 (Inventory Remaining Card)**: Verify `gallonsEnStock(etat)` evaluates total received minus total sold.
- **T1.F11.04 (Month-over-Month Delta Badge)**: Verify `variationPct(actuel, precedent)` renders signed trend chips.
- **T1.F11.05 (Discretion Mode Amount Masking)**: Verify toggling `basculerMontants()` conceals figures with `MONTANT_MASQUE`.

### Feature 12: Journal Feed, Entry Rows & Attribution (`F12-JOURNAL`)
- **T1.F12.01 (Chronological Timeline Sorting)**: Verify journal entries sort descending by timestamp.
- **T1.F12.02 (Daily Closure Row Presentation)**: Verify closure row displays date, gross revenue, volume, and MonCash breakdown.
- **T1.F12.03 (Expense Row Presentation)**: Verify expense row displays category pill, designation, quantity, and total.
- **T1.F12.04 (Author Attribution Binding)**: Verify entry displays `"Saisi par [Nom]"` when matching member `user_id`.
- **T1.F12.05 (Receipt Attachment Indicator)**: Verify camera receipt icon appears when receipts exist for a transaction.

### Feature 13: Interactive Calendar Grid & Date Filters (`F13-CALENDAR`)
- **T1.F13.01 (Monthly Date Grid Construction)**: Verify `VueCalendrier` generates correct days for selected month/year.
- **T1.F13.02 (Closure Indicator Dot Marker)**: Verify calendar days with registered closures display visual indicators.
- **T1.F13.03 (Delivery Water Drop Indicator)**: Verify calendar days with water deliveries display distinct marker pills.
- **T1.F13.04 (Calendar Day Selection Filter)**: Verify clicking a day filters journal entries to that specific date.
- **T1.F13.05 (Month Navigation Switcher)**: Verify advancing/retreating months updates active calendar window.

### Feature 14: Analytiques Dashboard & Period Switcher (`F14-ANALYTICS`)
- **T1.F14.01 (Period Switcher Options)**: Verify period options (`'mois'`, `'precedent'`, `'30j'`, `'tout'`) filter metrics correctly.
- **T1.F14.02 (Total Revenue Metric)**: Verify `totalRevenus(etat, periode)` sums all revenue within chosen date bounds.
- **T1.F14.03 (Total Expense Metric)**: Verify `totalDepenses(etat, periode)` sums all expenses within chosen date bounds.
- **T1.F14.04 (Expense Category Distribution `ouPartArgent`)**: Verify breakdown allocates costs into relative percentages.
- **T1.F14.05 (Daily Revenue & Volume Series `serieQuotidienne`)**: Verify continuous daily points generated with zero-fill for inactive days.

### Feature 15: Recharts Visualizers & Frosted Tooltips (`F15-RECHARTS`)
- **T1.F15.01 (Revenue Graph Dataset Transformer)**: Verify `GrapheRevenus` maps dates and revenues into Recharts curve format.
- **T1.F15.02 (Delivery Cost History Graph)**: Verify `GraphePrixAppro` formats supplier price history chronologically.
- **T1.F15.03 (Expense Category Donut Slices)**: Verify `DonutCategories` sorts top categories and groups smaller expenses into "Autres".
- **T1.F15.04 (Frosted Tooltip `InfoBulle` Content)**: Verify custom tooltip formats date, label, and HTG currency correctly.
- **T1.F15.05 (Day of Week Average Graph `GrapheSemaine`)**: Verify `moyennesParJourSemaine` computes 6-week day averages (Lundi-Dimanche).

### Feature 16: FIFO Delivery Lot Tracking Engine (`F16-FIFO-LOTS`)
- **T1.F16.01 (FIFO Exhaustion Sequence)**: Verify `suiviApprovisionnements(etat)` exhausts oldest lots before newer lots.
- **T1.F16.02 (Active Lot Remaining Volume)**: Verify partially depleted lots report exact remaining gallon balance.
- **T1.F16.03 (Exhausted Lot Depletion Tag)**: Verify fully consumed lots are marked `statut: 'epuise'`.
- **T1.F16.04 (Volume-Weighted Cost Calculation)**: Verify `coutMoyenPondere(etat, periode)` accurately weights lots by volume.
- **T1.F16.05 (Lot Detail Extraction)**: Verify `detailApprovisionnement(etat, lotId)` computes unit cost and depletion breakdown.

### Feature 17: Run-Out Forecast & Stock Depletion (`F17-FORECAST`)
- **T1.F17.01 (Days of Stock Remaining Metric)**: Verify `joursDeStock(etat)` divides remaining inventory by recent daily burn rate.
- **T1.F17.02 (Run-Out Date Prediction `previsionRupture`)**: Verify predicted stockout date projects forward based on 7-day velocity.
- **T1.F17.03 (Order Deadline Warning Buffer)**: Verify forecast signals replenishment order trigger based on `delaiCommande`.
- **T1.F17.04 (Forecast Trajectory Curve `seriePrevision`)**: Verify trajectory splits into historical actuals and forward projections.
- **T1.F17.05 (Monthly Revenue Run-Rate Projection `previsionMois`)**: Verify month-end financial forecast blends actuals with daily cadence.

### Feature 18: Apple-Style Settings Groups & Parameters (`F18-SETTINGS`)
- **T1.F18.01 (Water Sale Price Setting)**: Verify updating `prix_vente_gallon` modifies default calculation base.
- **T1.F18.02 (Truck Delivery Capacity Setting)**: Verify configuring `capacite_camion` (e.g. 1200 gal) updates default delivery forms.
- **T1.F18.03 (Water Meter Tracking Toggle)**: Verify enabling `compteur_actif` enables meter index delta calculation.
- **T1.F18.04 (Kiosk User Name Customization)**: Verify modifying `nom_utilisateur` updates interface salutations.
- **T1.F18.05 (Category Drag-and-Drop Reordering)**: Verify `reordonnerCategories` persists custom category ordering.

### Feature 19: Security, PIN & Account Sections (`F19-SECURITY`)
- **T1.F19.01 (PBKDF2 Key Derivation `preparerCode`)**: Verify PIN produces a 16-byte random salt and 256-bit hash.
- **T1.F19.02 (Constant-Time PIN Verification `verifierCode`)**: Verify valid PIN returns `true` and invalid PIN returns `false`.
- **T1.F19.03 (Inactivity Lockout Evaluation `doitVerrouiller`)**: Verify timeout locks application when elapsed time exceeds threshold.
- **T1.F19.04 (Cold Boot Lock Enforcement)**: Verify cold boot without background timestamp always enforces lock when PIN active.
- **T1.F19.05 (PIN Removal & State Reset)**: Verify `retirerVerrou()` clears PIN hash, salt, and unlocks store.

### Feature 20: Action Sheets, Cash Closures & Exports (`F20-ACTIONS`)
- **T1.F20.01 (Daily Closure Form Submission)**: Verify `cloturerJour` saves daily revenue, gallons, and MonCash amount.
- **T1.F20.02 (Expense Form Submission — Fixed vs Unitary)**: Verify `ajouterDepense` records unitary/forfait expenses.
- **T1.F20.03 (JSON Complete Backup Export)**: Verify `exporterJSON` serializes all tables, metadata, and receipt images.
- **T1.F20.04 (CSV Revenue & Expense Export)**: Verify `exporterRecettesCSV` and `exporterDepensesCSV` generate valid CSV.
- **T1.F20.05 (Excel XLSX Workbook Export)**: Verify `exporterExcel` packages multi-sheet workbook.

### Feature 21: Business Logic & Transactional Outbox (`F21-OFFLINE-DB`)
- **T1.F21.01 (Atomic Local Write + Outbox Enqueue)**: Verify write operations append corresponding outbox sequence.
- **T1.F21.02 (Outbox Pending Count Query `compterOutbox`)**: Verify pending counter reflects unsynced mutations.
- **T1.F21.03 (Outbox Queue Drain `retirerOutbox`)**: Verify acknowledged server sync removes processed sequences.
- **T1.F21.04 (Server Merge Protection for Dirty Rows)**: Verify `fusionnerDepuisServeur` does not overwrite local pending changes.
- **T1.F21.05 (Server State Adoption for Clean Rows)**: Verify `fusionnerDepuisServeur` adopts server values when no local outbox item exists.

### Feature 22: Comprehensive Verification & Data Integrity (`F22-INTEGRITY`)
- **T1.F22.01 (Logical Soft Delete Integrity)**: Verify soft-deleted items (`deleted: true`) are excluded from calculations.
- **T1.F22.02 (JSON Backup Restoration `importerJSON`)**: Verify restoring JSON replaces database state and clears outbox.
- **T1.F22.03 (CSV File Import Parsing)**: Verify `importerFichier` ingests CSV data and recreates missing categories.
- **T1.F22.04 (Meter Index Discrepancy Calculation `ecartCaisse`)**: Verify differences between physical meter and entered revenue are flagged.
- **T1.F22.05 (Demo Data Seeding & Isolation)**: Verify `genererDemo` populates 60 days of data and flags `donnees_demo = true`.

---

## Tier 2: Boundary, Corner & Edge Cases (>= 5 Tests Per Feature = 110 Cases)

### Feature 1: Multi-tiered Surface & Glass Token System (`F01-TOKENS`)
- **T2.F01.01 (Unrecognized Theme Fallback)**: Test `localStorage.setItem('kiosque-theme', 'invalid-theme')` falls back to `'system'`.
- **T2.F01.02 (Null / Empty Hex Transposition)**: Test `couleurDonnees(null, true)` and `couleurDonnees('', true)` return input without crashing.
- **T2.F01.03 (Case-Insensitive Hex Transposition)**: Test `couleurDonnees('#222026', true)` and `couleurDonnees('#222026', false)`.
- **T2.F01.04 (Rapid Consecutive Theme Toggles)**: Test switching theme 50 times in rapid succession produces clean final state.
- **T2.F01.05 (High-Contrast Theme Media Query)**: Test system `prefers-color-scheme` listener re-evaluates dynamically.

### Feature 2: Optical Borders & Rim Light Highlights (`F02-OPTICAL`)
- **T2.F02.01 (Zero-Dimension Viewport Border Clamp)**: Test rendering components inside minimal 320px viewport without horizontal overflow.
- **T2.F02.02 (Maximum Display Scaling 200%)**: Test sub-pixel 1px borders maintain optical clarity under high-DPI scaling.
- **T2.F02.03 (Transparent Inset Highlight Handling)**: Verify inset rim highlights on translucent surfaces do not compound opacity.
- **T2.F02.04 (Nested Glass Surface Layers)**: Test nesting glass cards within modal sheets preserves contrast ratios.
- **T2.F02.05 (Dark Mode Inset Border Visibility)**: Verify dark mode border contrast against #0F0F12 background.

### Feature 3: Spring Easing & Motion Curve Tokens (`F03-EASING`)
- **T2.F03.01 (Extreme Animation Index Overflow)**: Test `.anim-liste` with `--i` = 1,000 caps JS animation stagger without freezing UI.
- **T2.F03.02 (Rapid Route Thrashing)**: Test navigating between 5 routes in < 50ms does not leave dangling keyframe classes.
- **T2.F03.03 (Zero Duration Fallback on Reduced Motion)**: Test animations complete immediately when `prefers-reduced-motion` is active.
- **T2.F03.04 (Mid-Flight Drawer Dismissal)**: Test closing sheet modal while entry animation is running smoothly resets state.
- **T2.F03.05 (Negative Stagger Offset Prevention)**: Test `--i` negative or undefined defaults safely to 0.

### Feature 4: Tactile Micro-Interactions Framework (`F04-TACTILE`)
- **T2.F04.01 (Multi-Touch Pointer Collisions)**: Test multiple simultaneous pointerdown events on adjacent action buttons.
- **T2.F04.02 (Long Press Without Release)**: Test holding `:active` press state indefinitely does not distort component dimensions.
- **T2.F04.03 (Off-Element Touch Drag Release)**: Test pressing a button and dragging pointer out of bounds cleanly cancels action.
- **T2.F04.04 (Keypad Shake Animation Re-Triggering)**: Test sequential wrong PIN inputs re-trigger shake animation without UI freeze.
- **T2.F04.05 (Overflow Scroll Momentum in Pill Containers)**: Test rapid flick gesture on category pills with 50+ categories.

### Feature 5: Glassmorphic Navigation Shell (`F05-NAV-SHELL`)
- **T2.F05.01 (Unknown URL Route Wildcard)**: Test navigating to `/unknown-path-1234` cleanly redirects to `/tableau-de-bord`.
- **T2.F05.02 (Exact Boundary Viewport 1024px)**: Test resizing viewport exactly at 1023px vs 1024px switches BottomNav and BarreLaterale cleanly.
- **T2.F05.03 (Active Route with Query Parameters)**: Test navigating to `/journal?mois=2026-07` preserves active nav tab selection.
- **T2.F05.04 (Double Click on Active Navigation Tab)**: Test double-clicking active navigation tab does not trigger page reload or state reset.
- **T2.F05.05 (Navigation While Sheet Modal Open)**: Test triggering route change automatically dismisses active sheet container.

### Feature 6: Translucent Header & Salutation System (`F06-HEADER`)
- **T2.F06.01 (Exact 18:00:00 Salutation Boundary)**: Test `salutation(new Date('2026-07-20T17:59:59'))` vs `salutation(new Date('2026-07-20T18:00:00'))`.
- **T2.F06.02 (Empty / Whitespace User Name Fallback)**: Test `nom_utilisateur = "   "` displays `"Bonjour"` without dangling punctuation.
- **T2.F06.03 (Very Long User Name Truncation)**: Test user name with 100 characters truncates gracefully with ellipsis.
- **T2.F06.04 (Special Characters & Accents in User Name)**: Test user name `"Éléonore-Marie d'Haïti"` renders with UTF-8 fidelity.
- **T2.F06.05 (Rapid Sync Badge Click Spamming)**: Test clicking sync badge 10 times in 1 second triggers only one concurrent sync process.

### Feature 7: Fluid Splash Screen & Brand Launch (`F07-SPLASH`)
- **T2.F07.01 (Direct Deep Link Landing vs Splash)**: Test deep link to `/analytiques` renders dashboard when already configured.
- **T2.F07.02 (First Launch with Broken Local Storage)**: Test launching when `localStorage` throws permission error uses fallback state.
- **T2.F07.03 (Double Launch Button Click)**: Test clicking "Commencer" rapidly twice navigates once without history duplication.
- **T2.F07.04 (Splash Screen Standalone PWA Mode)**: Test rendering in standalone display mode adjusts safe-area-inset padding.
- **T2.F07.05 (Offline Cold Start Initialization)**: Test opening app in airplane mode without Supabase connection boots directly to offline dashboard.

### Feature 8: Gesture-Ready Sheet & Modal Container (`F08-SHEET`)
- **T2.F08.01 (Opening Sheet While Another Sheet Open)**: Test `ouvrirFeuille('depense')` when `'cloture'` is open smoothly transitions modal.
- **T2.F08.02 (Closing Sheet Multiple Times)**: Test invoking `fermerFeuille()` repeatedly when `feuille === null` is a no-op.
- **T2.F08.03 (Form Dirty State Dismissal)**: Test dismissing sheet with unsaved form input preserves safety or resets cleanly.
- **T2.F08.04 (Extreme Mobile Viewport Height < 480px)**: Test rendering bottom sheet on short screens enables internal vertical scrolling.
- **T2.F08.05 (Virtual Keyboard Inset Adjustment)**: Test sheet container maintains visible action buttons when virtual keyboard opens.

### Feature 9: Shared Primitives & Haitian Formatters (`F09-PRIMITIVES`)
- **T2.F09.01 (Null / Undefined / NaN Values)**: Test `formatHTG(null)`, `formatPrix(NaN)`, `formatGallons(undefined)` return `'—'`.
- **T2.F09.02 (Zero Amount Formatting)**: Test `formatHTG(0)` returns `"0 HTG"` and `formatGallons(0)` returns `"0 gallon"`.
- **T2.F09.03 (Negative Currency Formatting)**: Test `formatHTG(-1250)` returns `"− 1 250 HTG"`.
- **T2.F09.04 (Extremely Large Numbers)**: Test `formatHTG(1000000000)` formats as `"1 000 000 000 HTG"` without scientific notation.
- **T2.F09.05 (French Accent Normalizer `normaliser`)**: Test `normaliser('Matériel Défectueux')` returns `'materiel defectueux'`.

### Feature 10: Dashboard Hero Card & Metric Typography (`F10-HERO-CARD`)
- **T2.F10.01 (Zero Revenue & Zero Expenses State)**: Test hero displays `"0 HTG"` net profit with empty state sparkline.
- **T2.F10.02 (Negative Net Profit Scenario)**: Test expenses > revenues renders negative net income with clear contrast.
- **T2.F10.03 (100% MonCash Sales Share)**: Test all sales in MonCash renders 100% MonCash share without division by zero.
- **T2.F10.04 (100% Cash Sales Share)**: Test zero MonCash sales renders 0% MonCash share gracefully.
- **T2.F10.05 (Single Day of Month Elapsed)**: Test month progress on Day 1 of month computes correct 1-day progress bar.

### Feature 11: Dashboard Metrics & Stat Comparisons (`F11-STAT-CARDS`)
- **T2.F11.01 (Zero Stock State)**: Test `gallonsEnStock` returns 0 when no deliveries exist, without negative values.
- **T2.F11.02 (Over-Depleted Stock Handling)**: Test sales volume exceeding recorded deliveries clamps or reports true delta.
- **T2.F11.03 (Infinite Margin Prevention)**: Test `margeActuelle` with zero delivery cost returns `null` or 100%, never `Infinity`.
- **T2.F11.04 (Division by Zero in Month-over-Month Delta)**: Test `variationPct(500, 0)` returns `null` without throwing.
- **T2.F11.05 (Discretion Mode Persistence Across Reload)**: Test masked state persists in `localStorage['aqua-montants-caches']`.

### Feature 12: Journal Feed, Entry Rows & Attribution (`F12-JOURNAL`)
- **T2.F12.01 (Empty Journal State)**: Test rendering Journal with zero transactions displays `EtatVide` guide.
- **T2.F12.02 (Single-Day Multiple Expenses & Closure)**: Test day with 1 closure and 15 distinct expense items maintains grouping.
- **T2.F12.03 (Orphaned Category on Expense Row)**: Test expense referencing deleted category gracefully displays `"Catégorie inconnue"`.
- **T2.F12.04 (Deleted Author User ID)**: Test transaction created by removed member displays fallback author text.
- **T2.F12.05 (Corrupted Image Thumbnail Reference)**: Test receipt thumbnail with missing image blob displays placeholder icon.

### Feature 13: Interactive Calendar Grid & Date Filters (`F13-CALENDAR`)
- **T2.F13.01 (Leap Year February 29th Navigation)**: Test February in leap year 2028 generates 29 days correctly.
- **T2.F13.02 (Month Starting on Sunday)**: Test month starting on Sunday (e.g. March 2026) positions weekday columns properly.
- **T2.F13.03 (Selecting Future Date in Calendar)**: Test clicking an unclosed future date behaves gracefully.
- **T2.F13.04 (Decade-Spanning Date Navigation)**: Test navigating 120 months into past/future without date arithmetic drift.
- **T2.F13.05 (Local Timezone Boundary Midnight UTC-5)**: Test Haitian timezone date key generation at 23:59:59 does not slip to next day.

### Feature 14: Analytiques Dashboard & Period Switcher (`F14-ANALYTICS`)
- **T2.F14.01 (Custom Period with Zero Transactions)**: Test custom empty period displays zero totals with intact graph axes.
- **T2.F14.02 (Period `'tout'` with Multi-Year History)**: Test aggregation over 1,000+ transaction days executes in < 50ms.
- **T2.F14.03 (All Expenses in Single Category)**: Test category donut with 100% in "Camion d'eau" renders full ring.
- **T2.F14.04 (Single-Day Period Range)**: Test period where `debut === fin` computes single-day analytics cleanly.
- **T2.F14.05 (Expenses Without Any Sales in Period)**: Test computing margins when revenue is 0 and expenses > 0.

### Feature 15: Recharts Visualizers & Frosted Tooltips (`F15-RECHARTS`)
- **T2.F15.01 (Single Data Point Graph)**: Test graph rendering with exactly 1 data point draws dot without line crash.
- **T2.F15.02 (Identical Flat Values Data Series)**: Test graph where all days have identical revenue (e.g., 5,000 HTG).
- **T2.F15.03 (Spike Outlier in Dataset)**: Test dataset with 100x revenue spike scales Y-axis dynamically.
- **T2.F15.04 (Negative Values in Stacked Visualizer)**: Test negative net daily values in cumulative trend chart.
- **T2.F15.05 (Tooltip Hovering Off Chart Boundaries)**: Test hovering tooltips near right/left graph edges keeps tooltip in viewport.

### Feature 16: FIFO Delivery Lot Tracking Engine (`F16-FIFO-LOTS`)
- **T2.F16.01 (Zero Gallon Water Delivery Handling)**: Test delivery recorded with 0 quantity is ignored by FIFO engine.
- **T2.F16.02 (Exact Lot Depletion Boundary)**: Test delivery of 1,200 gallons with exact sales of 1,200 gallons marks lot 100% depleted.
- **T2.F16.03 (Multiple Deliveries on Same Day)**: Test two truck deliveries on same date exhausts earlier timestamp first.
- **T2.F16.04 (Fractional Gallon Depletion)**: Test fractional sales (e.g. 33.33 gallons) maintains decimal precision.
- **T2.F16.05 (100 Consecutive Delivery Lots Stress Test)**: Test FIFO tracking over 100 historical delivery lots.

### Feature 17: Run-Out Forecast & Stock Depletion (`F17-FORECAST`)
- **T2.F17.01 (Zero Consumption Rate Forecast)**: Test zero sales velocity over past 7 days returns null depletion date.
- **T2.F17.02 (Negative Days of Stock Handling)**: Test over-consumed inventory reports 0 days remaining immediately.
- **T2.F17.03 (Order Lead Time Greater than Stock Remaining)**: Test `previsionRupture` triggers urgent order alert when lead time > days left.
- **T2.F17.04 (End of Calendar Year Projection)**: Test forecast extending past December 31 wraps to next calendar year.
- **T2.F17.05 (Confidence Interval Boundary Clamping)**: Test 80% confidence interval band does not drop below zero gallons.

### Feature 18: Apple-Style Settings Groups & Parameters (`F18-SETTINGS`)
- **T2.F18.01 (Negative Selling Price Validation)**: Test inputting negative selling price rejects or clamps value.
- **T2.F18.02 (Zero Capacity Water Truck Validation)**: Test truck capacity of 0 gallons defaults to 1,200 gallons.
- **T2.F18.03 (Meter Initial Index Inversion)**: Test closure meter reading smaller than initial index flags error.
- **T2.F18.04 (Reordering Single Category List)**: Test reordering array with 1 item is safe no-op.
- **T2.F18.05 (Corrupted Category Order Array)**: Test `reordonnerCategories` with null/invalid IDs preserves existing order.

### Feature 19: Security, PIN & Account Sections (`F19-SECURITY`)
- **T2.F19.01 (Non-Numeric PIN Input Rejection)**: Test passing alphanumeric characters to PIN handler.
- **T2.F19.02 (PIN Length Other than 4 Digits)**: Test 3-digit or 5-digit PIN input handling.
- **T2.F19.03 (Corrupted Salt or Hash in Database)**: Test verification with corrupted DB salt returns false safely.
- **T2.F19.04 (Lockout Timer with Clock Skew)**: Test system time shifted backwards does not bypass lockout.
- **T2.F19.05 (Rapid Wrong PIN Submission Stress)**: Test 20 incorrect PIN attempts in rapid succession.

### Feature 20: Action Sheets, Cash Closures & Exports (`F20-ACTIONS`)
- **T2.F20.01 (Duplicate Daily Closure Prevention)**: Test saving second closure on same date updates existing record.
- **T2.F20.02 (MonCash Amount Exceeding Total Revenue)**: Test inputting MonCash > total revenue flags validation error.
- **T2.F20.03 (Zero Amount Expense Rejection)**: Test submitting expense with total = 0 is rejected.
- **T2.F20.04 (Exporting Empty Database to CSV / Excel)**: Test exporting empty database generates valid headers with 0 rows.
- **T2.F20.05 (Special Characters in Expense Notes)**: Test notes containing commas, quotes, emojis, and newlines in CSV export.

### Feature 21: Business Logic & Transactional Outbox (`F21-OFFLINE-DB`)
- **T2.F21.01 (1,000 Outbox Items Rapid Batching)**: Test outbox reader batching 1,000 pending items in chunks of 100.
- **T2.F21.02 (Blocked Outbox Item Quarantine `bloquerOutbox`)**: Test malformed outbox entries are quarantined from retry loop.
- **T2.F21.03 (Simulated Power Cut Mid-Transaction)**: Test atomic IndexedDB transaction guarantees data + outbox parity.
- **T2.F21.04 (Clock Skew During Server Merge)**: Test server records with older timestamp cannot overwrite dirty local edits.
- **T2.F21.05 (Server Deletion Tombstone Sync)**: Test merging server record with `deleted: true` removes local entry.

### Feature 22: Comprehensive Verification & Data Integrity (`F22-INTEGRITY`)
- **T2.F22.01 (Corrupted JSON Import Syntax)**: Test importing malformed JSON string throws `ErreurImport`.
- **T2.F22.02 (CSV Missing Required Headers)**: Test importing CSV without standard headers throws explicit error.
- **T2.F22.03 (Importing Foreign Kiosk Backup)**: Test importing JSON replaces kiosk local state completely.
- **T2.F22.04 (Image Blob Quota & Purge Management)**: Test `poidsRecus` and `recusAPurger` clean stored receipts.
- **T2.F22.05 (Database Wipe & Reinitialization `viderTout`)**: Test full reset clears all tables, recreates default categories, and marks clean demo flag.

---

## Tier 3: Cross-Feature Interaction Matrix & Scenarios

Aqua Track’s modules are tightly coupled across persistence, state management, UI rendering, and business calculations. Tier 3 verifies pairwise and multi-feature interaction contracts.

```
+-------------------------------------------------------------------------------------------------------+
|                                    AQUA TRACK TIER 3 INTERACTION MATRIX                                |
+------------------------+-----------+-------------+------------+-----------+-------------+-------------+
| Feature Intersection   | F01/02    | F05/08      | F10/11     | F14/15    | F16/17      | F19/21      |
|                        | Tokens    | Nav/Sheets  | Dashboard  | Analytics | FIFO/Stock  | Security/DB |
+------------------------+-----------+-------------+------------+-----------+-------------+-------------+
| F01/02 Design Tokens   |           | Glass Modal | Dark Hero  | Chart Ink | Progress    | Lock Scrim  |
| F05/08 Nav & Sheets    | Glass Nav |             | Action Pop | Tab Route | Lot Sheet   | Lock Guard  |
| F10/11 Dashboard Cards | Theme Pop | Drawer Push |            | KPI Feed  | Stock Level | Outbox Chip |
| F14/15 Analytics/Chart | Tooltips  | Filter Push | Period Sync|           | Lot Cost    | Sync Badge  |
| F16/17 FIFO & Forecast | Lot Bar   | Entry Modal | Margin Val | Burn Rate |             | Lot Ledger  |
| F19/21 Security & DB   | Lock Tint | Sheet Guard | Live Data  | Aggregation| Atomicity  |             |
+------------------------+-----------+-------------+------------+-----------+-------------+-------------+
```

### Key Multi-Feature Interaction Scenarios:

1. **TF-01: Theme Switch + Recharts Tooltip + Data Color Transposition (`F01` x `F15`)**:
   - Operator switches theme from Light to Dark while viewing the 30-day analytics revenue graph.
   - Verifies chart line colors re-sample through `couleurDonnees`, frosted glass tooltip updates background to `#1A191F`, and gridlines switch to dark border tokens without graph re-mount artifacts.

2. **TF-02: Offline Water Truck Entry + FIFO Stock Update + Outbox Queue (`F16` x `F20` x `F21`)**:
   - In airplane mode, operator opens `FeuilleDepense` and logs an approvisionnement lot of 1,200 gallons at 9,000 HTG (7.50 HTG/gal).
   - Verifies: (a) IndexedDB records expense, (b) Outbox enqueues mutation, (c) FIFO queue registers new active lot, (d) Dashboard available stock increases by 1,200 gallons, (e) Current margin recomputes instantly.

3. **TF-03: Daily Closure + MonCash Split + Inactivity PIN Lockout (`F10` x `F19` x `F20`)**:
   - Operator fills `FeuilleCloture` (4,500 HTG cash, 1,500 HTG MonCash). Device sits idle for 5 minutes.
   - Verifies: (a) App transitions to `EcranVerrou`, (b) Entering valid PIN unlocks interface, (c) Form submission updates dashboard hero card and MonCash distribution ratio, (d) Outbox sequence incremented.

4. **TF-04: Multi-Day Batch Offline Closures + Server Conflict Merge (`F12` x `F21`)**:
   - Kiosk operates offline for 3 days recording closures. Meanwhile, remote manager modified an older clean record on the server.
   - Verifies: When network reconnects, local dirty days are pushed upstream, remote clean day is merged without overwriting local un-synced entries (`fusionnerDepuisServeur`).

5. **TF-05: JSON Full Backup Export & Clean Machine Restore (`F09` x `F18` x `F22`)**:
   - Operator creates backup containing 60 days of sales, 40 expenses, and receipt photos.
   - Backup is imported into an empty browser instance.
   - Verifies: (a) All receipts restored to `recus_images`, (b) Calculations match original system exactly, (c) Demo mode flag cleared, (d) Outbox re-initialized cleanly.

---

## Tier 4: Real-World Application Scenarios (Operational Kiosk Workflows)

### Scenario 1: New Kiosk Opening & Initial Water Delivery Setup
- **Context**: A new water kiosk opens in Port-au-Prince.
- **Workflow**:
  1. Cold start launches application, creates initial default categories (Camion d'eau, Bouchons, Électricité, Réparation, Salaires).
  2. Manager sets kiosk user name to "Kiosque Tabarre" and selling price to 25 HTG / gallon.
  3. First water delivery arrives: 1,200 gallons purchased for 9,000 HTG (7.50 HTG/gal) with camera receipt attached.
  4. Initial meter reading recorded at 10,500 gallons.
  5. Verifies stock shows 1,200 gallons, unit purchase cost is 7.50 HTG, expected unit margin is 70% (17.50 HTG/gal profit).

### Scenario 2: Busy Market Day High-Volume Sales & Multi-Tender Closures
- **Context**: High-volume Saturday market day with 200+ customer fills.
- **Workflow**:
  1. Cashier logs cash sales and MonCash QR payments throughout the day.
  2. Evening closing performed: Total revenue 15,000 HTG (600 gallons sold at 25 HTG).
  3. Tender split: 10,000 HTG physical cash, 5,000 HTG MonCash.
  4. Water meter final reading recorded at 11,100 gallons (exact 600 gallon delta, 0 HTG discrepancy).
  5. Verifies FIFO lot consumed from 1,200 gal down to 600 gal remaining.

### Scenario 3: Extreme 48-Hour Network Blackout & Outbox Sync Flush
- **Context**: Cellular cell tower goes offline for 48 hours.
- **Workflow**:
  1. 2 daily closures logged (Day 1: 8,000 HTG, Day 2: 7,500 HTG).
  2. 2 supply purchases logged (Emergency fuel: 1,500 HTG, Second water truck: 1,200 gal at 9,600 HTG).
  3. Local outbox accumulates 4 transactional mutations.
  4. 48 hours later, cellular network restores; background sync runs.
  5. All 4 outbox records pushed and removed from queue (`compterOutbox` returns 0). Zero data loss or corruption.

### Scenario 4: Price Shock Deliveries & FIFO Cost Layering
- **Context**: Supplier prices surge during water shortages.
- **Workflow**:
  1. Lot 1: 1,200 gal @ 7.50 HTG (9,000 HTG).
  2. Lot 2: 1,200 gal @ 9.00 HTG (10,800 HTG) due to fuel price spike.
  3. Day 1 sales: 1,500 gallons sold.
  4. FIFO engine exhausts 1,200 gallons of Lot 1 (@ 7.50 HTG) and 300 gallons of Lot 2 (@ 9.00 HTG).
  5. Verifies volume-weighted cost of goods sold = `(1200 * 7.50 + 300 * 9.00) / 1500 = 7.80 HTG/gal`.
  6. Lot 1 marked `epuise`; Lot 2 marked `actif` with 900 gallons remaining.

### Scenario 5: Cross-Device Migration & Disaster Recovery
- **Context**: Kiosk mobile phone damaged; operator obtains replacement phone.
- **Workflow**:
  1. Operator exports JSON backup from old device or backup drive (`aqua-track-sauvegarde-*.json`).
  2. Opens Aqua Track on new device and uploads JSON backup.
  3. Database validates checksum, ingests all tables, and rebuilds IndexedDB stores.
  4. Operator configures PIN lock on new phone.
  5. Verifies all historical metrics, charts, receipts, and FIFO depletion layers match bit-for-bit.

---

## Execution Guide & Verification Harness

All E2E test suites execute via the project's standard test command:
```bash
npm test
```

### Vitest Test Suite Architecture:
- `src/lib/csv.test.js` (Existing unit tests)
- `src/lib/rappel.test.js` (Existing unit tests)
- `src/lib/metrics.test.js` (Existing unit tests)
- `src/lib/db.sync.test.js` (Existing unit tests)
- `src/e2e/e2e.tokens-theme.test.js` (Tier 1 & Tier 2 for F01, F02, F03, F04)
- `src/e2e/e2e.navigation-primitives.test.js` (Tier 1 & Tier 2 for F05, F06, F07, F08, F09)
- `src/e2e/e2e.dashboard-journal.test.js` (Tier 1 & Tier 2 for F10, F11, F12, F13)
- `src/e2e/e2e.analytics-fifo-forecast.test.js` (Tier 1 & Tier 2 for F14, F15, F16, F17)
- `src/e2e/e2e.settings-security-forms.test.js` (Tier 1 & Tier 2 for F18, F19, F20)
- `src/e2e/e2e.offline-sync-integrity.test.js` (Tier 1 & Tier 2 for F21, F22)
- `src/e2e/e2e.kiosk-lifecycle-scenarios.test.js` (Tier 3 & Tier 4 End-to-End Scenarios)
