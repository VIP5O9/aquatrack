import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Conteneur de saisie adaptatif.
 *
 * Un seul composant, deux habillages :
 *   - mobile  : feuille montant du bas, poignee, coins arrondis en haut
 *   - desktop : modale centree de 440px
 *
 * Le contenu est rigoureusement identique — seul le contenant change. C'est
 * la regle tenue partout dans l'app : la mise en page s'adapte, jamais les
 * composants.
 *
 * SUR MOBILE, on ferme aussi la feuille en la faisant GLISSER vers le bas —
 * le geste attendu d'un « bottom sheet ». Le suivi n'ecoute que le tactile,
 * donc la souris de bureau n'est jamais concernee : la modale centree garde
 * le X, le clic sur le fond et Echap.
 */

// Au-dela de cette distance (ou d'un flick rapide), le relachement ferme.
const SEUIL_FERMETURE = 110
const SEUIL_VITESSE = 0.6 // px/ms

export default function Feuille({ titre, onFermer, children, pied }) {
  const panneau = useRef(null)
  const contenu = useRef(null) // zone defilante, pour lire scrollTop
  const haut = useRef(null) // poignee + en-tete : zone toujours « tirable »
  const geste = useRef(null) // etat du geste en cours (hors rendu)

  // `tirage` : deplacement vertical courant (px) pendant le glissement.
  // `sortie` : true quand on lance l'animation de fermeture vers le bas.
  // `aInteragi` : des qu'on a tire une fois, on n'ARME plus l'animation
  // d'ouverture — sinon un retour-ressort rejouerait « montee ».
  const [tirage, setTirage] = useState(0)
  const [sortie, setSortie] = useState(false)
  const [aInteragi, setAInteragi] = useState(false)

  // Echap ferme, et le defilement de la page est gele pendant l'ouverture :
  // sans cela, sur mobile, le fond defile sous la feuille.
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

  // Glissement-fermeture. Les ecouteurs sont poses A LA MAIN : `touchmove` doit
  // etre NON passif pour que preventDefault() empeche le rebond de page — les
  // onTouchMove de React sont passifs et le refusent.
  useEffect(() => {
    const el = panneau.current
    if (!el) return

    const fermerVersLeBas = () => {
      setSortie(true)
      setTirage((el.offsetHeight || window.innerHeight) * 1.2)
      setTimeout(onFermer, 200)
    }

    const onStart = (e) => {
      if (e.touches.length !== 1) return
      const depuisHaut = !!haut.current?.contains(e.target)
      const enHaut = (contenu.current?.scrollTop ?? 0) <= 0
      geste.current = {
        y0: e.touches[0].clientY,
        t0: e.timeStamp,
        // Ne peut FERMER que si le geste part de la zone haute, ou si le
        // contenu est deja en haut. Sinon on laisse defiler.
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
        // Legere resistance sur les premiers pixels : la feuille suit le doigt.
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
      <div
        className="absolute inset-0 animate-[apparition_.18s_ease-out]"
        style={{ background: 'rgb(34 32 38 / .45)' }}
        onClick={onFermer}
        aria-hidden="true"
      />

      <div
        ref={panneau}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={[
          'relative flex max-h-[92vh] w-full touch-pan-y flex-col outline-none',
          // L'animation d'ouverture ne joue qu'une fois, a l'ouverture. Des
          // qu'on a tire, c'est le transform en ligne qui gouverne.
          !aInteragi && !sortie ? 'animate-[montee_.22s_cubic-bezier(.32,.72,0,1)]' : '',
          'rounded-t-[24px] lg:max-w-[440px] lg:rounded-[24px]',
        ].join(' ')}
        style={{
          background: 'var(--surface)',
          transform: `translateY(${tirage}px)`,
          // Pas de transition PENDANT le tir (suivi direct) ; transition au
          // relachement (retour-ressort) et a la sortie.
          transition: geste.current?.actif ? 'none' : 'transform .22s cubic-bezier(.32,.72,0,1)',
        }}
      >
        {/* Poignee + en-tete : zone toujours « tirable », meme contenu defile. */}
        <div ref={haut}>
          {/* Poignee : affordance de glissement, mobile uniquement. */}
          <div className="flex justify-center pt-2.5 lg:hidden" aria-hidden="true">
            <span className="h-1 w-9 rounded-full" style={{ background: 'var(--bordure)' }} />
          </div>

          <header className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-[17px] font-medium">{titre}</h2>
            <button
              onClick={onFermer}
              aria-label="Fermer"
              className="-m-2 rounded-full p-2 transition-colors"
              style={{ color: 'var(--texte-doux)' }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </header>
        </div>

        <div ref={contenu} className="flex-1 overflow-y-auto px-5 pb-2">
          {children}
        </div>

        {pied && (
          <footer
            className="px-5 pt-3 pb-5"
            style={{
              borderTop: '1px solid var(--bordure)',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            {pied}
          </footer>
        )}
      </div>
    </div>
  )
}

/** Bouton principal des feuilles : noir, pleine largeur — comme le brief. */
export function BoutonPrincipal({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full py-3.5 text-sm font-medium transition-transform active:scale-[0.99] disabled:opacity-35"
      style={{ background: 'var(--action)', color: 'var(--sur-action)' }}
    >
      {children}
    </button>
  )
}
