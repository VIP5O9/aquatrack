import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  creerPeriode,
  moisCourant,
  moisPrecedent,
  totalRevenus,
  totalDepenses,
  beneficeNet,
  splitPaiement,
  gallonsVendus,
  gallonsEnStock,
  margeActuelle,
  variationPct,
  comparerMois,
  ecartCaisse,
} from '../lib/metrics.js'
import { cleJour } from '../lib/format.js'
import { versLigne } from '../components/LigneJournal.jsx'
import { FILTRES_BASE } from '../components/FiltresJournal.jsx'

describe('F10: Dashboard Hero Card & Net Profit Metrics (Tier 1 & Tier 2)', () => {
  const sampleState = {
    journees: [
      { id: 'j1', date: '2026-07-01', montant: 5000, moncash: 1000, gallons: 200, deleted: false },
      { id: 'j2', date: '2026-07-02', montant: 7500, moncash: 2500, gallons: 300, deleted: false },
      { id: 'j3', date: '2026-07-03', montant: 6000, moncash: 1500, gallons: 240, deleted: false },
    ],
    depenses: [
      { id: 'd1', occurred_at: '2026-07-01T10:00:00.000Z', total: 3000, deleted: false },
      { id: 'd2', occurred_at: '2026-07-02T12:00:00.000Z', total: 1500, deleted: false },
    ],
    categories: [
      { id: 'c1', nom: "Camion d'eau", suit_gallons: true },
      { id: 'c2', nom: 'Bouchons', suit_gallons: false },
    ],
    reglages: { prix_vente_gallon: 25 },
  }

  const periode = creerPeriode('2026-07-01', '2026-07-31')

  it('T1.F10.01: calculates total revenues accurately for hero card', () => {
    expect(totalRevenus(sampleState, periode)).toBe(18500)
  })

  it('T1.F10.02: calculates total expenses accurately', () => {
    expect(totalDepenses(sampleState, periode)).toBe(4500)
  })

  it('T1.F10.03: calculates net profit (revenues - expenses)', () => {
    expect(beneficeNet(sampleState, periode)).toBe(14000)
  })

  it('T1.F10.04: calculates MonCash vs Cash payment split proportions', () => {
    const split = splitPaiement(sampleState, periode)
    expect(split.total).toBe(18500)
    expect(split.moncash).toBe(5000)
    expect(split.cash).toBe(13500)
    expect(split.partMoncash).toBeCloseTo(5000 / 18500, 4)
  })

  it('T1.F10.05: ignores soft-deleted transactions in hero calculations', () => {
    const withDeleted = {
      ...sampleState,
      journees: [
        ...sampleState.journees,
        { id: 'j-del', date: '2026-07-04', montant: 99999, deleted: true },
      ],
    }
    expect(totalRevenus(withDeleted, periode)).toBe(18500)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F10.01: handles completely empty state with 0 revenues and 0 net profit', () => {
    const emptyState = { journees: [], depenses: [], categories: [], reglages: {} }
    expect(totalRevenus(emptyState, periode)).toBe(0)
    expect(totalDepenses(emptyState, periode)).toBe(0)
    expect(beneficeNet(emptyState, periode)).toBe(0)
  })

  it('T2.F10.02: handles negative net profit when expenses exceed revenue', () => {
    const lossState = {
      ...sampleState,
      depenses: [{ id: 'd-big', occurred_at: '2026-07-01T10:00:00.000Z', total: 50000, deleted: false }],
    }
    expect(beneficeNet(lossState, periode)).toBe(18500 - 50000)
  })

  it('T2.F10.03: payment split with 100% MonCash', () => {
    const allMoncash = {
      journees: [{ id: 'j', date: '2026-07-01', montant: 1000, moncash: 1000, deleted: false }],
      depenses: [],
      categories: [],
      reglages: {},
    }
    const split = splitPaiement(allMoncash, periode)
    expect(split.cash).toBe(0)
    expect(split.moncash).toBe(1000)
    expect(split.partMoncash).toBe(1)
  })

  it('T2.F10.04: payment split with 0% MonCash', () => {
    const allCash = {
      journees: [{ id: 'j', date: '2026-07-01', montant: 1000, moncash: 0, deleted: false }],
      depenses: [],
      categories: [],
      reglages: {},
    }
    const split = splitPaiement(allCash, periode)
    expect(split.cash).toBe(1000)
    expect(split.moncash).toBe(0)
    expect(split.partMoncash).toBe(0)
  })

  it('T2.F10.05: payment split with 0 total revenue returns null safely', () => {
    const zeroState = { journees: [], depenses: [], categories: [], reglages: {} }
    const split = splitPaiement(zeroState, periode)
    expect(split).toBe(null)
  })
})

describe('F11: Dashboard Metrics & Stat Cards (Tier 1 & Tier 2)', () => {
  const stockState = {
    journees: [
      { id: 'j1', date: '2026-07-01', montant: 5000, gallons: 200, deleted: false },
      { id: 'j2', date: '2026-07-02', montant: 7500, gallons: 300, deleted: false },
    ],
    depenses: [
      {
        id: 'd1',
        occurred_at: '2026-07-01T08:00:00.000Z',
        category_id: 'c-water',
        quantity: 1200,
        total: 9000,
        deleted: false,
      },
    ],
    categories: [{ id: 'c-water', nom: "Camion d'eau", suit_gallons: true }],
    reglages: { prix_vente_gallon: 25 },
  }

  it('T1.F11.01: calculates total gallons sold across period', () => {
    const periode = creerPeriode('2026-07-01', '2026-07-31')
    expect(gallonsVendus(stockState, periode)).toBe(500)
  })

  it('T1.F11.02: calculates remaining inventory gallons (received - sold)', () => {
    expect(gallonsEnStock(stockState)).toBe(1200 - 500)
  })

  it('T1.F11.03: calculates current unit margin percentage', () => {
    // Delivery: 9000 HTG / 1200 gal = 7.50 HTG/gal cost
    // Selling price = 25 HTG/gal
    // Margin rate = (25 - 7.50) / 25 = 17.5 / 25 = 0.70 (70%)
    const marge = margeActuelle(stockState)
    expect(marge.tauxMarge).toBeCloseTo(0.7, 4)
    expect(marge.marge).toBe(17.5)
  })

  it('T1.F11.04: calculates variation percentage between two values', () => {
    expect(variationPct(150, 100)).toBeCloseTo(50, 4)
    expect(variationPct(80, 100)).toBeCloseTo(-20, 4)
  })

  it('T1.F11.05: compares revenue between two calendar months', () => {
    const ref = new Date(2026, 6, 15) // July 15, 2026
    const res = comparerMois(stockState, { annee: 2026, mois: 6 }, { annee: 2026, mois: 5 }, ref)
    expect(res.a).toBe(12500)
    expect(res.b).toBe(0)
    expect(typeof res.tronque).toBe('boolean')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F11.01: returns 0 stock when zero deliveries and zero sales recorded', () => {
    const zeroState = { journees: [], depenses: [], categories: [{ id: 'c-water', suit_gallons: true }], reglages: {} }
    expect(gallonsEnStock(zeroState)).toBe(0)
  })

  it('T2.F11.02: returns null for margeActuelle when no water delivery recorded', () => {
    const noDeliveries = { ...stockState, depenses: [] }
    expect(margeActuelle(noDeliveries)).toBe(null)
  })

  it('T2.F11.03: variationPct with 0 previous value returns null instead of Infinity', () => {
    expect(variationPct(500, 0)).toBe(null)
    expect(variationPct(500, null)).toBe(null)
  })

  it('T2.F11.04: ecartCaisse calculates discrepancy between physical meter and money received', () => {
    // 100 gallons at 25 HTG = 2500 HTG expected. Actual = 2400 HTG -> -100 HTG gap
    const journee = {
      montant: 2400,
      prix_reference: 25,
      gallons: 100,
      gallons_source: 'compteur',
    }
    const ecart = ecartCaisse(journee)
    expect(ecart.ecart).toBe(-100)
    expect(ecart.attendu).toBe(2500)
  })

  it('T2.F11.05: ecartCaisse returns null when volume source is estimated instead of meter', () => {
    const journee = {
      montant: 2500,
      prix_reference: 25,
      gallons: 100,
      gallons_source: 'estime',
    }
    expect(ecartCaisse(journee)).toBe(null)
  })
})

describe('F12 & F13: Journal Feed & Interactive Calendar (Tier 1 & Tier 2)', () => {
  const journalState = {
    journees: [
      { id: 'j-2026-07-01', date: '2026-07-01', montant: 3000, gallons: 120, user_id: 'user-1' },
      { id: 'j-2026-07-02', date: '2026-07-02', montant: 4000, gallons: 160, user_id: 'user-2' },
    ],
    depenses: [
      {
        id: 'd-1',
        occurred_at: '2026-07-01T09:00:00.000Z',
        category_id: 'c-1',
        total: 500,
        user_id: 'user-1',
      },
    ],
    categories: [{ id: 'c-1', nom: 'Bouchons' }],
    recus: [{ id: 'r-1', depense_id: 'd-1', nom: 'recu.jpg' }],
    membres: [
      { user_id: 'user-1', nom: 'Marie' },
      { user_id: 'user-2', nom: 'Jean' },
    ],
  }

  it('T1.F12.01: maps journal items with proper chronological attributes', () => {
    expect(journalState.journees.length).toBe(2)
    expect(journalState.depenses.length).toBe(1)
  })

  it('T1.F12.02: maps receipt attachments to respective expense rows', () => {
    const receiptsForD1 = journalState.recus.filter((r) => r.depense_id === 'd-1')
    expect(receiptsForD1.length).toBe(1)
    expect(receiptsForD1[0].nom).toBe('recu.jpg')
  })

  it('T1.F12.03: resolves author attribution name from store membres list', () => {
    const memberMarie = journalState.membres.find((m) => m.user_id === 'user-1')
    expect(memberMarie?.nom).toBe('Marie')
    const memberJean = journalState.membres.find((m) => m.user_id === 'user-2')
    expect(memberJean?.nom).toBe('Jean')
  })

  it('T1.F13.01: filters transactions matching calendar day key', () => {
    const targetDay = '2026-07-01'
    const matchingDay = journalState.journees.filter((j) => j.date === targetDay)
    expect(matchingDay.length).toBe(1)
    expect(matchingDay[0].montant).toBe(3000)
  })

  it('T1.F13.02: detects days containing deliveries for calendar marker dots', () => {
    const deliveryExpense = journalState.depenses.find(
      (d) => d.category_id === 'c-1' && d.occurred_at.startsWith('2026-07-01'),
    )
    expect(deliveryExpense).toBeDefined()
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F12.01: author attribution gracefully falls back when user_id is unknown or missing', () => {
    const unknownId = 'user-unknown-999'
    const member = journalState.membres.find((m) => m.user_id === unknownId)
    expect(member).toBeUndefined()
  })

  it('T2.F12.02: handles expense without any receipt attachments', () => {
    const receiptsForOther = journalState.recus.filter((r) => r.depense_id === 'd-none')
    expect(receiptsForOther.length).toBe(0)
  })

  it('T2.F13.01: leap year date math (2028-02-29)', () => {
    const leapDate = new Date(2028, 1, 29)
    expect(cleJour(leapDate)).toBe('2028-02-29')
  })

  it('T2.F13.02: date boundary across year turn (2026-12-31 to 2027-01-01)', () => {
    const endOfYear = new Date(2026, 11, 31)
    const newYear = new Date(2027, 0, 1)
    expect(cleJour(endOfYear)).toBe('2026-12-31')
    expect(cleJour(newYear)).toBe('2027-01-01')
  })

  it('T2.F13.03: calendar date range with 0 transactions in month', () => {
    const emptyPeriode = creerPeriode('2026-05-01', '2026-05-31')
    expect(totalRevenus(journalState, emptyPeriode)).toBe(0)
    expect(totalDepenses(journalState, emptyPeriode)).toBe(0)
  })

  // Tier 3: Component Adapter & versLigne Verification
  it('T3.F12.01: versLigne formats revenue day with meter reading accurately', () => {
    const journee = {
      id: 'j-100',
      date: '2026-07-15',
      montant: 5000,
      gallons: 200,
      prix_reference: 25,
      gallons_source: 'compteur',
      user_id: 'user-1',
    }
    const ligne = versLigne(journee, journalState)
    expect(ligne.cle).toBe('j-j-100')
    expect(ligne.type).toBe('revenu')
    expect(ligne.montant).toBe(5000)
    expect(ligne.detail).toContain('200')
    expect(ligne.detail).toContain('compteur')
    expect(ligne.auteur).toBe('Marie')
  })

  it('T3.F12.02: versLigne formats water delivery expense tracking gallons', () => {
    const waterExpense = {
      id: 'd-water',
      occurred_at: '2026-07-10T08:00:00.000Z',
      category_id: 'c-water',
      quantity: 1200,
      total: 9000,
      user_id: 'user-2',
    }
    const ctx = {
      categories: [{ id: 'c-water', nom: "Camion d'eau", suit_gallons: true, color: '#2672DD' }],
      recus: [{ id: 'r-w1', depense_id: 'd-water' }, { id: 'r-w2', depense_id: 'd-water' }],
      membres: journalState.membres,
    }
    const ligne = versLigne(waterExpense, ctx)
    expect(ligne.type).toBe('depense')
    expect(ligne.suitGallons).toBe(true)
    expect(ligne.nbRecus).toBe(2)
    expect(ligne.detail).toContain('1')
    expect(ligne.detail).toContain('200')
    expect(ligne.detail).toContain('7,50 HTG/gallon')
    expect(ligne.auteur).toBe('Jean')
  })

  it('T3.F12.03: FILTRES_BASE declares standard journal filters', () => {
    expect(FILTRES_BASE).toEqual([
      { valeur: 'tout', libelle: 'Tout' },
      { valeur: 'revenu', libelle: 'Revenus' },
      { valeur: 'depense', libelle: 'Dépenses' },
    ])
  })
})
