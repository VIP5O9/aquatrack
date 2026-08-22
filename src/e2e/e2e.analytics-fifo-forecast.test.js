import './setup.js'
import { describe, it, expect } from 'vitest'
import {
  creerPeriode,
  suiviApprovisionnements,
  detailApprovisionnement,
  coutMoyenPondere,
  ouPartArgent,
  serieQuotidienne,
  serieSemaine,
  moyennesParJourSemaine,
  previsionMois,
  previsionRupture,
  seriePrevision,
  joursDeStock,
  dernierCoutGallon,
  variationDernierPrix,
} from '../lib/metrics.js'

describe('F14 & F15: Analytics Visualizers & Data Distributions (Tier 1 & Tier 2)', () => {
  const analyticsState = {
    journees: [
      { id: 'j1', date: '2026-07-01', montant: 5000, gallons: 200, deleted: false },
      { id: 'j2', date: '2026-07-02', montant: 6000, gallons: 240, deleted: false },
      { id: 'j3', date: '2026-07-03', montant: 7000, gallons: 280, deleted: false },
    ],
    depenses: [
      {
        id: 'd1',
        occurred_at: '2026-07-01T08:00:00.000Z',
        category_id: 'c-eau',
        total: 9000,
        quantity: 1200,
        deleted: false,
      },
      {
        id: 'd2',
        occurred_at: '2026-07-02T10:00:00.000Z',
        category_id: 'c-bouchon',
        total: 1000,
        deleted: false,
      },
    ],
    categories: [
      { id: 'c-eau', nom: "Camion d'eau", color: '#222026', suit_gallons: true },
      { id: 'c-bouchon', nom: 'Bouchons', color: '#22D3F5', suit_gallons: false },
    ],
    reglages: { prix_vente_gallon: 25 },
  }

  const periode = creerPeriode('2026-07-01', '2026-07-03')

  it('T1.F14.01: ouPartArgent allocates expenses into category distribution parts', () => {
    const distribution = ouPartArgent(analyticsState, periode)
    expect(distribution.total).toBe(18000)
    expect(distribution.depense).toBe(10000)
    expect(distribution.benefice).toBe(8000)
    expect(distribution.parts.length).toBe(2)
    const eau = distribution.parts.find((c) => c.nom === "Camion d'eau")
    expect(eau.montant).toBe(9000)
    const bouchon = distribution.parts.find((c) => c.nom === 'Bouchons')
    expect(bouchon.montant).toBe(1000)
  })

  it('T1.F14.02: serieQuotidienne produces continuous daily timeline with zero-fills', () => {
    const serie = serieQuotidienne(analyticsState, periode)
    expect(serie.length).toBe(3)
    expect(serie[0].date).toBe('2026-07-01')
    expect(serie[0].revenus).toBe(5000)
    expect(serie[0].depenses).toBe(9000)
    expect(serie[1].revenus).toBe(6000)
    expect(serie[1].depenses).toBe(1000)
    expect(serie[2].revenus).toBe(7000)
    expect(serie[2].depenses).toBe(0)
  })

  it('T1.F15.01: serieSemaine groups metrics by weekday for weekly visualizer', () => {
    const serie = serieSemaine(analyticsState, periode)
    expect(Array.isArray(serie)).toBe(true)
    expect(serie.length).toBeGreaterThan(0)
  })

  it('T1.F15.02: moyennesParJourSemaine computes 7-day buckets (indices 0 to 6)', () => {
    const ref = new Date(2026, 6, 4)
    const moyennes = moyennesParJourSemaine(analyticsState, { semaines: 4, reference: ref })
    expect(moyennes.length).toBe(7)
    expect(moyennes[0].jour).toBe(0) // Monday
    expect(moyennes[6].jour).toBe(6) // Sunday
  })

  it('T1.F15.03: previsionMois blends actual month revenues with projected run rate', () => {
    const ref = new Date(2026, 6, 3)
    const prev = previsionMois(analyticsState, ref)
    expect(prev.realise).toBe(18000)
    expect(prev.total).toBeGreaterThan(prev.realise)
    expect(prev.joursRestants.length).toBeGreaterThan(0)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F14.01: ouPartArgent returns null when both total revenue and total expenses are zero', () => {
    const emptyState = { journees: [], depenses: [], categories: [], reglages: {} }
    const dist = ouPartArgent(emptyState, periode)
    expect(dist).toBe(null)
  })

  it('T2.F14.02: serieQuotidienne handles period with zero activity', () => {
    const emptyPeriod = creerPeriode('2026-06-01', '2026-06-03')
    const serie = serieQuotidienne(analyticsState, emptyPeriod)
    expect(serie.length).toBe(3)
    expect(serie.every((d) => d.revenus === 0 && d.depenses === 0)).toBe(true)
  })

  it('T2.F15.01: previsionMois on last day of month projects 0 remaining days', () => {
    const lastDayOfMonth = new Date(2026, 6, 31)
    const prev = previsionMois(analyticsState, lastDayOfMonth)
    expect(prev.joursRestants.length).toBe(0)
    expect(prev.total).toBe(prev.realise)
  })
})

describe('F16: FIFO Delivery Lot Tracking Engine (Tier 1 & Tier 2)', () => {
  const fifoState = {
    journees: [
      { id: 'j1', date: '2026-07-01', montant: 5000, gallons: 200, deleted: false },
      { id: 'j2', date: '2026-07-02', montant: 10000, gallons: 400, deleted: false },
      { id: 'j3', date: '2026-07-03', montant: 20000, gallons: 800, deleted: false },
    ],
    depenses: [
      {
        id: 'lot-1',
        occurred_at: '2026-07-01T06:00:00.000Z',
        category_id: 'c-eau',
        quantity: 1000,
        total: 7000, // 7.00 HTG/gal
        deleted: false,
      },
      {
        id: 'lot-2',
        occurred_at: '2026-07-02T06:00:00.000Z',
        category_id: 'c-eau',
        quantity: 1200,
        total: 9600, // 8.00 HTG/gal
        deleted: false,
      },
    ],
    categories: [{ id: 'c-eau', nom: "Camion d'eau", suit_gallons: true }],
    reglages: { prix_vente_gallon: 25 },
  }

  it('T1.F16.01: exhausts oldest delivery lot first (FIFO order)', () => {
    // Total sold: 200 + 400 + 800 = 1400 gallons
    // Lot 1: 1000 gal -> completely exhausted (1000 used, 0 left)
    // Lot 2: 1200 gal -> 400 used, 800 left
    const suivi = suiviApprovisionnements(fifoState)
    expect(suivi).toBeDefined()
    expect(suivi.lots.length).toBe(2)

    const l1 = suivi.lots.find((l) => l.id === 'lot-1')
    expect(l1.statut).toBe('epuise')
    expect(l1.restant).toBe(0)
    expect(l1.vendus).toBe(1000)

    const l2 = suivi.lots.find((l) => l.id === 'lot-2')
    expect(l2.statut).toBe('en-cours')
    expect(l2.restant).toBe(800)
    expect(l2.vendus).toBe(400)
  })

  it('T1.F16.02: computes volume-weighted unit cost for active lots', () => {
    const periode = creerPeriode('2026-07-01', '2026-07-03')
    const cmp = coutMoyenPondere(fifoState, periode)
    // Total cost: 7000 + 9600 = 16600
    // Total gallons: 1000 + 1200 = 2200
    // Weighted avg: 16600 / 2200 = 7.5454...
    expect(cmp).toBeCloseTo(16600 / 2200, 4)
  })

  it('T1.F16.03: detailApprovisionnement calculates unit price and status of specific lot', () => {
    const detail = detailApprovisionnement(fifoState, 'lot-1')
    expect(detail.coutGallon).toBe(7)
    expect(detail.statut).toBe('epuise')
    expect(detail.gallons).toBe(1000)
  })

  it('T1.F16.04: dernierCoutGallon returns unit cost of most recent delivery lot', () => {
    expect(dernierCoutGallon(fifoState)).toBe(8)
  })

  it('T1.F16.05: variationDernierPrix computes delta between latest two delivery costs', () => {
    const delta = variationDernierPrix(fifoState)
    // 8.00 vs 7.00 -> deltaPct = (8 - 7)/7 * 100
    expect(delta.avant).toBe(7)
    expect(delta.apres).toBe(8)
    expect(delta.deltaPct).toBeCloseTo((8 - 7) / 7 * 100, 4)
    expect(delta.sens).toBe('hausse')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F16.01: handles exactly 0 deliveries cleanly in FIFO engine', () => {
    const emptyState = { ...fifoState, depenses: [] }
    const suivi = suiviApprovisionnements(emptyState)
    expect(suivi).toBe(null)
    expect(dernierCoutGallon(emptyState)).toBe(null)
    expect(variationDernierPrix(emptyState)).toBe(null)
  })

  it('T2.F16.02: single delivery lot has null variationDernierPrix', () => {
    const singleLotState = {
      ...fifoState,
      depenses: [fifoState.depenses[0]],
    }
    expect(variationDernierPrix(singleLotState)).toBe(null)
  })

  it('T2.F16.03: sales volume exceeding total delivered volume exhausts all lots and clamps', () => {
    const hugeSales = {
      ...fifoState,
      journees: [{ id: 'j-big', date: '2026-07-03', montant: 100000, gallons: 5000, deleted: false }],
    }
    const suivi = suiviApprovisionnements(hugeSales)
    expect(suivi.lots.every((l) => l.statut === 'epuise' && l.restant === 0)).toBe(true)
  })

  it('T2.F16.04: lot with zero quantity is gracefully handled without NaN', () => {
    const zeroQuantityState = {
      ...fifoState,
      depenses: [
        {
          id: 'lot-zero',
          occurred_at: '2026-07-01T06:00:00.000Z',
          category_id: 'c-eau',
          quantity: 0,
          total: 1000,
          deleted: false,
        },
      ],
    }
    const suivi = suiviApprovisionnements(zeroQuantityState)
    expect(suivi).toBe(null)
  })
})

describe('F17: Run-Out Forecast & Stock Depletion Engine (Tier 1 & Tier 2)', () => {
  const forecastState = {
    journees: [
      { id: 'j1', date: '2026-07-10', montant: 5000, gallons: 200, deleted: false },
      { id: 'j2', date: '2026-07-11', montant: 5000, gallons: 200, deleted: false },
      { id: 'j3', date: '2026-07-12', montant: 5000, gallons: 200, deleted: false },
    ],
    depenses: [
      {
        id: 'lot-1',
        occurred_at: '2026-07-10T06:00:00.000Z',
        category_id: 'c-eau',
        quantity: 1200,
        total: 9000,
        deleted: false,
      },
    ],
    categories: [{ id: 'c-eau', nom: "Camion d'eau", suit_gallons: true }],
    reglages: { prix_vente_gallon: 25 },
  }

  const refDate = new Date(2026, 6, 12)

  it('T1.F17.01: joursDeStock estimates days of stock remaining from recent consumption', () => {
    // Delivered: 1200. Sold: 600. Remaining: 600.
    // Velocity: 200 gal/day.
    // Days remaining: 600 / 200 = 3 days.
    const jours = joursDeStock(forecastState, refDate)
    expect(jours).toBeCloseTo(3, 1)
  })

  it('T1.F17.02: previsionRupture predicts exact stockout date', () => {
    const prev = previsionRupture(forecastState, refDate, { delaiCommande: 2 })
    expect(prev.jours).toBeGreaterThan(0)
    expect(prev.date).toBeDefined()
    expect(typeof prev.date).toBe('string')
  })

  it('T1.F17.03: seriePrevision produces trajectory points for prediction graph', () => {
    const serie = seriePrevision(forecastState, refDate)
    expect(Array.isArray(serie)).toBe(true)
    expect(serie.length).toBeGreaterThan(0)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F17.01: zero sales velocity returns null or infinity-safe forecast', () => {
    const zeroSalesState = { ...forecastState, journees: [] }
    const jours = joursDeStock(zeroSalesState, refDate)
    expect(jours).toBe(null)
  })

  it('T2.F17.02: zero remaining stock returns 0 days of stock immediately', () => {
    const depletedState = {
      ...forecastState,
      journees: [{ id: 'j-dep', date: '2026-07-10', montant: 30000, gallons: 1200, deleted: false }],
    }
    const jours = joursDeStock(depletedState, refDate)
    expect(jours).toBe(0)
  })

  it('T2.F17.03: urgent reorder signaled when stock remaining is less than order lead time', () => {
    const prev = previsionRupture(forecastState, refDate, { delaiCommande: 10 })
    expect(prev.urgent).toBe(true)
  })
})
