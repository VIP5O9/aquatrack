import { Droplet, Truck, Package, Paperclip } from 'lucide-react'
import {
  formatHTG, formatGallons, formatPrix, formatDateCourte, normaliser, MONTANT_MASQUE,
} from '../lib/format.js'
import { couleurDonnees } from '../lib/theme.js'
import { useSombre } from '../store/useStore.js'

/**
 * Ligne du journal — motif « Top products » de all_screen.png : vignette
 * arrondie à gauche, libellé et sous-ligne au centre, montant à droite.
 *
 * Deux natures de ligne :
 *   - une clôture de journée (revenu)
 *   - une dépense (réapprovisionnement ou matériel)
 *
 * Le badge vert « Revenu » est la seule couleur hors planche de branding.
 * Les dépenses restent en noir sur gris : introduire du rouge casserait
 * l'identité visuelle pour une information que le signe « − » porte déjà.
 */
export default function LigneJournal({ ligne, onClick, masque = false }) {
  const revenu = ligne.type === 'revenu'
  const sombre = useSombre()
  const couleur = couleurDonnees(ligne.couleur, sombre)
  const Icone = revenu ? Droplet : ligne.suitGallons ? Truck : Package

  return (
    <button
      type="button"
      onClick={onClick}
      className="tactile-press group flex w-full items-center gap-3 py-2.5 text-left transition-all duration-150 active:scale-[0.98]"
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-[14px] transition-transform duration-150 group-hover:scale-105"
        style={{
          background: revenu ? 'var(--surface-doux)' : `${couleur}22`,
          color: revenu ? 'var(--texte)' : couleur,
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        }}
      >
        <Icone size={19} strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium tracking-tight">{ligne.libelle}</span>
        <span className="sous-ligne flex min-w-0 items-center gap-1.5 text-xs">
          {/* Trombone : dit d'un coup d'œil quelles dépenses sont justifiées
              par un reçu, sans avoir à ouvrir chaque ligne. */}
          {ligne.nbRecus > 0 && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.2 bg-[var(--surface-doux)] text-[11px]"
              style={{ color: 'var(--texte-doux)' }}
            >
              <Paperclip size={11} strokeWidth={2} />
              {ligne.nbRecus > 1 && <span>{ligne.nbRecus}</span>}
            </span>
          )}
          <span className="min-w-0 truncate">{ligne.detail}</span>
          {/* Qui a saisi : reste visible (shrink-0) pendant que le détail se
              tronque — c'est l'info de responsabilité, pas un ornement. */}
          {ligne.auteur && (
            <span className="shrink-0 whitespace-nowrap opacity-80">· {ligne.auteur}</span>
          )}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="chiffres block text-sm font-medium tracking-tight">
          {masque ? MONTANT_MASQUE : formatHTG(revenu ? ligne.montant : -ligne.montant, { signe: true })}
        </span>
        <span
          className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
          style={
            revenu
              ? { background: 'var(--vert-clair)', color: 'var(--vert)' }
              : { background: 'var(--surface-doux)', color: 'var(--texte-doux)' }
          }
        >
          {revenu ? 'Revenu' : 'Dépense'}
        </span>
      </span>
    </button>
  )
}

/**
 * Convertit une journee ou une depense en une ligne d'affichage uniforme.
 * Regroupe ici la mise en forme pour que le tableau de bord et le journal
 * affichent rigoureusement la meme chose.
 */
export function versLigne(source, { categories = [], recus = [], membres = [] } = {}) {
  // « Saisi par qui » : on ne l'affiche qu'a partir de deux membres — un
  // kiosque solo n'a personne a distinguer, et « saisi par vous » partout ne
  // serait que du bruit. Un user_id sans membre correspondant (membre retire)
  // ne montre rien plutot qu'un nom trompeur.
  const auteur =
    membres.length >= 2
      ? membres.find((m) => m.user_id === source.user_id)?.nom?.trim() || null
      : null

  if (source.date !== undefined) {
    const libelle = `Recette du ${formatDateCourte(source.date)}`
    const detail = `${formatGallons(source.gallons)} · ${formatPrix(source.prix_reference)}/gallon${
      source.gallons_source === 'compteur' ? ' · compteur' : ''
    }`
    return {
      cle: `j-${source.id}`,
      type: 'revenu',
      tri: `${source.date}T23:59:59`,
      libelle,
      detail,
      auteur,
      montant: source.montant,
      // Corpus de recherche : libelle, note, et le montant en chiffres bruts
      // pour qu'une recherche « 1500 » retombe sur la recette correspondante.
      recherche: normaliser(`${libelle} recette ${source.note ?? ''} ${source.montant}`),
      source,
    }
  }

  const cat = categories.find((c) => c.id === source.category_id)
  const appro = !!cat?.suit_gallons

  // Un achat de matériel porte le nom de l'article ; c'est lui qui permet de
  // retrouver « les bouchons » parmi douze lignes « Achat matériel ».
  const libelle = (!appro && source.designation) || cat?.nom || 'Dépense'

  let detail
  if (appro && source.quantity > 0) {
    detail = `${formatGallons(source.quantity)} · ${formatPrix(source.total / source.quantity)}/gallon`
  } else if (source.quantity > 1) {
    detail = `${cat?.nom ?? ''} · ${source.quantity} × ${formatPrix(source.total / source.quantity)}`
  } else {
    detail = cat?.nom ?? 'Dépense'
  }

  return {
    cle: `d-${source.id}`,
    type: 'depense',
    tri: source.occurred_at,
    libelle,
    detail,
    auteur,
    montant: source.total,
    couleur: cat?.color ?? '#222026',
    suitGallons: !!cat?.suit_gallons,
    nbRecus: recus.filter((r) => r.depense_id === source.id).length,
    // Article, categorie, note et montant : « bouchon » trouve l'achat de
    // bouchons, « camion » les reapprovisionnements, « 2645 » le montant exact.
    recherche: normaliser(
      `${libelle} ${cat?.nom ?? ''} ${source.designation ?? ''} ${source.note ?? ''} ${source.total}`,
    ),
    source,
  }
}
