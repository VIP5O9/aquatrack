import { Truck, ChevronRight, Paperclip } from 'lucide-react'
import { formatHTG, formatGallons, formatPrix, formatDateCourte, MONTANT_MASQUE } from '../lib/format.js'

const STATUTS = {
  'en-cours': { libelle: 'En cours', classe: 'text-[var(--accent)] bg-[var(--surface-doux)]' },
  epuise: { libelle: 'Épuisé', classe: 'text-[var(--texte-doux)] bg-[var(--surface-doux)]' },
  'en-attente': { libelle: 'Pas encore entamé', classe: 'text-[var(--texte-tres-doux)] bg-[var(--surface-doux)]' },
}

/**
 * Ligne d'approvisionnement / lot de camion d'eau.
 *
 * Affiche la progression d'écoulement du camion, le coût unitaire au gallon,
 * le revenu et la marge générée avec retours tactiles Kowalski.
 */
export default function LigneApprovisionnement({
  lot,
  depense,
  onClick,
  masque = false,
  className = '',
}) {
  const date = lot?.date ?? depense?.occurred_at
  const gallons = lot?.gallons ?? depense?.quantity ?? 0
  const cout = lot?.coutGallon ?? (depense?.total && depense?.quantity ? depense.total / depense.quantity : 0)
  const vendus = lot?.vendus ?? 0
  const marge = lot?.marge ?? 0
  const statut = lot?.statut ?? 'en-cours'
  const part = lot?.part ?? (gallons > 0 ? vendus / gallons : 0)
  const pourcent = Math.round(part * 100)
  const nbRecus = depense?.nbRecus ?? 0

  const m = (texte) => (masque ? MONTANT_MASQUE : texte)

  return (
    <div
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={[
        'tactile-press group flex w-full flex-col gap-2 rounded-[16px] p-3 text-left transition-all duration-150',
        onClick ? 'cursor-pointer hover:bg-[var(--surface-doux)]/40 active:scale-[0.98]' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-[12px]"
            style={{
              background: 'rgba(38, 114, 221, 0.12)',
              color: 'var(--accent)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <Truck size={18} strokeWidth={2} />
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="flex items-center gap-1.5 text-sm font-medium">
              <span className="truncate">Camion du {formatDateCourte(date)}</span>
              {nbRecus > 0 && (
                <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-[var(--texte-doux)]">
                  <Paperclip size={11} strokeWidth={2} />
                  {nbRecus > 1 && nbRecus}
                </span>
              )}
            </h4>
            <p className="sous-ligne mt-0.5 truncate">
              {formatGallons(gallons)} à {formatPrix(cout)}/gal
              {lot?.restant > 0 && ` · ${formatGallons(lot.restant)} restants`}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="chiffres block text-sm font-medium">
            {lot?.marge != null ? (vendus > 0 ? m(formatHTG(marge)) : '—') : m(formatHTG(depense?.total))}
          </span>
          <span
            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              STATUTS[statut]?.classe ?? ''
            }`}
          >
            {STATUTS[statut]?.libelle ?? 'Livraison'}
          </span>
        </div>
      </div>

      {/* Jauge d'écoulement du camion */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--surface-doux)' }}
        role="progressbar"
        aria-valuenow={pourcent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.min(100, pourcent)}%`,
            background: statut === 'en-cours' ? 'var(--accent)' : 'var(--action)',
          }}
        />
      </div>
    </div>
  )
}
