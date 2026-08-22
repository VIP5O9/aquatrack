import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  formatHTG,
  formatPrix,
  formatGallons,
  formatPourcent,
  salutation,
  cleJour,
  depuisCleJour,
  formatDateLongue,
  formatDateCourte,
  formatDateAxe,
  formatMoisAnnee,
  formatHeure,
  normaliser,
  lireNombre,
  MONTANT_MASQUE,
} from '../lib/format.js'
import { useStore } from '../store/useStore.js'

describe('F06: Translucent Header & Salutation System (Tier 1 & Tier 2)', () => {
  it('T1.F06.01: salutation returns "Bonjour" before 18:00', () => {
    const morning = new Date(2026, 6, 20, 8, 30, 0)
    const afternoon = new Date(2026, 6, 20, 17, 59, 59)
    expect(salutation(morning)).toBe('Bonjour')
    expect(salutation(afternoon)).toBe('Bonjour')
  })

  it('T1.F06.02: salutation returns "Bonsoir" at and after 18:00', () => {
    const evening = new Date(2026, 6, 20, 18, 0, 0)
    const night = new Date(2026, 6, 20, 23, 15, 0)
    expect(salutation(evening)).toBe('Bonsoir')
    expect(salutation(night)).toBe('Bonsoir')
  })

  it('T1.F06.03: formatHeure formats timestamp in HH:MM format', () => {
    const iso = '2026-07-20T14:05:00.000Z'
    const heure = formatHeure(iso)
    expect(heure).toMatch(/^\d{2}:\d{2}$/)
  })

  it('T1.F06.04: cleJour produces AAAA-MM-JJ in local time without UTC offset drift', () => {
    const date = new Date(2026, 6, 15) // July 15, 2026
    expect(cleJour(date)).toBe('2026-07-15')
  })

  it('T1.F06.05: depuisCleJour reconstructs valid midnight Date object', () => {
    const d = depuisCleJour('2026-07-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6)
    expect(d.getDate()).toBe(15)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F06.01: salutation at exact millisecond boundary 17:59:59.999 vs 18:00:00.000', () => {
    const justBefore = new Date(2026, 6, 20, 17, 59, 59, 999)
    const exact = new Date(2026, 6, 20, 18, 0, 0, 0)
    expect(salutation(justBefore)).toBe('Bonjour')
    expect(salutation(exact)).toBe('Bonsoir')
  })

  it('T2.F06.02: cleJour pads single-digit months and days with leading zeros', () => {
    const date = new Date(2026, 0, 5) // Jan 5, 2026
    expect(cleJour(date)).toBe('2026-01-05')
  })

  it('T2.F06.03: formatDateLongue includes Haitian French day and month names', () => {
    const str = formatDateLongue('2026-07-20')
    expect(str).toContain('2026')
    expect(str).toContain('juillet')
    expect(str).toContain('20')
  })

  it('T2.F06.04: formatDateAxe produces compact chart label with abbreviation', () => {
    const axe = formatDateAxe('2026-07-20')
    expect(axe).toContain('20')
    expect(axe).toContain('juil.')
  })

  it('T2.F06.05: formatMoisAnnee formats month heading in Journal', () => {
    const mois = formatMoisAnnee('2026-07-20')
    expect(mois).toBe('juillet 2026')
  })
})

describe('F08: Gesture-Ready Sheet Container & State Management (Tier 1 & Tier 2)', () => {
  beforeEach(() => {
    useStore.setState({
      feuille: null,
      periode: 'mois',
    })
  })

  it('T1.F08.01: ouvrirFeuille opens closure sheet type', () => {
    useStore.getState().ouvrirFeuille('cloture')
    expect(useStore.getState().feuille).toEqual({ type: 'cloture', donnees: null })
  })

  it('T1.F08.02: ouvrirFeuille opens expense sheet with prefilled data', () => {
    const data = { category_id: 'cat-123', total: 500 }
    useStore.getState().ouvrirFeuille('depense', data)
    expect(useStore.getState().feuille).toEqual({ type: 'depense', donnees: data })
  })

  it('T1.F08.03: fermerFeuille resets sheet state to null', () => {
    useStore.getState().ouvrirFeuille('cloture')
    useStore.getState().fermerFeuille()
    expect(useStore.getState().feuille).toBe(null)
  })

  it('T1.F08.04: choisirPeriode updates active analytics period in memory', () => {
    useStore.getState().choisirPeriode('30j')
    expect(useStore.getState().periode).toBe('30j')
    useStore.getState().choisirPeriode('precedent')
    expect(useStore.getState().periode).toBe('precedent')
  })

  it('T1.F08.05: basculerMontants toggles amount privacy mask', () => {
    const initial = useStore.getState().montantsCaches
    useStore.getState().basculerMontants()
    expect(useStore.getState().montantsCaches).toBe(!initial)
    useStore.getState().basculerMontants()
    expect(useStore.getState().montantsCaches).toBe(initial)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F08.01: fermerFeuille when already null does not throw or mutate state', () => {
    expect(() => useStore.getState().fermerFeuille()).not.toThrow()
    expect(useStore.getState().feuille).toBe(null)
  })

  it('T2.F08.02: rapid sequential opening and switching of sheet types', () => {
    useStore.getState().ouvrirFeuille('cloture')
    useStore.getState().ouvrirFeuille('depense', { total: 100 })
    useStore.getState().ouvrirFeuille('choix')
    expect(useStore.getState().feuille.type).toBe('choix')
  })

  it('T2.F08.03: ouvrirFeuille with complex nested object payload', () => {
    const complex = { lot: { id: 'lot-1', detail: { gallons: 1200, prix: 7.5 } } }
    useStore.getState().ouvrirFeuille('lot', complex)
    expect(useStore.getState().feuille.donnees).toEqual(complex)
  })

  it('T2.F08.04: choosing all valid period options', () => {
    const validPeriods = ['mois', 'precedent', '30j', 'tout']
    validPeriods.forEach((p) => {
      useStore.getState().choisirPeriode(p)
      expect(useStore.getState().periode).toBe(p)
    })
  })

  it('T2.F08.05: discretion mode persists correctly in localStorage', () => {
    useStore.setState({ montantsCaches: false })
    useStore.getState().basculerMontants()
    expect(localStorage.getItem('aqua-montants-caches')).toBe('1')
    useStore.getState().basculerMontants()
    expect(localStorage.getItem('aqua-montants-caches')).toBe('0')
  })
})

describe('F09: Shared Primitives & Haitian Formatters (Tier 1 & Tier 2)', () => {
  // Tier 1: Feature Coverage
  it('T1.F09.01: formatHTG formats positive integer with currency suffix', () => {
    const res = formatHTG(1250)
    expect(res).toContain('1')
    expect(res).toContain('250')
    expect(res).toContain('HTG')
  })

  it('T1.F09.02: formatHTG supports explicit sign option', () => {
    const positive = formatHTG(1250, { signe: true })
    const negative = formatHTG(-1250, { signe: true })
    expect(positive).toMatch(/^\+\s/)
    expect(negative).toMatch(/^−\s/)
  })

  it('T1.F09.03: formatPrix formats unit price with two decimal places', () => {
    const res = formatPrix(7.5)
    expect(res).toBe('7,50 HTG')
    const res2 = formatPrix(9)
    expect(res2).toBe('9,00 HTG')
  })

  it('T1.F09.04: formatGallons formats singular and plural gallons', () => {
    expect(formatGallons(1)).toBe('1 gallon')
    expect(formatGallons(1200)).toContain('1')
    expect(formatGallons(1200)).toContain('200')
    expect(formatGallons(1200)).toContain('gallons')
  })

  it('T1.F09.05: formatPourcent formats signed percentage values', () => {
    expect(formatPourcent(4.82, { signe: true })).toBe('+4,8 %')
    expect(formatPourcent(-12.4, { signe: true })).toBe('−12 %')
    expect(formatPourcent(15.0, { signe: false })).toBe('15 %')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F09.01: handles null, undefined, NaN, and Infinity across all formatters', () => {
    expect(formatHTG(null)).toBe('—')
    expect(formatHTG(NaN)).toBe('—')
    expect(formatPrix(null)).toBe('—')
    expect(formatPrix(NaN)).toBe('—')
    expect(formatGallons(undefined)).toBe('—')
    expect(formatGallons(NaN)).toBe('—')
    expect(formatPourcent(null)).toBe('—')
    expect(formatPourcent(Infinity)).toBe('—')
    expect(formatPourcent(-Infinity)).toBe('—')
  })

  it('T2.F09.02: handles zero values accurately', () => {
    expect(formatHTG(0)).toBe('0 HTG')
    expect(formatPrix(0)).toBe('0,00 HTG')
    expect(formatGallons(0)).toBe('0 gallons')
    expect(formatPourcent(0, { signe: true })).toBe('0,0 %')
  })

  it('T2.F09.03: normaliser strips accents, diacritics, and handles case normalization', () => {
    expect(normaliser('Électricité Générale')).toBe('electricite generale')
    expect(normaliser('BOUCHON & MATÉRIEL')).toBe('bouchon & materiel')
    expect(normaliser(null)).toBe('')
    expect(normaliser(undefined)).toBe('')
  })

  it('T2.F09.04: lireNombre parses French comma decimals, thousands spaces and rejects invalid numbers', () => {
    expect(lireNombre('1 250,50')).toBe(1250.5)
    expect(lireNombre('9000')).toBe(9000)
    expect(lireNombre('0,75')).toBe(0.75)
    expect(lireNombre('')).toBe(null)
    expect(lireNombre('abc')).toBe(null)
    expect(lireNombre(null)).toBe(null)
  })

  it('T2.F09.05: MONTANT_MASQUE is constant 7-asterisk string', () => {
    expect(MONTANT_MASQUE).toBe('*******')
    expect(MONTANT_MASQUE.length).toBe(7)
  })
})
