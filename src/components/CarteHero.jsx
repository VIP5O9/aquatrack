import { SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import Delta from './Delta.jsx'

/**
 * Carte principale — le motif « Total Orders » / « Total Revenue » /
 * « Total Customers » de all_screen.png.
 *
 * Variantes de la maquette :
 *   - noire / hero : la statistique dominante de l'écran avec dégradé aqua profond
 *   - bleue : une statistique secondaire mise en avant
 *   - blanche : le cas courant
 *
 * C'est l'alternance noir / bleu / blanc qui donne son caractère à la
 * référence. Une app entièrement bleue la raterait.
 */
export default function CarteHero({
  variante = 'blanche',
  titre,
  chiffre,
  delta,
  deltaColore = false,
  sousLigne,
  sousChiffres,
  action,
  onAction,
  // Contrôle libre posé dans le coin haut-droit (ex. l'œil « masquer »).
  coin,
  children,
  className = '',
}) {
  const sombre = variante === 'noire' || variante === 'bleue' || variante === 'hero'
  const fond =
    variante === 'noire'
      ? 'carte-noire'
      : variante === 'bleue'
        ? 'carte-bleue'
        : variante === 'hero'
          ? 'carte-hero'
          : ''
  const Icone = action === 'lien' ? ArrowUpRight : SlidersHorizontal

  return (
    <section className={`carte ${fond} relative overflow-hidden ${className}`}>
      <header className="flex items-start justify-between gap-3">
        <h2 className="titre-carte font-medium tracking-tight">{titre}</h2>
        <div className="-m-2 flex items-center gap-0.5">
          {coin}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              aria-label="Options"
              className="tactile-press rounded-full p-2 opacity-75 transition-all hover:opacity-100 active:scale-95"
            >
              <Icone size={18} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </header>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="chiffre-hero tracking-tight drop-shadow-sm">{chiffre}</span>
        <Delta valeur={delta} surSombre={sombre} colore={deltaColore} />
      </div>

      {sousLigne && <p className="sous-ligne mt-1 text-[13px]">{sousLigne}</p>}

      {/* Rangée de sous-chiffres : utilisée par la carte Bénéfice Net pour
          exposer Revenus et Dépenses sans quitter la carte principale. */}
      {sousChiffres?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:gap-6">
          {sousChiffres.map((s) => (
            <div
              key={s.libelle}
              className={
                sombre
                  ? 'rounded-[14px] bg-white/10 px-3.5 py-2.5 backdrop-blur-sm'
                  : 'rounded-[14px] bg-[var(--surface-doux)] px-3.5 py-2.5'
              }
              style={{
                boxShadow: sombre ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)' : 'none',
              }}
            >
              <p className="sous-ligne text-xs font-normal opacity-85">{s.libelle}</p>
              <p className="chiffres mt-0.5 text-[16px] font-medium tracking-tight">{s.valeur}</p>
            </div>
          ))}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}

