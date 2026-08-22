import { Calendar, Plus } from 'lucide-react'
import { useStore } from '../store/useStore.js'

/**
 * En-tête d'écran — Apple Fluid Glass & Emil Kowalski Standards.
 *
 * Grand titre à typographie optique (`titre-ecran`), bouton pilule de période
 * translucide à bordure 1px rim-light, et bouton d'action principal surélevé
 * avec retour tactile immédiat.
 */
export default function EnTete({
  titre,
  sousTitre,
  periode,
  onPeriode,
  apres,
  avecAjout = true,
}) {
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)

  return (
    <header className="mb-5 select-none">
      <div className="flex items-start justify-between gap-3">
        {/* Titre d'écran principal avec équilibrage de texte */}
        <h1 className="titre-ecran min-w-0 flex-1 text-balance font-medium tracking-tight">
          {titre}
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          {periode && (
            <button
              onClick={onPeriode}
              type="button"
              className="cible-tactile inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-150 active:scale-95"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--rim-light-subtle), var(--ombre-carte)',
                color: 'var(--texte)',
              }}
            >
              <span>{periode}</span>
              <Calendar size={14} strokeWidth={1.75} style={{ color: 'var(--texte-doux)' }} />
            </button>
          )}

          {avecAjout && (
            <button
              onClick={() => ouvrirFeuille('choix')}
              type="button"
              className="cible-tactile hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-150 active:scale-95 lg:inline-flex"
              style={{
                background: 'var(--hero-gradient)',
                color: 'var(--sur-hero)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: 'var(--lueur-accent), var(--ombre-carte)',
              }}
            >
              <Plus size={16} strokeWidth={2.25} />
              <span>Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {(sousTitre || apres) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {sousTitre && <p className="sous-ligne">{sousTitre}</p>}
          {apres}
        </div>
      )}
    </header>
  )
}
