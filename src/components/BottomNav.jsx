import { NavLink } from 'react-router-dom'
import { Home, ChartNoAxesColumn, ScrollText, Settings, Plus } from 'lucide-react'
import { useStore } from '../store/useStore.js'

/**
 * Barre de navigation basse — Apple Fluid Glass & Emil Kowalski Standards.
 *
 * Translucide avec flou optique (backdrop-filter: blur(20px) saturate(180%)),
 * liseré supérieur rim-light sous-pixel et pastilles de retour tactile immédiat.
 * L'emplacement central accueille le bouton d'action flottant surélevé (FAB)
 * avec dégradé aqua et halo luminescent.
 *
 * Masquée au-delà de 1024px, où BarreLaterale prend le relais.
 */
const ONGLETS = [
  { to: '/tableau-de-bord', libelle: 'Accueil', icone: Home },
  { to: '/analytiques', libelle: 'Analytiques', icone: ChartNoAxesColumn },
  null, // emplacement du bouton central flottant
  { to: '/journal', libelle: 'Journal', icone: ScrollText },
  { to: '/reglages', libelle: 'Réglages', icone: Settings },
]

export default function BottomNav() {
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)

  return (
    <nav
      className="glass-nav fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{
        background: 'var(--glass-material)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navigation principale"
    >
      <ul className="mx-auto flex max-w-[480px] items-end justify-around px-2 pt-2 pb-1.5">
        {ONGLETS.map((o, i) =>
          o ? (
            <li key={o.to} className="flex-1">
              <NavLink
                to={o.to}
                className="group flex flex-col items-center gap-1 py-1 select-none transition-all duration-150 active:scale-[0.96]"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--texte)' : 'var(--texte-doux)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex items-center justify-center">
                      <o.icone
                        size={22}
                        strokeWidth={isActive ? 2.25 : 1.75}
                        className="transition-transform duration-200 ease-out"
                        style={{
                          transform: isActive ? 'translateY(-1.5px)' : 'none',
                          filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' : 'none',
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] tracking-tight transition-all duration-150"
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--texte)' : 'var(--texte-doux)',
                      }}
                    >
                      {o.libelle}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ) : (
            <li key="fab" className="flex flex-1 justify-center">
              <button
                onClick={() => ouvrirFeuille('choix')}
                aria-label="Ajouter une opération"
                className="tactile-press-accent group relative grid size-14 -translate-y-3.5 place-items-center rounded-full border border-white/20 select-none shadow-lg transition-transform duration-150 active:scale-90"
                style={{
                  background: 'var(--hero-gradient)',
                  color: 'var(--sur-hero)',
                  boxShadow: 'var(--lueur-accent), var(--ombre-flottant)',
                }}
              >
                <Plus
                  size={26}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:rotate-90 group-active:scale-95"
                />
              </button>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
