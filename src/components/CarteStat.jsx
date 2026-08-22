import Delta from './Delta.jsx'

/**
 * Mini-carte de statistique, utilisée par paires sous la carte principale.
 * Même langage que CarteHero mais à mi-largeur : titre, chiffre, variation,
 * sous-ligne avec bordures optiques et retours tactiles.
 */
export default function CarteStat({
  titre,
  chiffre,
  delta,
  sousLigne,
  alerte = false,
  icone: Icone,
  onClick,
  className = '',
}) {
  const Element = onClick ? 'button' : 'section'

  return (
    <Element
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'carte flex flex-col justify-between text-left transition-all duration-150',
        onClick ? 'tactile-press cursor-pointer hover:shadow-md active:scale-[0.98]' : '',
        className,
      ].join(' ')}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-medium" style={{ color: 'var(--texte-doux)' }}>
          {titre}
        </h3>
        {Icone && (
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-[10px] transition-colors"
            style={{
              background: alerte ? 'var(--rouge-clair)' : 'var(--surface-doux)',
              color: alerte ? 'var(--rouge)' : 'var(--texte-tres-doux)',
            }}
          >
            <Icone size={15} strokeWidth={1.75} />
          </span>
        )}
      </header>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="chiffre-stat tracking-tight">{chiffre}</span>
        <Delta valeur={delta} />
      </div>

      {sousLigne && (
        <p
          className="mt-1 text-xs transition-colors"
          style={{
            // Une alerte (stock bas) passe en texte plein plutôt qu'en gris :
            // c'est le seul moment où cette sous-ligne doit attirer l'œil.
            color: alerte ? 'var(--texte)' : 'var(--texte-doux)',
            fontWeight: alerte ? 500 : 400,
          }}
        >
          {sousLigne}
        </p>
      )}
    </Element>
  )
}

