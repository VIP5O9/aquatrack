import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import {
  enregistrerJournee,
  enregistrerCategorie,
  enregistrerDepense,
  adopterCategorie,
  amorcerCategories,
  supprimer,
  fusionnerDepuisServeur,
  idsOutboxEnAttente,
  lireOutbox,
  chargerTout,
} from './db.js'

/**
 * Fusion des donnees venues du serveur.
 *
 * Le point sensible du correctif : le serveur fait foi, SAUF pour une ligne
 * modifiee localement et pas encore envoyee. Plus aucune comparaison
 * d'horloge. Ces tests verrouillent ce comportement.
 */

const journeeServeur = (id, date, montant) => ({
  id,
  date,
  montant,
  moncash: 0,
  gallons: montant / 25,
  gallons_source: 'estime',
  releve_compteur: null,
  prix_reference: 25,
  note: '',
  updated_at: '2020-01-01T00:00:00.000Z', // volontairement ANCIEN : l'horloge ne doit plus compter
  deleted: false,
  kiosque_id: 'kiosque-serveur', // doit etre retire a la fusion
})

const journeeParDate = async (date) =>
  (await chargerTout()).journees.find((j) => j.date === date)

describe('fusionnerDepuisServeur', () => {
  it('liste les identifiants en attente d’envoi', async () => {
    const j = await enregistrerJournee({
      date: '2026-07-01',
      montant: 1000,
      gallons: 40,
      prix_reference: 25,
    })
    const attente = await idsOutboxEnAttente()
    expect(attente.has(j.id)).toBe(true)
  })

  it('PROTÈGE une ligne modifiée localement et pas encore envoyée', async () => {
    const j = await journeeParDate('2026-07-01') // montant local = 1000, en attente

    // Le serveur prétend 9999, avec un horodatage plus ancien : sans protection,
    // l'ancienne comparaison d'horloge aurait pu l'adopter, écrasant la saisie.
    await fusionnerDepuisServeur(
      'journees',
      [journeeServeur(j.id, '2026-07-01', 9999)],
      new Set([j.id]),
    )

    expect((await journeeParDate('2026-07-01')).montant).toBe(1000)
  })

  it('ADOPTE la version du serveur pour une ligne sans modification en attente', async () => {
    const j = await journeeParDate('2026-07-01')

    // Même identifiant, mais cette fois rien en attente : le serveur fait foi.
    await fusionnerDepuisServeur(
      'journees',
      [journeeServeur(j.id, '2026-07-01', 5555)],
      new Set(), // aucune protection
    )

    expect((await journeeParDate('2026-07-01')).montant).toBe(5555)
  })

  it('insère une ligne inconnue et retire kiosque_id', async () => {
    await fusionnerDepuisServeur(
      'journees',
      [journeeServeur('venue-du-serveur', '2026-08-15', 2000)],
      new Set(),
    )

    const ligne = await journeeParDate('2026-08-15')
    expect(ligne.montant).toBe(2000)
    // La notion serveur ne doit pas rester en local.
    expect('kiosque_id' in ligne).toBe(false)
  })
})

describe('adopterCategorie', () => {
  it('rattache les dépenses du doublon à la catégorie gardée, puis l’efface', async () => {
    const gardee = await enregistrerCategorie({
      nom: 'Bouchon',
      color: '#22D3F5',
      unit: 'montant',
      suit_gallons: false,
      position: 0,
    })
    const doublon = await enregistrerCategorie({
      nom: 'Bouchon', // même nom : le futur index l'aurait refusé côté serveur
      color: '#22D3F5',
      unit: 'montant',
      suit_gallons: false,
      position: 1,
    })
    await enregistrerDepense({
      occurred_at: '2026-07-10T09:00:00.000Z',
      category_id: doublon.id,
      total: 500,
    })

    await adopterCategorie(doublon.id, gardee.id)

    const { categories, depenses } = await chargerTout()
    // Le doublon a disparu, la gardée reste.
    expect(categories.some((c) => c.id === doublon.id)).toBe(false)
    expect(categories.some((c) => c.id === gardee.id)).toBe(true)
    // La dépense pointe désormais vers la catégorie gardée.
    expect(depenses.every((d) => d.category_id !== doublon.id)).toBe(true)
    expect(depenses.some((d) => d.category_id === gardee.id)).toBe(true)
  })
})

describe('amorcerCategories', () => {
  it('recrée des catégories quand il n’en reste aucune de VIVANTE', async () => {
    // Supprime toute catégorie encore vivante (suppression logique).
    for (const c of (await chargerTout()).categories) {
      await supprimer('categories', c.id)
    }
    // Il reste des lignes (des tombes), mais zéro vivante.
    expect((await chargerTout()).categories.length).toBe(0)

    // L'ancienne version voyait « des lignes existent » et ne créait rien,
    // laissant l'appareil sans catégorie utilisable. Elle doit maintenant
    // repartir de catégories fraîches.
    const creees = await amorcerCategories()
    expect(creees.length).toBeGreaterThanOrEqual(3)
    expect((await chargerTout()).categories.length).toBeGreaterThanOrEqual(3)
  })
})

describe('attribution — « saisi par qui » (user_id)', () => {
  it('conserve le user_id sur la journée ET dans le payload d’envoi', async () => {
    const j = await enregistrerJournee({
      date: '2026-09-10',
      montant: 1500,
      gallons: 60,
      prix_reference: 25,
      user_id: 'user-marie',
    })

    // Stocké sur la ligne locale : l'attribution marche tout de suite, hors ligne.
    const local = (await chargerTout()).journees.find((x) => x.id === j.id)
    expect(local.user_id).toBe('user-marie')

    // Et présent dans le payload qui partira au serveur (RLS l'accepte : c'est
    // le compte courant).
    const entree = (await lireOutbox(500)).find(
      (e) => e.table === 'journees' && e.row_id === j.id,
    )
    expect(entree?.payload.user_id).toBe('user-marie')
  })

  it('conserve le user_id sur une dépense', async () => {
    const d = await enregistrerDepense({
      occurred_at: '2026-09-10T12:00:00.000Z',
      category_id: null,
      total: 800,
      user_id: 'user-paul',
    })
    const dep = (await chargerTout()).depenses.find((x) => x.id === d.id)
    expect(dep.user_id).toBe('user-paul')
  })

  it('garde l’auteur d’origine si la re-clôture se fait sans compte', async () => {
    await enregistrerJournee({
      date: '2026-09-11',
      montant: 1000,
      gallons: 40,
      prix_reference: 25,
      user_id: 'user-marie',
    })
    // Re-clôture hors connexion (aucun compte courant) : la valeur change, mais
    // l'auteur d'origine ne doit pas être effacé.
    await enregistrerJournee({
      date: '2026-09-11',
      montant: 1200,
      gallons: 48,
      prix_reference: 25,
      user_id: null,
    })

    const local = (await chargerTout()).journees.find((x) => x.date === '2026-09-11')
    expect(local.montant).toBe(1200)
    expect(local.user_id).toBe('user-marie')
  })
})
