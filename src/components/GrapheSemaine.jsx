import { useState } from 'react'
import { formatHTG } from '../lib/format.js'

/**
 * Activité par jour de la semaine — motif matrice de points (10 niveaux) :
 * Chaque jour de la semaine est une colonne de 10 points arrondis,
 * remplis du bas vers le haut proportionnellement à la moyenne observée.
 * Infobulle flottante frosted glass au survol ou toucher tactile.
 */
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const NIVEAUX = 10
const COTE = 7
const ESPACE = 2.5

export default function GrapheSemaine({ donnees, jourActif = null }) {
  const [survole, setSurvole] = useState(null)
  if (!donnees?.length) return null

  // Comparaison sur les moyennes par journée réellement enregistrée
  const max = Math.max(...donnees.map((d) => d.moyenne), 1)
  const hauteur = NIVEAUX * (COTE + ESPACE) - ESPACE

  return (
    <div className="w-full select-none pt-2">
      <div className="flex items-end justify-between gap-1 sm:gap-2">
        {donnees.map((d, i) => {
          const remplis = Math.round((d.moyenne / max) * NIVEAUX)
          const estJourCourant = i === jourActif
          const estSurvole = i === survole
          const actif = estJourCourant || estSurvole

          const legende =
            d.nb > 0
              ? `${formatHTG(d.moyenne)} en moyenne · ${d.nb} ${JOURS_LONGS[i]}${d.nb > 1 ? 's' : ''}`
              : 'Aucune journée enregistrée'

          return (
            <div key={i} className="relative flex flex-1 flex-col items-center">
              {/* Infobulle flottante frosted glass */}
              {estSurvole && (
                <div
                  className="absolute -top-11 z-20 pointer-events-none"
                  style={
                    i <= 1
                      ? { left: 0 }
                      : i >= donnees.length - 2
                        ? { right: 0 }
                        : { left: '50%', transform: 'translateX(-50%)' }
                  }
                >
                  <div
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      color: '#0b0c0f',
                      backdropFilter: 'blur(16px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <span className="font-semibold">{legende}</span>
                  </div>
                </div>
              )}

              {/* Matrice SVG 10 niveaux */}
              <svg
                width="100%"
                height={hauteur}
                viewBox={`0 0 ${COTE} ${hauteur}`}
                preserveAspectRatio="none"
                onMouseEnter={() => setSurvole(i)}
                onMouseLeave={() => setSurvole(null)}
                onTouchStart={() => setSurvole(i)}
                role="img"
                aria-label={`${JOURS_LONGS[i]} : ${legende}`}
                className="transition-transform duration-150 hover:scale-105 cursor-pointer"
                style={{ maxWidth: 28 }}
              >
                {Array.from({ length: NIVEAUX }, (_, n) => {
                  const y = hauteur - (n + 1) * (COTE + ESPACE) + ESPACE
                  const estRempli = n < remplis
                  let couleur = 'var(--sur-hero-faible)'

                  if (estRempli) {
                    couleur = actif ? '#22D3F5' : 'rgba(255, 255, 255, 0.92)'
                  }

                  return (
                    <rect
                      key={n}
                      x={0}
                      y={y}
                      width={COTE}
                      height={COTE}
                      rx={1.5}
                      fill={couleur}
                      style={{
                        transition: 'fill 0.2s ease',
                      }}
                    />
                  )
                })}
              </svg>

              {/* Libellé du jour */}
              <span
                className={`mt-2 text-[11px] font-medium transition-colors ${
                  actif ? 'text-[#22D3F5] font-bold' : 'text-[var(--sur-hero-doux)]'
                }`}
              >
                {JOURS[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
