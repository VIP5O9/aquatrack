/**
 * Barre de répartition en deux segments capsules — standard Apple Fluid Glass :
 * Deux capsules à coins arrondis avec éclairage optique et pourcentages intégrés,
 * déclinée sur fond sombre/hero ou sur fond de carte standard.
 */
export default function BarreSplit({ gauche, droite, surSombre = false, className = '' }) {
  const total = (gauche.valeur || 0) + (droite.valeur || 0)
  if (total <= 0) return null

  const partGauche = (gauche.valeur / total) * 100
  const partDroite = 100 - partGauche

  // En dessous de 12%, le texte n'a pas la place minimale pour un affichage aéré
  const lisible = (p) => p >= 12

  const fondGauche = gauche.couleur ?? (surSombre ? 'rgba(255, 255, 255, 0.95)' : 'var(--surface-doux)')
  const texteGauche = gauche.texte ?? (surSombre ? '#124ea4' : 'var(--texte)')
  const fondDroite = droite.couleur ?? (surSombre ? '#0b2654' : 'var(--action)')
  const texteDroite = droite.texte ?? (surSombre ? 'rgba(255, 255, 255, 0.92)' : 'var(--sur-action)')

  const pct = (p) => `${Math.round(p)} %`

  return (
    <div className={`w-full select-none ${className}`}>
      <div className="flex h-13 gap-1.5" style={{ height: 52 }}>
        <div
          className="flex items-center rounded-2xl px-3.5 transition-all duration-300 relative overflow-hidden shadow-xs"
          style={{
            width: `${partGauche}%`,
            background: fondGauche,
            color: texteGauche,
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
          }}
        >
          {lisible(partGauche) && (
            <span className="chiffres text-sm font-bold tracking-tight">{pct(partGauche)}</span>
          )}
        </div>

        <div
          className="flex items-center rounded-2xl px-3.5 transition-all duration-300 relative overflow-hidden shadow-xs"
          style={{
            width: `${partDroite}%`,
            background: fondDroite,
            color: texteDroite,
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {lisible(partDroite) && (
            <span className="chiffres text-sm font-bold tracking-tight">{pct(partDroite)}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <Legende libelle={gauche.libelle} couleur={fondGauche} surSombre={surSombre} />
        <Legende libelle={droite.libelle} couleur={fondDroite} surSombre={surSombre} />
      </div>
    </div>
  )
}

function Legende({ libelle, couleur, surSombre }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color: surSombre ? 'var(--sur-hero-doux)' : 'var(--texte-doux)' }}
    >
      <span
        aria-hidden="true"
        className="inline-block size-2.5 rounded-full shrink-0 shadow-xs"
        style={{ background: couleur, outline: '1px solid rgba(0, 0, 0, 0.08)' }}
      />
      <span>{libelle}</span>
    </span>
  )
}
