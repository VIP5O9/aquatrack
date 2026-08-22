import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { couleurDonnees } from '../lib/theme.js'
import { useSombre } from '../store/useStore.js'

/** Filtres fixes ; les catégories s'y ajoutent dynamiquement à l'affichage. */
export const FILTRES_BASE = [
  { valeur: 'tout', libelle: 'Tout' },
  { valeur: 'revenu', libelle: 'Revenus' },
  { valeur: 'depense', libelle: 'Dépenses' },
]

/**
 * Barre de filtres du journal avec jetons Apple Fluid Glass et interactions tactiles Kowalski.
 *
 * Deux groupes séparés par un trait optique :
 *   1. Nature de l'opération (Tout / Revenus / Dépenses)
 *   2. Catégories personnalisées avec pastilles chromatiques adaptées au thème.
 */
export default function FiltresJournal({
  filtre,
  onChange,
  categories = [],
  action,
  className = '',
}) {
  const sombre = useSombre()

  const pastille = (valeur, libelle, couleurRaw) => {
    const actif = valeur === filtre
    const couleur = couleurRaw ? couleurDonnees(couleurRaw, sombre) : null

    return (
      <button
        key={valeur}
        type="button"
        onClick={() => onChange(valeur)}
        aria-pressed={actif}
        className={[
          'tactile-press inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-all duration-150',
          actif ? 'font-medium shadow-sm' : '',
        ].join(' ')}
        style={{
          background: actif ? 'var(--action)' : 'var(--surface-doux)',
          color: actif ? 'var(--sur-action)' : 'var(--texte-doux)',
        }}
      >
        {couleur && (
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full transition-transform"
            style={{
              background: actif ? 'var(--sur-action)' : couleur,
              boxShadow: actif ? 'none' : `0 0 6px ${couleur}66`,
            }}
          />
        )}
        {libelle}
      </button>
    )
  }

	  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`}>
      {/* Les filtres défilent horizontalement sans barre parasite */}
      <div className="defile-x flex flex-1 items-center gap-1.5 pb-1">
        {FILTRES_BASE.map((f) => pastille(f.valeur, f.libelle))}
        {categories.length > 0 && (
          <span
            aria-hidden="true"
            className="mx-1 h-4 w-px shrink-0 opacity-60"
            style={{ background: 'var(--bordure)' }}
          />
        )}
        {categories.map((c) => pastille(`cat:${c.id}`, c.nom, c.color))}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  )
}


/**
 * Bouton d'export Excel du journal filtré avec retour tactile et confirmation visuelle.
 */
export function BoutonExport({ onExport, disabled }) {
  const [fait, setFait] = useState(false)

  const handleExport = () => {
    const r = onExport()
    if (r !== false) {
      setFait(true)
      setTimeout(() => setFait(false), 2200)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      aria-label="Exporter en Excel"
      className="tactile-press inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 disabled:opacity-40"
      style={{
        background: fait ? 'var(--vert-clair)' : 'var(--surface-doux)',
        color: fait ? 'var(--vert)' : 'var(--texte-doux)',
      }}
    >
      {fait ? (
        <Check size={15} strokeWidth={2.25} style={{ color: 'var(--vert)' }} />
      ) : (
        <Download size={15} strokeWidth={2} />
      )}
      <span className="hidden sm:inline">{fait ? 'Exporté' : 'Excel'}</span>
    </button>
  )
}
