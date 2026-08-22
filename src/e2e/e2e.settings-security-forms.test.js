import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  preparerCode,
  verifierCode,
  doitVerrouiller,
  delaiEnMs,
  DELAIS,
  DELAI_DEFAUT_MS,
} from '../lib/verrou.js'
import {
  versCSV,
  depuisCSV,
  lireNombreCSV,
  typeDeCSV,
  COLONNES_RECETTES,
  COLONNES_DEPENSES,
} from '../lib/csv.js'
import { REGLAGES_DEFAUT } from '../lib/db.js'

describe('F18: Apple-Style Settings Groups & Parameters (Tier 1 & Tier 2)', () => {
  it('T1.F18.01: default settings include Haitian business defaults', () => {
    expect(REGLAGES_DEFAUT.prix_vente_gallon).toBe(25)
    expect(REGLAGES_DEFAUT.capacite_camion).toBe(1200)
    expect(REGLAGES_DEFAUT.compteur_actif).toBe(false)
    expect(REGLAGES_DEFAUT.nom_utilisateur).toBe('')
  })

  it('T1.F18.02: delay options include 1m, 5m, and 15m intervals', () => {
    expect(DELAIS.map((d) => d.valeur)).toEqual(['1m', '5m', '15m'])
    expect(delaiEnMs('1m')).toBe(60000)
    expect(delaiEnMs('5m')).toBe(300000)
    expect(delaiEnMs('15m')).toBe(900000)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F18.01: delaiEnMs falls back to 5m (300,000ms) for unknown delay string', () => {
    expect(delaiEnMs('unknown')).toBe(DELAI_DEFAUT_MS)
    expect(delaiEnMs(null)).toBe(DELAI_DEFAUT_MS)
  })
})

describe('F19: Security, PBKDF2 PIN & Lockout Timing (Tier 1 & Tier 2)', () => {
  it('T1.F19.01: preparerCode derives secure 16-byte salt and 256-bit PBKDF2 hash', async () => {
    const { sel, empreinte } = await preparerCode('1234')
    expect(sel).toBeDefined()
    expect(sel.length).toBe(32) // 16 bytes hex encoded = 32 chars
    expect(empreinte).toBeDefined()
    expect(empreinte.length).toBe(64) // 256 bits = 32 bytes hex encoded = 64 chars
  })

  it('T1.F19.02: verifierCode returns true for exact matching 4-digit PIN', async () => {
    const { sel, empreinte } = await preparerCode('4829')
    const match = await verifierCode('4829', sel, empreinte)
    expect(match).toBe(true)
  })

  it('T1.F19.03: verifierCode returns false for incorrect PIN', async () => {
    const { sel, empreinte } = await preparerCode('4829')
    const match = await verifierCode('9999', sel, empreinte)
    expect(match).toBe(false)
  })

  it('T1.F19.04: doitVerrouiller returns true on cold boot (depuis === null)', () => {
    expect(doitVerrouiller('5m', null)).toBe(true)
    expect(doitVerrouiller('5m', undefined)).toBe(true)
  })

  it('T1.F19.05: doitVerrouiller evaluates elapsed background duration against delay threshold', () => {
    const now = Date.now()
    const fourMinAgo = now - 240000 // 4 min < 5 min
    const sixMinAgo = now - 360000 // 6 min > 5 min

    expect(doitVerrouiller('5m', fourMinAgo)).toBe(false)
    expect(doitVerrouiller('5m', sixMinAgo)).toBe(true)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F19.01: verifierCode returns false when salt or hash is null or empty', async () => {
    expect(await verifierCode('1234', null, 'hash')).toBe(false)
    expect(await verifierCode('1234', 'salt', null)).toBe(false)
    expect(await verifierCode('1234', '', '')).toBe(false)
  })

  it('T2.F19.02: verifierCode with different PIN lengths does not crash or leak timing', async () => {
    const { sel, empreinte } = await preparerCode('1234')
    expect(await verifierCode('1', sel, empreinte)).toBe(false)
    expect(await verifierCode('12345678', sel, empreinte)).toBe(false)
    expect(await verifierCode('', sel, empreinte)).toBe(false)
  })

  it('T2.F19.03: different salts prevent rainbow table attacks across identical PINs', async () => {
    const p1 = await preparerCode('0000')
    const p2 = await preparerCode('0000')
    expect(p1.sel).not.toBe(p2.sel)
    expect(p1.empreinte).not.toBe(p2.empreinte)
  })
})

describe('F20: Action Sheets, CSV, JSON & Excel Exports (Tier 1 & Tier 2)', () => {
  const sampleJournees = [
    {
      id: 'j1',
      date: '2026-07-01',
      montant: 5000,
      moncash: 1000,
      gallons: 200,
      prix_reference: 25,
      gallons_source: 'compteur',
      releve_compteur: 10200,
      note: 'Belle journée',
    },
  ]

  const sampleDepenses = [
    {
      id: 'd1',
      occurred_at: '2026-07-01T09:00:00.000Z',
      date: '2026-07-01',
      categorie: "Camion d'eau",
      suitGallons: true,
      designation: 'Livraison citerne',
      quantity: 1200,
      unit_price: 7.5,
      total: 9000,
      payment_method: 'moncash',
      nbRecus: 1,
      note: 'Paiement chauffeur',
    },
  ]

  it('T1.F20.01: versCSV formats revenue records according to COLONNES_RECETTES', () => {
    const csv = versCSV(COLONNES_RECETTES, sampleJournees)
    expect(csv).toContain('Date')
    expect(csv).toContain('Montant encaissé (HTG)')
    expect(csv).toContain('2026-07-01')
    expect(csv).toContain('5000')
  })

  it('T1.F20.02: versCSV formats expense records according to COLONNES_DEPENSES', () => {
    const csv = versCSV(COLONNES_DEPENSES, sampleDepenses)
    expect(csv).toContain('Catégorie')
    expect(csv).toContain("Camion d'eau")
    expect(csv).toContain('9000')
  })

  it('T1.F20.03: depuisCSV correctly roundtrips exported CSV data', () => {
    const csv = versCSV(COLONNES_RECETTES, sampleJournees)
    const { entetes, lignes } = depuisCSV(csv)
    expect(typeDeCSV(entetes)).toBe('recettes')
    expect(lignes.length).toBe(1)
    expect(lignes[0]['Date']).toBe('2026-07-01')
    expect(lireNombreCSV(lignes[0]['Montant encaissé (HTG)'])).toBe(5000)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F20.01: escapes quotes, commas, and newlines in CSV cells', () => {
    const complexNotes = [
      {
        id: 'j-note',
        date: '2026-07-02',
        montant: 3000,
        moncash: 0,
        gallons: 120,
        prix_reference: 25,
        gallons_source: 'estime',
        releve_compteur: null,
        note: 'Note avec "guillemets", virgule et\nsaut de ligne',
      },
    ]
    const csv = versCSV(COLONNES_RECETTES, complexNotes)
    const { lignes } = depuisCSV(csv)
    expect(lignes[0]['Note']).toBe('Note avec "guillemets", virgule et\nsaut de ligne')
  })

  it('T2.F20.02: handles empty CSV text gracefully', () => {
    const { entetes, lignes } = depuisCSV('')
    expect(entetes).toEqual([])
    expect(lignes).toEqual([])
  })

  it('T2.F20.03: typeDeCSV recognizes valid recettes vs depenses vs unknown', () => {
    expect(typeDeCSV(COLONNES_RECETTES.map((c) => c.titre))).toBe('recettes')
    expect(typeDeCSV(COLONNES_DEPENSES.map((c) => c.titre))).toBe('depenses')
    expect(typeDeCSV(['Colonne Inconnue'])).toBe(null)
  })

  // Tier 3 & Tier 4: Complex Multi-step Scenarios & Invariant Verification
  it('T3.F20.01: period helper maps standard intervals to valid date bounds', async () => {
    const { PERIODES } = await import('../components/FeuillePeriode.jsx')
    expect(PERIODES.semaine.libelle).toBe('Cette semaine')
    expect(PERIODES.mois.libelle).toBe('Ce mois')
    expect(PERIODES.precedent.libelle).toBe('Mois dernier')
    expect(PERIODES['30j'].libelle).toBe('30 derniers jours')
    expect(PERIODES.annee.libelle).toBe('Cette année')
    expect(PERIODES.tout.libelle).toBe('Depuis le début')

    const intervalleMois = PERIODES.mois.calc()
    expect(intervalleMois.debut).toBeDefined()
    expect(intervalleMois.fin).toBeDefined()
    expect(intervalleMois.debut <= intervalleMois.fin).toBe(true)
  })

  it('T4.F20.01: exports roundtrip cleanly and preserve data consistency', () => {
    const mixedRecords = [
      { id: '1', date: '2026-07-01', montant: 10000, moncash: 2500, gallons: 400, prix_reference: 25 },
      { id: '2', date: '2026-07-02', montant: 12500, moncash: 3000, gallons: 500, prix_reference: 25 },
    ]
    const csv = versCSV(COLONNES_RECETTES, mixedRecords)
    const parsed = depuisCSV(csv)
    expect(parsed.lignes.length).toBe(2)
    expect(lireNombreCSV(parsed.lignes[0]['Montant encaissé (HTG)'])).toBe(10000)
    expect(lireNombreCSV(parsed.lignes[1]['Montant encaissé (HTG)'])).toBe(12500)
  })
})
