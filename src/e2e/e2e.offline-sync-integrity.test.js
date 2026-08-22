import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  chargerTout,
  enregistrerJournee,
  enregistrerDepense,
  enregistrerCategorie,
  supprimer,
  supprimerDepense,
  toutEffacer,
  amorcerCategories,
  reordonnerCategories,
  exporterJSON,
  importerJSON,
  compterOutbox,
  lireOutbox,
  retirerOutbox,
  bloquerOutbox,
  compterBloques,
  idsOutboxEnAttente,
  fusionnerDepuisServeur,
  lireReglages,
  ecrireReglages,
  lireMeta,
  ecrireMeta,
  TABLES,
  CATEGORIES_DEFAUT,
} from '../lib/db.js'

describe('F21: Business Logic & Transactional Outbox (Tier 1 & Tier 2)', () => {
  beforeEach(async () => {
    await toutEffacer()
    await amorcerCategories()
  })

  it('T1.F21.01: writes daily closure locally and enqueues transactional outbox item', async () => {
    const j = await enregistrerJournee({
      date: '2026-07-20',
      montant: 5000,
      moncash: 1000,
      gallons: 200,
      prix_reference: 25,
    })

    expect(j.id).toBeDefined()
    expect(j.date).toBe('2026-07-20')

    const outbox = await lireOutbox(10)
    expect(outbox.length).toBeGreaterThan(0)
    const matching = outbox.find((o) => o.table === 'journees' && o.row_id === j.id)
    expect(matching).toBeDefined()
    expect(matching.table).toBe('journees')
    expect(matching.row_id).toBe(j.id)
    expect(matching.payload.montant).toBe(5000)
  })

  it('T1.F21.02: writes expense locally and enqueues transactional outbox item', async () => {
    const d = await enregistrerDepense({
      occurred_at: '2026-07-20T10:00:00.000Z',
      total: 1200,
      designation: 'Bouchons de remplacement',
    })

    expect(d.id).toBeDefined()
    const count = await compterOutbox()
    expect(count).toBeGreaterThan(0)
  })

  it('T1.F21.03: retires outbox items after successful sync acknowledgement', async () => {
    await enregistrerJournee({ date: '2026-07-21', montant: 2000, gallons: 80, prix_reference: 25 })
    const outboxBefore = await lireOutbox(10)
    const seqs = outboxBefore.map((o) => o.seq)
    expect(seqs.length).toBeGreaterThan(0)

    await retirerOutbox(seqs)
    const countAfter = await compterOutbox()
    expect(countAfter).toBe(0)
  })

  it('T1.F21.04: quarantines broken outbox items with bloquerOutbox', async () => {
    await enregistrerJournee({ date: '2026-07-22', montant: 3000, gallons: 120, prix_reference: 25 })
    const outbox = await lireOutbox(10)
    const firstSeq = outbox[0].seq

    await bloquerOutbox([firstSeq], 'Foreign key error')
    expect(await compterBloques()).toBe(1)
  })

  it('T1.F21.05: idsOutboxEnAttente returns set of currently pending row IDs', async () => {
    const j = await enregistrerJournee({
      date: '2026-07-23',
      montant: 4000,
      gallons: 160,
      prix_reference: 25,
    })
    const pendingSet = await idsOutboxEnAttente()
    expect(pendingSet.has(j.id)).toBe(true)
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F21.01: server merge protects pending dirty rows against old server snapshots', async () => {
    const j = await enregistrerJournee({
      date: '2026-07-24',
      montant: 1000,
      gallons: 40,
      prix_reference: 25,
    })

    // Local is 1000 and dirty (in pending outbox)
    // Server tries to send 9999
    await fusionnerDepuisServeur(
      'journees',
      [
        {
          id: j.id,
          date: '2026-07-24',
          montant: 9999,
          gallons: 40,
          updated_at: '2020-01-01T00:00:00.000Z',
          deleted: false,
        },
      ],
      new Set([j.id]),
    )

    const all = await chargerTout()
    const saved = all.journees.find((row) => row.id === j.id)
    expect(saved.montant).toBe(1000) // Protected!
  })

  it('T2.F21.02: server merge adopts clean server rows when not pending locally', async () => {
    const serverRow = {
      id: 'server-clean-1',
      date: '2026-07-25',
      montant: 8888,
      moncash: 0,
      gallons: 355.52,
      gallons_source: 'estime',
      releve_compteur: null,
      prix_reference: 25,
      note: '',
      updated_at: '2026-07-25T12:00:00.000Z',
      deleted: false,
      kiosque_id: 'remote-kiosk',
    }

    await fusionnerDepuisServeur('journees', [serverRow], new Set())
    const all = await chargerTout()
    const found = all.journees.find((r) => r.id === 'server-clean-1')
    expect(found).toBeDefined()
    expect(found.montant).toBe(8888)
    expect('kiosque_id' in found).toBe(false)
  })

  it('T2.F21.03: soft-deleting a row marks deleted: true and enqueues outbox record', async () => {
    const j = await enregistrerJournee({
      date: '2026-07-26',
      montant: 2500,
      gallons: 100,
      prix_reference: 25,
    })
    await supprimer('journees', j.id)

    const all = await chargerTout()
    expect(all.journees.some((r) => r.id === j.id)).toBe(false)

    const outbox = await lireOutbox(20)
    const delRecord = outbox.find((o) => o.row_id === j.id && o.payload?.deleted === true)
    expect(delRecord).toBeDefined()
  })
})

describe('F22: Comprehensive Verification & Data Integrity (Tier 1 & Tier 2)', () => {
  beforeEach(async () => {
    await toutEffacer()
    await amorcerCategories()
  })

  it('T1.F22.01: exports complete database state via exporterJSON', async () => {
    await enregistrerJournee({ date: '2026-07-01', montant: 5000, gallons: 200, prix_reference: 25 })
    await enregistrerDepense({ occurred_at: '2026-07-01T09:00:00.000Z', total: 1000 })

    const backup = await exporterJSON({ avecRecus: true })
    expect(backup.application).toBe('Aqua Track')
    expect(backup.version).toBe(2)
    expect(backup.journees.length).toBe(1)
    expect(backup.depenses.length).toBe(1)
    expect(backup.categories.length).toBeGreaterThanOrEqual(3)
  })

  it('T1.F22.02: imports and restores complete database state via importerJSON', async () => {
    const backupData = {
      application: 'Aqua Track',
      version: 2,
      journees: [
        {
          id: 'j-restore',
          date: '2026-08-01',
          montant: 12000,
          moncash: 3000,
          gallons: 480,
          prix_reference: 25,
          deleted: false,
        },
      ],
      depenses: [
        {
          id: 'd-restore',
          occurred_at: '2026-08-01T11:00:00.000Z',
          total: 4000,
          category_id: null,
          deleted: false,
        },
      ],
      categories: [
        {
          id: 'c-restore',
          nom: 'Special Category',
          color: '#22D3F5',
          suit_gallons: false,
          deleted: false,
        },
      ],
      reglages: { prix_vente_gallon: 30 },
      meta: [],
    }

    await importerJSON(backupData)
    const restored = await chargerTout()
    expect(restored.journees.length).toBe(1)
    expect(restored.journees[0].montant).toBe(12000)
    expect(restored.depenses.length).toBe(1)
    expect(restored.depenses[0].total).toBe(4000)
    expect(restored.reglages.prix_vente_gallon).toBe(30)
  })

  it('T1.F22.03: amorcerCategories ensures default categories exist', async () => {
    const cats = (await chargerTout()).categories
    expect(cats.length).toBeGreaterThanOrEqual(CATEGORIES_DEFAUT.length)
    expect(cats.some((c) => c.nom === "Camion d'eau")).toBe(true)
  })

  it('T1.F22.04: reordonnerCategories updates category positions in order', async () => {
    const cats = (await chargerTout()).categories
    const reversedIds = [...cats].reverse().map((c) => c.id)
    await reordonnerCategories(reversedIds)

    const updated = (await chargerTout()).categories
    expect(updated[0].id).toBe(reversedIds[0])
    expect(updated[updated.length - 1].id).toBe(reversedIds[reversedIds.length - 1])
  })

  it('T1.F22.05: reads and writes metadata entries via lireMeta and ecrireMeta', async () => {
    await ecrireMeta('kiosque_test_key', { nom: 'Kiosque Nord' })
    const val = await lireMeta('kiosque_test_key')
    expect(val).toEqual({ nom: 'Kiosque Nord' })

    const missing = await lireMeta('non_existent', 'default_val')
    expect(missing).toBe('default_val')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F22.01: importerJSON rejects incompatible application name', async () => {
    const invalidBackup = {
      application: 'OtherApp Unrelated',
      version: 2,
    }
    await expect(importerJSON(invalidBackup)).rejects.toThrow()
  })

  it('T2.F22.02: toutEffacer completely purges all object stores and resets outbox', async () => {
    await enregistrerJournee({ date: '2026-07-01', montant: 5000, gallons: 200, prix_reference: 25 })
    await toutEffacer()
    const state = await chargerTout()
    expect(state.journees.length).toBe(0)
    expect(state.depenses.length).toBe(0)
    expect(await compterOutbox()).toBe(0)
  })
})
