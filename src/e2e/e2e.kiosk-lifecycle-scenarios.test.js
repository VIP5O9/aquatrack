import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  chargerTout,
  enregistrerJournee,
  enregistrerDepense,
  enregistrerCategorie,
  enregistrerRecu,
  enregistrerImageRecu,
  toutEffacer,
  amorcerCategories,
  exporterJSON,
  importerJSON,
  compterOutbox,
  lireOutbox,
  retirerOutbox,
  fusionnerDepuisServeur,
  ecrireReglages,
  ecrireMeta,
  lireMeta,
} from '../lib/db.js'
import {
  creerPeriode,
  moisCourant,
  totalRevenus,
  totalDepenses,
  beneficeNet,
  splitPaiement,
  gallonsVendus,
  gallonsEnStock,
  margeActuelle,
  suiviApprovisionnements,
  coutMoyenPondere,
  previsionRupture,
  ecartCaisse,
} from '../lib/metrics.js'
import { preparerCode, verifierCode, doitVerrouiller } from '../lib/verrou.js'
import { formatHTG, formatPrix, formatGallons, formatPourcent } from '../lib/format.js'
import { couleurDonnees } from '../lib/theme.js'

describe('Tier 3: Cross-Feature Interaction Scenarios', () => {
  beforeEach(async () => {
    await toutEffacer()
    await amorcerCategories()
  })

  it('TF-01: Theme Switch + Recharts Tooltip + Data Color Transposition (F01 x F15)', async () => {
    const rawCategories = [
      { id: 'c1', nom: "Camion d'eau", color: '#222026' },
      { id: 'c2', nom: 'Électricité', color: '#2672DD' },
      { id: 'c3', nom: 'Divers', color: '#22D3F5' },
    ]

    // Light mode: colors remain pure brand colors
    const lightColors = rawCategories.map((c) => couleurDonnees(c.color, false))
    expect(lightColors[0]).toBe('#222026')
    expect(lightColors[1]).toBe('#2672DD')
    expect(lightColors[2]).toBe('#22D3F5')

    // Dark mode: colors dynamically transposed for optical elevation
    const darkColors = rawCategories.map((c) => couleurDonnees(c.color, true))
    expect(darkColors[0]).toBe('#E8E8EA')
    expect(darkColors[1]).toBe('#5B9BF5')
    expect(darkColors[2]).toBe('#22D3F5')
  })

  it('TF-02: Offline Water Truck Entry + FIFO Stock Update + Outbox Queue (F16 x F20 x F21)', async () => {
    const categories = (await chargerTout()).categories
    const catAppro = categories.find((c) => c.suit_gallons) || categories[0]

    // Operator logs delivery of 1,200 gallons for 9,000 HTG while offline
    const depense = await enregistrerDepense({
      occurred_at: '2026-07-01T07:00:00.000Z',
      category_id: catAppro.id,
      quantity: 1200,
      total: 9000,
      entry_mode: 'forfait',
    })

    // Outbox must have recorded the operation
    const pendingCount = await compterOutbox()
    expect(pendingCount).toBeGreaterThan(0)

    // Verify FIFO stock calculation in state
    const state = await chargerTout()
    const suivi = suiviApprovisionnements(state)
    expect(suivi.lots.length).toBe(1)
    expect(suivi.lots[0].restant).toBe(1200)
    expect(suivi.lots[0].coutGallon).toBe(7.5)

    // Current margin with 25 HTG sale price: (25 - 7.5) / 25 = 70%
    const marge = margeActuelle(state)
    expect(marge.tauxMarge).toBeCloseTo(0.7, 4)
  })

  it('TF-03: Daily Closure + MonCash Split + Inactivity PIN Lockout (F10 x F19 x F20)', async () => {
    // 1. Arm PIN Lock
    const { sel, empreinte } = await preparerCode('2468')
    await ecrireReglages({ verrou_actif: true, verrou_sel: sel, verrou_empreinte: empreinte })

    // 2. Perform daily closure: 6,000 HTG total (4,000 Cash, 2,000 MonCash)
    await enregistrerJournee({
      date: '2026-07-15',
      montant: 6000,
      moncash: 2000,
      gallons: 240,
      prix_reference: 25,
    })

    // 3. Evaluate PIN lockout after 10 minutes in background
    const tenMinAgo = Date.now() - 600000
    const locked = doitVerrouiller('5m', tenMinAgo)
    expect(locked).toBe(true)

    // 4. Verify unlock with correct PIN
    const isValid = await verifierCode('2468', sel, empreinte)
    expect(isValid).toBe(true)

    // 5. Read updated dashboard metrics
    const state = await chargerTout()
    const periode = creerPeriode('2026-07-01', '2026-07-31')
    const split = splitPaiement(state, periode)
    expect(split.total).toBe(6000)
    expect(split.moncash).toBe(2000)
    expect(split.cash).toBe(4000)
    expect(split.partMoncash).toBeCloseTo(2000 / 6000, 4)
  })
})

describe('Tier 4: Real-World Kiosk Operational Scenarios', () => {
  beforeEach(async () => {
    await toutEffacer()
    await amorcerCategories()
    const outboxInit = await lireOutbox(100)
    if (outboxInit.length) {
      await retirerOutbox(outboxInit.map((o) => o.seq))
    }
  })

  it('Scenario 1: New Kiosk Opening & Initial Water Delivery Setup', async () => {
    // Step 1: Initialize kiosk settings
    await ecrireReglages({
      nom_utilisateur: 'Kiosque Tabarre',
      prix_vente_gallon: 25,
      capacite_camion: 1200,
      compteur_actif: true,
      compteur_index_initial: 10000,
    })

    // Step 2: Receive initial water delivery (1,200 gallons for 9,000 HTG)
    const state0 = await chargerTout()
    const waterCat = state0.categories.find((c) => c.suit_gallons)
    const delivery = await enregistrerDepense({
      occurred_at: '2026-07-01T08:00:00.000Z',
      category_id: waterCat.id,
      quantity: 1200,
      total: 9000,
      note: 'Livraison Camion Citerne #1',
    })

    // Step 3: Record receipt attachment
    await enregistrerRecu({
      id: 'recu-livraison-1',
      depense_id: delivery.id,
      nom: 'recu_chauffeur.jpg',
      prepare: {
        nom: 'recu_chauffeur.jpg',
        type: 'image/jpeg',
        largeur: 800,
        hauteur: 600,
        octets_image: 45000,
        octets_vignette: 5000,
        image_data: 'data:image/jpeg;base64,mock',
        vignette_data: 'data:image/jpeg;base64,mockthumb',
      },
    })

    // Step 4: Verify initial financial and stock posture
    const state1 = await chargerTout()
    expect(gallonsEnStock(state1)).toBe(1200)
    expect(margeActuelle(state1).tauxMarge).toBeCloseTo((25 - 7.5) / 25, 4)
    expect(formatHTG(totalDepenses(state1, creerPeriode('2026-07-01', '2026-07-31')))).toBe(formatHTG(9000))
  })

  it('Scenario 2: Busy Market Day High-Volume Sales & Multi-Tender Closures', async () => {
    const state0 = await chargerTout()
    const waterCat = state0.categories.find((c) => c.suit_gallons)

    // Initial stock: 1,200 gallons
    await enregistrerDepense({
      occurred_at: '2026-07-05T07:00:00.000Z',
      category_id: waterCat.id,
      quantity: 1200,
      total: 9000,
    })

    // Evening closure: 600 gallons sold at 25 HTG = 15,000 HTG revenue
    // Tender: 10,000 HTG Cash, 5,000 HTG MonCash
    // Physical meter: index moved from 10,000 to 10,600 (exact 600 gallons delta)
    const closure = await enregistrerJournee({
      date: '2026-07-05',
      montant: 15000,
      moncash: 5000,
      gallons: 600,
      gallons_source: 'compteur',
      releve_compteur: 10600,
      prix_reference: 25,
      note: 'Jour de marché animé',
    })

    // Check meter discrepancy
    const ecart = ecartCaisse(closure)
    expect(ecart.ecart).toBe(0) // 0 gap

    // Verify FIFO stock depletion: 1,200 - 600 = 600 remaining
    const state1 = await chargerTout()
    const suivi = suiviApprovisionnements(state1)
    expect(suivi.lots[0].statut).toBe('en-cours')
    expect(suivi.lots[0].restant).toBe(600)
    expect(suivi.lots[0].vendus).toBe(600)

    // Net profit for the day: 15,000 revenue - 9,000 delivery = 6,000 HTG
    const periode = creerPeriode('2026-07-05', '2026-07-05')
    expect(beneficeNet(state1, periode)).toBe(6000)
  })

  it('Scenario 3: Extreme 48-Hour Network Blackout & Outbox Sync Flush', async () => {
    // 48 hours offline: log 2 closures and 2 expenses
    const state0 = await chargerTout()
    const waterCat = state0.categories.find((c) => c.suit_gallons)

    // Day 1
    await enregistrerJournee({
      date: '2026-07-10',
      montant: 8000,
      moncash: 2000,
      gallons: 320,
      prix_reference: 25,
    })
    await enregistrerDepense({
      occurred_at: '2026-07-10T11:00:00.000Z',
      category_id: null,
      total: 500,
      designation: 'Glace',
    })

    // Day 2
    await enregistrerJournee({
      date: '2026-07-11',
      montant: 7500,
      moncash: 2500,
      gallons: 300,
      prix_reference: 25,
    })
    await enregistrerDepense({
      occurred_at: '2026-07-11T09:00:00.000Z',
      category_id: waterCat.id,
      quantity: 1200,
      total: 9600,
      designation: "Camion d'eau #2",
    })

    // Outbox holds 4 operations
    const pendingCount = await compterOutbox()
    expect(pendingCount).toBe(4)

    // Network returns: Sync simulates batch flush
    const outboxRecords = await lireOutbox(100)
    expect(outboxRecords.length).toBe(4)

    // Acknowledge server receipt
    const seqs = outboxRecords.map((r) => r.seq)
    await retirerOutbox(seqs)

    // Verify outbox completely drained with zero data loss
    expect(await compterOutbox()).toBe(0)
    const finalState = await chargerTout()
    expect(finalState.journees.length).toBe(2)
    expect(finalState.depenses.length).toBe(2)
  })

  it('Scenario 4: Price Shock Deliveries & FIFO Cost Layering', async () => {
    const state0 = await chargerTout()
    const waterCat = state0.categories.find((c) => c.suit_gallons)

    // Lot 1: 1,200 gal @ 7.50 HTG = 9,000 HTG
    await enregistrerDepense({
      occurred_at: '2026-07-01T08:00:00.000Z',
      category_id: waterCat.id,
      quantity: 1200,
      total: 9000,
    })

    // Lot 2: 1,200 gal @ 9.00 HTG = 10,800 HTG (Fuel shock)
    await enregistrerDepense({
      occurred_at: '2026-07-03T08:00:00.000Z',
      category_id: waterCat.id,
      quantity: 1200,
      total: 10800,
    })

    // Sales: 1,500 gallons sold across 3 days
    await enregistrerJournee({
      date: '2026-07-01',
      montant: 12500,
      gallons: 500,
      prix_reference: 25,
    })
    await enregistrerJournee({
      date: '2026-07-02',
      montant: 12500,
      gallons: 500,
      prix_reference: 25,
    })
    await enregistrerJournee({
      date: '2026-07-03',
      montant: 12500,
      gallons: 500,
      prix_reference: 25,
    })

    const state = await chargerTout()
    const suivi = suiviApprovisionnements(state)
    expect(suivi.lots.length).toBe(2)

    // Lot 1 (oldest lot): 1,200 gal consumed -> 100% depleted
    const l1 = suivi.lots.find((l) => l.coutGallon === 7.5)
    expect(l1.statut).toBe('epuise')
    expect(l1.restant).toBe(0)
    expect(l1.vendus).toBe(1200)

    // Lot 2 (newer lot): 300 gal consumed -> 900 gal remaining
    const l2 = suivi.lots.find((l) => l.coutGallon === 9.0)
    expect(l2.statut).toBe('en-cours')
    expect(l2.restant).toBe(900)
    expect(l2.vendus).toBe(300)

    // Total stock remaining = 900 gallons
    expect(gallonsEnStock(state)).toBe(900)

    // Weighted average cost across period: (9000 + 10800) / 2400 = 8.25 HTG/gal
    const periode = creerPeriode('2026-07-01', '2026-07-03')
    expect(coutMoyenPondere(state, periode)).toBe(8.25)
  })

  it('Scenario 5: Cross-Device Migration & Disaster Recovery', async () => {
    // 1. Setup Source Device State
    await ecrireReglages({ nom_utilisateur: 'Kiosque Pétion-Ville', prix_vente_gallon: 25 })
    await enregistrerJournee({
      date: '2026-07-01',
      montant: 10000,
      moncash: 2000,
      gallons: 400,
      prix_reference: 25,
    })
    await enregistrerDepense({
      occurred_at: '2026-07-01T08:00:00.000Z',
      total: 3500,
      designation: 'Entretien pompe',
    })

    // 2. Export full JSON backup
    const backup = await exporterJSON({ avecRecus: true })
    expect(backup.application).toBe('Aqua Track')
    expect(backup.journees.length).toBe(1)
    expect(backup.depenses.length).toBe(1)

    // 3. Simulate new phone / wiped browser
    await toutEffacer()
    const wipedState = await chargerTout()
    expect(wipedState.journees.length).toBe(0)

    // 4. Ingest backup on new device
    await importerJSON(backup)

    // 5. Verify 100% data fidelity on target device
    const restoredState = await chargerTout()
    expect(restoredState.journees.length).toBe(1)
    expect(restoredState.journees[0].montant).toBe(10000)
    expect(restoredState.depenses[0].total).toBe(3500)
    expect(restoredState.reglages.nom_utilisateur).toBe('Kiosque Pétion-Ville')
  })
})
