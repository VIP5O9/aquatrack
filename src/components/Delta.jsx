import { formatPourcent } from '../lib/format.js'

/**
 * Indicateur de variation : « ↗ +21 % » / « ↘ 10 % ».
 *
 * Gris par DEFAUT : dans all_screen.png les variations sont discretes a cote
 * du grand chiffre, jamais vertes ni rouges — c'est ce qui donne son calme a
 * la maquette, et le sens est deja porte par la fleche.
 *
 * `colore` est l'exception assumee, reservee a la metrique-phare (le benefice
 * net) : la tendance y gagne un vert/rouge. Le cas plat reste neutre — colorer
 * un « ± 0 % » n'aurait aucun sens. Les couleurs viennent de jetons verifies
 * au contraste, avec une variante eclaircie sur fond sombre (`surSombre`).
 */
export default function Delta({ valeur, surSombre = false, colore = false, className = '' }) {
  if (valeur == null || !Number.isFinite(valeur)) return null

  const monte = valeur > 0
  const plat = Math.abs(valeur) < 0.05
  const neutre = surSombre ? 'var(--sur-hero-doux)' : 'var(--texte-doux)'
  const couleur =
    !colore || plat
      ? neutre
      : surSombre
        ? monte
          ? 'var(--delta-haut-hero)'
          : 'var(--delta-bas-hero)'
        : monte
          ? 'var(--delta-haut)'
          : 'var(--delta-bas)'

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs whitespace-nowrap ${className}`}
      style={{ color: couleur }}
    >
      <span aria-hidden="true">{plat ? '→' : monte ? '↗' : '↘'}</span>
      <span className="chiffres">{formatPourcent(valeur, { signe: monte })}</span>
    </span>
  )
}
