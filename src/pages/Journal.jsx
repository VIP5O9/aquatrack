import { useMemo, useState } from 'react'
import { ScrollText, Search, X } from 'lucide-react'
import EnTete from '../components/EnTete.jsx'
import SegmentPills from '../components/SegmentPills.jsx'
import EtatVide from '../components/EtatVide.jsx'
import LigneJournal, { versLigne } from '../components/LigneJournal.jsx'
import VueCalendrier from '../components/VueCalendrier.jsx'
import SelecteurMois from '../components/SelecteurMois.jsx'
import FiltresJournal, { BoutonExport, FILTRES_BASE } from '../components/FiltresJournal.jsx'
import { useStore, useEtat } from '../store/useStore.js'
import { exporterExcelFiltre } from '../lib/echange.js'
import { formatHTG, cleJour, normaliser, MONTANT_MASQUE } from '../lib/format.js'

/**
 * Journal des opérations.
 *
 * Deux vues qui ne répondent pas à la même question :
 *
 *   - LISTE : « qu'est-ce que j'ai fait ? » — le détail chronologique, avec
 *     le montant et la catégorie de chaque ligne.
 *   - CALENDRIER : « qu'est-ce qui manque ? » — une journée oubliée disparaît
 *     d'une liste, mais saute aux yeux dans une grille.
 *
 * Les deux partagent le mois consulté, pour qu'on puisse basculer de l'une à
 * l'autre sans se reperdre.
 */
const VUES = [
  { valeur: 'liste', libelle: 'Liste' },
  { valeur: 'calendrier', libelle: 'Calendrier' },
]

export default function Journal() {
  const etat = useEtat()
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)
  // Le masquage des montants est global : masquer l'accueil doit aussi masquer
  // le journal, sinon la discrétion fuit par ici.
  const caches = useStore((s) => s.montantsCaches)
  const m = (texte) => (caches ? MONTANT_MASQUE : texte)

  const [vue, setVue] = useState('liste')
  const [filtre, setFiltre] = useState('tout')
  const [recherche, setRecherche] = useState('')
  const maintenant = new Date()
  // La période consultée est une PLAGE de mois : { debut, fin }, chacun
  // { annee, mois }. Un seul mois se représente par debut === fin.
  const moisCourant = { annee: maintenant.getFullYear(), mois: maintenant.getMonth() }
  const [plage, setPlage] = useState({ debut: moisCourant, fin: moisCourant })

  const plageMultiple =
    plage.debut.annee !== plage.fin.annee || plage.debut.mois !== plage.fin.mois

  const requete = normaliser(recherche.trim())
  const enRecherche = requete.length > 0

  // Les catégories rejoignent les filtres : « Camion d'eau », « Bouchon »… pour
  // retrouver toutes les dépenses d'un type sans faire défiler.
  const filtres = useMemo(
    () => [...FILTRES_BASE, ...etat.categories.map((c) => ({ valeur: `cat:${c.id}`, libelle: c.nom }))],
    [etat.categories],
  )
  // Valeur DÉRIVÉE plutôt qu'un setState pendant le rendu : un filtre de
  // catégorie supprimée retombe sur « Tout » sans rester coincé sur une liste
  // vide, et sans effet de bord au rendu.
  const filtreEffectif = filtres.some((f) => f.valeur === filtre) ? filtre : 'tout'

  const d = useMemo(
    () =>
      enRecherche
        ? chercherPartout(etat, requete, filtreEffectif)
        : filtrerPlage(etat, plage, filtreEffectif),
    [etat, plage, filtreEffectif, requete, enRecherche],
  )
  const annees = useMemo(() => anneesAvecDonnees(etat), [etat])

  // Le calendrier n'a de sens que sur UN mois : ni pendant une recherche (qui
  // traverse tout l'historique), ni sur une plage de plusieurs mois. Dans ces
  // cas on force la liste.
  const vueEffective = enRecherche || plageMultiple ? 'liste' : vue

  return (
    <>
      <EnTete titre="Journal" />

      <ChampRecherche valeur={recherche} onChange={setRecherche} />

      {/* Vue et mois n'ont plus cours pendant une recherche : elle traverse
          tous les mois. On les retire plutôt que de les laisser inertes. */}
      {!enRecherche && (
        <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Le choix Liste / Calendrier disparaît sur une plage de plusieurs
              mois : le calendrier ne montre qu'un mois à la fois. */}
          {!plageMultiple && (
            <SegmentPills options={VUES} valeur={vue} onChange={setVue} className="lg:w-64" />
          )}
          <div className="lg:w-72 lg:flex-1">
            <SelecteurMois
              debut={plage.debut}
              fin={plage.fin}
              onChange={(debut, fin) => setPlage({ debut, fin })}
              anneesDisponibles={annees}
            />
          </div>
        </div>
      )}

      {/* Synthèse : le mois consulté, ou le total des résultats en recherche.
          Sans elle, changer de mois — ou lancer une recherche — ne dirait rien
          tant qu'on n'a pas parcouru toute la liste. */}
      <section className="carte mb-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium" style={{ color: 'var(--texte-doux)' }}>
            {enRecherche ? 'Net des résultats' : plageMultiple ? 'Net de la période' : 'Net du mois'}
          </span>
          <span className="chiffre-stat tracking-tight">{m(formatHTG(d.net))}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="sous-ligne text-xs">
            {m(formatHTG(d.revenus))} encaissés · {m(formatHTG(d.totalDepenses))} dépensés
          </span>
          <span className="sous-ligne text-xs">
            {enRecherche
              ? `${d.lignes.length} résultat${d.lignes.length > 1 ? 's' : ''}`
              : `${d.nbCloturees} jour${d.nbCloturees > 1 ? 's' : ''} clôturé${d.nbCloturees > 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      {vueEffective === 'calendrier' ? (
        <section className="carte">
          <VueCalendrier
            journees={d.journees}
            categories={etat.categories}
            depenses={d.depenses}
            annee={plage.debut.annee}
            mois={plage.debut.mois}
            onJour={(c) => ouvrirFeuille('cloture', { date: c.date })}
          />
        </section>
      ) : (
        <>
          <FiltresJournal
            filtre={filtreEffectif}
            onChange={setFiltre}
            categories={etat.categories}
            action={
              <BoutonExport
                disabled={d.lignes.length === 0}
                onExport={() =>
                  exporterExcelFiltre({
                    journees: journeesAExporter(d, filtreEffectif),
                    depenses: depensesAExporter(d, filtreEffectif),
                    categories: etat.categories,
                    recus: etat.recus,
                    suffixe: suffixeExport(plage, filtreEffectif, etat.categories),
                  })
                }
              />
            }
          />

          {d.lignes.length === 0 ? (
            <div className="carte anim-vue">
              <EtatVide
                icone={enRecherche ? Search : ScrollText}
                titre={enRecherche ? 'Aucun résultat' : 'Aucune opération ce mois-ci'}
                texte={
                  enRecherche
                    ? `Rien ne correspond à « ${recherche.trim()} ». Essayez un nom d'article, une catégorie ou un montant.`
                    : 'Changez de mois, ou clôturez une journée pour commencer.'
                }
              />
            </div>
          ) : (
            <section className="carte">
              {/* `key` sur le filtre + la période : la liste se rejoue à chaque
                  changement, ce qui fait « respirer » le résultat sans être un
                  spectacle. Le décalage par ligne est plafonné à 12. */}
              <ul key={`${filtreEffectif}-${cleDePlage(plage)}-${requete}`} className="anim-liste">
                {d.lignes.map((l, i) => (
                  <li key={l.cle} style={{ '--i': Math.min(i, 12) }}>
                    <LigneJournal
                      ligne={l}
                      masque={caches}
                      onClick={() =>
                        l.type === 'revenu'
                          ? ouvrirFeuille('cloture', { date: l.source.date })
                          : l.suitGallons
                            ? ouvrirFeuille('lot', { id: l.source.id })
                            : ouvrirFeuille('depense', l.source)
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  )
}

/**
 * Champ de recherche.
 *
 * Une croix apparaît dès qu'on a tapé : effacer une recherche au doigt, lettre
 * par lettre, est pénible — un seul appui doit suffire à revenir à la liste.
 */
function ChampRecherche({ valeur, onChange }) {
  return (
    <div className="relative mb-3">
      <Search
        size={17}
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
        style={{ color: 'var(--texte-doux)' }}
      />
      <input
        type="search"
        inputMode="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un article, une catégorie, un montant…"
        aria-label="Rechercher dans le journal"
        className="w-full rounded-[16px] py-3 pr-11 pl-11 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]/30"
        style={{ background: 'var(--surface-doux)' }}
      />
      {valeur && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="tactile-press absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-full transition-transform active:scale-90"
          style={{ color: 'var(--texte-doux)' }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/**
 * Recherche à travers TOUT l'historique, tous mois confondus.
 *
 * Retrouver « les bouchons » ne doit pas obliger à se souvenir du mois de
 * l'achat : c'est justement quand on ne sait plus quand qu'on cherche. Le
 * filtre de type (revenus / dépenses) reste appliqué, lui.
 */
function construireLignes(journees, depenses, etat, filtre) {
  const estCat = filtre.startsWith('cat:')
  const idCat = estCat ? filtre.slice(4) : null

  const avecRevenus = filtre === 'tout' || filtre === 'revenu'
  const depensesFiltrees =
    filtre === 'revenu'
      ? []
      : estCat
        ? depenses.filter((x) => x.category_id === idCat)
        : depenses

  return [
    ...(avecRevenus ? journees.map((j) => versLigne(j, etat)) : []),
    ...depensesFiltrees.map((x) => versLigne(x, etat)),
  ].sort((a, b) => b.tri.localeCompare(a.tri))
}

function chercherPartout(etat, requete, filtre) {
  const lignes = construireLignes(etat.journees, etat.depenses, etat, filtre).filter((l) =>
    l.recherche.includes(requete),
  )

  const revenus = lignes.filter((l) => l.type === 'revenu').reduce((t, l) => t + l.montant, 0)
  const totalDepenses = lignes.filter((l) => l.type === 'depense').reduce((t, l) => t + l.montant, 0)

  return { lignes, revenus, totalDepenses, net: revenus - totalDepenses }
}

function filtrerPlage(etat, plage, filtre) {
  const debut = cleJour(new Date(plage.debut.annee, plage.debut.mois, 1))
  const fin = cleJour(new Date(plage.fin.annee, plage.fin.mois + 1, 0))
  const dans = (cle) => cle >= debut && cle <= fin

  const journees = etat.journees.filter((j) => dans(j.date))
  const depenses = etat.depenses.filter((x) => dans(cleJour(new Date(x.occurred_at))))

  const revenus = journees.reduce((t, j) => t + j.montant, 0)
  const totalDepenses = depenses.reduce((t, x) => t + x.total, 0)

  return {
    journees,
    depenses,
    lignes: construireLignes(journees, depenses, etat, filtre),
    revenus,
    totalDepenses,
    net: revenus - totalDepenses,
    nbCloturees: journees.length,
  }
}

/* --- Export : quoi exporter, sous quel nom, selon le filtre courant --------
   Le fichier reflète exactement ce qui est à l'écran. Un filtre « Revenus »
   n'exporte que les recettes ; un filtre de catégorie, que ses dépenses. */

const moisCle = (x) => `${x.annee}-${String(x.mois + 1).padStart(2, '0')}`
const cleDePlage = (p) => `${moisCle(p.debut)}_${moisCle(p.fin)}`

function journeesAExporter(d, filtre) {
  return filtre === 'tout' || filtre === 'revenu' ? d.journees : []
}

function depensesAExporter(d, filtre) {
  if (filtre === 'revenu') return []
  if (filtre.startsWith('cat:')) {
    const id = filtre.slice(4)
    return d.depenses.filter((x) => x.category_id === id)
  }
  return d.depenses
}

/** Suffixe de nom de fichier : période + intitulé du filtre, en clair. */
function suffixeExport(plage, filtre, categories) {
  let s = moisCle(plage.debut)
  if (plage.debut.annee !== plage.fin.annee || plage.debut.mois !== plage.fin.mois) {
    s += `_a_${moisCle(plage.fin)}`
  }
  if (filtre === 'revenu') s += '_recettes'
  else if (filtre === 'depense') s += '_depenses'
  else if (filtre.startsWith('cat:')) {
    const nom = categories.find((c) => c.id === filtre.slice(4))?.nom
    if (nom) s += '_' + normaliser(nom).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  return s
}

/** Années pour lesquelles il existe au moins une opération. */
function anneesAvecDonnees(etat) {
  const s = new Set()
  for (const j of etat.journees) s.add(Number(j.date.slice(0, 4)))
  for (const x of etat.depenses) s.add(new Date(x.occurred_at).getFullYear())
  return [...s]
}

