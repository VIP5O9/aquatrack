import { Truck, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import EtatVide from './EtatVide.jsx'
import Pastille from './Pastille.jsx'
import { useStore } from '../store/useStore.js'
import { formatHTG, formatPrix, formatGallons, formatDateCourte } from '../lib/format.js'

/**
 * Suivi FIFO des approvisionnements — rendement et écoulement par camion.
 * Barres de progression illuminées avec lueur aqua/teal, badges de statut
 * dynamiques et indicateurs de marge par lot.
 */
export default function SuiviLots({ suivi, limite = 5 }) {
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)

  if (!suivi?.lots?.length) {
    return (
      <EtatVide
        icone={Truck}
        titre="Aucun approvisionnement"
        texte="Saisissez un achat de camion pour suivre ce que chaque livraison vous rapporte."
      />
    )
  }

  const lots = suivi.lots.slice(0, limite)
  const masques = suivi.lots.length - lots.length

  return (
    <div className="flex flex-col gap-3">
      {lots.map((l) => (
        <Lot key={l.id} lot={l} onOuvrir={() => ouvrirFeuille('lot', { id: l.id })} />
      ))}

      {masques > 0 && (
        <p className="sous-ligne text-center pt-1 text-xs">
          {masques} livraison{masques > 1 ? 's' : ''} plus ancienne
          {masques > 1 ? 's' : ''} non affichée{masques > 1 ? 's' : ''}.
        </p>
      )}

      {suivi.nonAttribue > 1 && (
        <div className="mt-1">
          <Pastille bloc>
            <span className="font-semibold">{formatGallons(suivi.nonAttribue)}</span> vendus ne sont
            rattachés à aucun camion enregistré ({formatHTG(suivi.revenuNonAttribue)}).
            Stock antérieur à l'utilisation de l'application.
          </Pastille>
        </div>
      )}
    </div>
  )
}

const STATUTS = {
  'en-cours': {
    libelle: 'En cours',
    icone: Sparkles,
    classeBadge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20',
  },
  epuise: {
    libelle: 'Épuisé',
    icone: CheckCircle2,
    classeBadge: 'bg-[var(--surface-doux)] text-[var(--texte-doux)] border border-[var(--border-subtle)]',
  },
  'en-attente': {
    libelle: 'En attente',
    icone: Clock,
    classeBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
  },
}

function Lot({ lot, onOuvrir }) {
  const enCours = lot.statut === 'en-cours'
  const pourcent = Math.round(lot.part * 100)
  const statutConfig = STATUTS[lot.statut] || STATUTS['epuise']
  const IconeStatut = statutConfig.icone

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOuvrir}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOuvrir())}
      className="group relative rounded-2xl p-3.5 border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface-doux)]/30 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--texte)] truncate">
            <span>Camion du {formatDateCourte(lot.date)}</span>
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statutConfig.classeBadge}`}
          >
            <IconeStatut size={11} strokeWidth={2.5} />
            {statutConfig.libelle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="chiffres text-sm font-bold text-[var(--texte)]">
            {lot.vendus > 0 ? formatHTG(lot.marge) : '—'}
          </span>
          <ChevronRight
            size={15}
            strokeWidth={2}
            className="text-[var(--texte-tres-doux)] group-hover:text-[var(--accent)] transition-colors"
          />
        </div>
      </header>

      <p className="sous-ligne mt-1 text-xs">
        {formatGallons(lot.gallons)} à {formatPrix(lot.coutGallon)}/gal ·{' '}
        {lot.vendus > 0 ? `${formatHTG(lot.revenu)} encaissés` : 'Stock en réserve'}
      </p>

      {/* Barre d'écoulement illuminée */}
      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-doux)] relative border border-[var(--border-subtle)]"
        role="img"
        aria-label={`${pourcent} % écoulé`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, pourcent))}%`,
            background: enCours
              ? 'linear-gradient(90deg, #2672dd 0%, #06b6d4 100%)'
              : 'var(--action)',
            boxShadow: enCours ? '0 0 12px rgba(6, 182, 212, 0.45)' : 'none',
          }}
        />
      </div>

      {/* Badges de métriques & timeline */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--surface-doux)] text-[11px] font-semibold text-[var(--texte)]">
            {pourcent} % écoulé
          </span>
          {lot.restant > 1 && (
            <span className="text-[var(--texte-doux)] font-medium text-[11px]">
              {formatGallons(lot.restant)} restants
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[var(--texte-doux)] text-[11px] font-medium">
          {lot.margeParGallon != null && (
            <span>
              Marge : <strong className="text-[var(--texte)]">{formatPrix(lot.margeParGallon)}</strong>/gal
            </span>
          )}
          {lot.jours != null && <span>· {lot.jours} j</span>}
        </div>
      </div>
    </article>
  )
}
