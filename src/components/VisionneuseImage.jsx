import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { lireImageRecu } from '../lib/db.js'

/**
 * VisionneuseImage — Visionneuse plein écran Apple Fluid Glass pour reçus et photos.
 *
 * Affiche l'image en haute résolution au centre de l'écran avec un fond
 * sombre translucide à flou optique (`backdrop-filter: blur(16px)`),
 * un bouton de fermeture tactile et la gestion automatique du cycle de vie
 * des Object URLs IndexedDB.
 */
export default function VisionneuseImage({ src, alt = 'Reçu', recu, onFermer }) {
  const [url, setUrl] = useState(src || null)

  useEffect(() => {
    if (src) {
      setUrl(src)
      return
    }

    if (!recu) return

    let annule = false
    let objet = null

    const source = recu.prepare?.blob
      ? Promise.resolve(recu.prepare.blob)
      : lireImageRecu(recu.id, 'image')

    source.then((blob) => {
      if (annule || !blob) return
      objet = URL.createObjectURL(blob)
      setUrl(objet)
    })

    const auClavier = (e) => e.key === 'Escape' && onFermer?.()
    document.addEventListener('keydown', auClavier)

    return () => {
      annule = true
      if (objet) URL.revokeObjectURL(objet)
      document.removeEventListener('keydown', auClavier)
    }
  }, [src, recu, onFermer])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 select-none animate-[apparition_.18s_ease-out]"
      style={{
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Bouton Fermer */}
      <button
        onClick={onFermer}
        type="button"
        aria-label="Fermer la visionneuse"
        className="tactile-press absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-white/20 transition-all duration-150 active:scale-90"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        <X size={20} strokeWidth={2.2} />
      </button>

      {/* Conteneur de l'image */}
      {url && (
        <div
          className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-[20px] border border-white/10 shadow-2xl animate-[echelle-entree_.22s_cubic-bezier(.23,1,.32,1)]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={url}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  )
}
