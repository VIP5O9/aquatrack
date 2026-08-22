import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Conteneur de saisie adaptatif — Apple Fluid Glass & Emil Kowalski Spring Physics.
 *
 * Deux habillages selon le viewport :
 *   - Mobile (< 1024px) : Tiroir montant du bas (bottom sheet), poignée de tirage,
 *     suivi direct du doigt et seuils de vitesse/distance pour fermeture par glissement.
 *   - Desktop (>= 1024px) : Modale en verre surélevée (440px), centrée avec flou d'arrière-plan.
 *
 * Animation basée sur la courbe ressort `--transition-tiroir` : `cubic-bezier(0.32, 0.72, 0, 1)`.
 */

// Au-delà de cette distance (ou d'un flick rapide), le relâchement ferme.
const SEUIL_FERMETURE = 110
const SEUIL_VITESSE = 0.6 // px/ms

export default function Feuille({ titre, onFermer, children, pied }) {
  const panneau = useRef(null)
  const contenu = useRef(null) // zone défilante, pour lire scrollTop
  const haut = useRef(null) // poignée + en-tête : zone toujours « tirable »
  const geste = useRef(null) // état du geste en cours (hors rendu)

  // `tirage` : déplacement vertical courant (px) pendant le glissement.
  // `sortie` : true quand on lance l'animation de fermeture vers le bas.
  // `aInteragi` : dès qu'on a tiré une fois, on n'ARME plus l'animation
  // d'ouverture — sinon un retour-ressort rejouerait « montee ».
  const [tirage, setTirage] = useState(0)
  const [sortie, setSortie] = useState(false)
  const [aInteragi, setAInteragi] = useState(false)

  // Échap ferme, et le défilement de la page est gelé pendant l'ouverture
  useEffect(() => {
    const auClavier = (e) => e.key === 'Escape' && onFermer()
    document.addEventListener('keydown', auClavier)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panneau.current?.focus()
    return () => {
      document.removeEventListener('keydown', auClavier)
      document.body.style.overflow = overflow
    }
  }, [onFermer])

  // Glissement-fermeture. Écouteurs natifs posés à la main pour touchmove non-passif
  useEffect(() => {
    const el = panneau.current
    if (!el) return

    const fermerVersLeBas = () => {
      setSortie(true)
      setTirage((el.offsetHeight || window.innerHeight) * 1.2)
      setTimeout(onFermer, 220)
    }

    const onStart = (e) => {
      if (e.touches.length !== 1) return
      const depuisHaut = !!haut.current?.contains(e.target)
      const enHaut = (contenu.current?.scrollTop ?? 0) <= 0
      geste.current = {
        y0: e.touches[0].clientY,
        t0: e.timeStamp,
        autorise: depuisHaut || enHaut,
        depuisHaut,
        actif: false,
        dernierY: e.touches[0].clientY,
        dernierT: e.timeStamp,
      }
    }

    const onMove = (e) => {
      const g = geste.current
      if (!g || !g.autorise) return
      const dy = e.touches[0].clientY - g.y0
      if (!g.actif) {
        if (dy <= 0) return // seulement vers le bas
        if ((contenu.current?.scrollTop ?? 0) > 0 && !g.depuisHaut) return
        g.actif = true
        setAInteragi(true)
      }
      if (dy <= 0) {
        setTirage(0)
      } else {
        if (e.cancelable) e.preventDefault() // stoppe le rebond de page
        // Légère résistance sur les premiers pixels : la feuille suit le doigt avec fluidité.
        setTirage(dy < 24 ? dy * 0.6 : dy - 10)
      }
      g.dernierY = e.touches[0].clientY
      g.dernierT = e.timeStamp
    }

    const onEnd = () => {
      const g = geste.current
      geste.current = null
      if (!g || !g.actif) return
      const dy = g.dernierY - g.y0
      const dt = Math.max(1, g.dernierT - g.t0)
      const vitesse = dy / dt
      const hauteur = el.offsetHeight || window.innerHeight
      if (dy > SEUIL_FERMETURE || dy > hauteur * 0.25 || vitesse > SEUIL_VITESSE) {
        fermerVersLeBas()
      } else {
        setTirage(0) // retour-ressort (transition CSS)
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [onFermer])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      {/* Voile d'arrière-plan avec flou optique */}
      <div
        className="absolute inset-0 animate-[apparition_.2s_ease-out]"
        style={{
          background: 'var(--voile)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onFermer}
        aria-hidden="true"
      />

      {/* Conteneur principal de la feuille / modale */}
      <div
        ref={panneau}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={[
          'relative flex max-h-[92vh] w-full touch-pan-y flex-col outline-none select-none',
          !aInteragi && !sortie ? 'animate-[montee_.24s_cubic-bezier(.32,.72,0,1)]' : '',
          'rounded-t-[28px] border-t border-[var(--border-subtle)] lg:max-w-[440px] lg:rounded-[28px] lg:border',
        ].join(' ')}
        style={{
          background: 'var(--surface-elevated)',
          boxShadow: 'var(--rim-light-elevated), var(--ombre-elevated)',
          transform: `translateY(${tirage}px)`,
          transition: geste.current?.actif ? 'none' : 'transform .24s cubic-bezier(.32,.72,0,1)',
        }}
      >
        {/* Poignée + en-tête */}
        <div ref={haut}>
          {/* Poignée de glissement tactile (mobile uniquement) */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden="true">
            <span
              className="h-1.5 w-10 rounded-full transition-colors"
              style={{ background: 'var(--border-subtle)', opacity: 0.8 }}
            />
          </div>

          <header className="flex items-center justify-between px-6 pt-3 pb-2">
            <h2 className="text-[18px] font-semibold tracking-tight">{titre}</h2>
            <button
              onClick={onFermer}
              aria-label="Fermer"
              type="button"
              className="-m-2 rounded-full p-2 transition-all duration-150 hover:bg-[var(--surface-doux)] active:scale-90"
              style={{ color: 'var(--texte-doux)' }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </header>
        </div>

        {/* Zone de contenu défilante */}
        <div ref={contenu} className="flex-1 overflow-y-auto px-6 pb-3">
          {children}
        </div>

        {/* Pied de feuille optionnel */}
        {pied && (
          <footer
            className="px-6 pt-3 pb-6"
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {pied}
          </footer>
        )}
      </div>
    </div>
  )
}

/** Bouton principal des feuilles : action pleine largeur avec retour tactile */
export function BoutonPrincipal({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="tactile-press group flex w-full items-center justify-center rounded-full py-3.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35"
      style={{
        background: 'var(--action)',
        color: 'var(--sur-action)',
        boxShadow: 'var(--rim-light-subtle)',
      }}
    >
      {children}
    </button>
  )
}
