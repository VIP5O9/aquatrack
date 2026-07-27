import { useCallback, useEffect, useState } from 'react'
import { Delete, Fingerprint } from 'lucide-react'

/**
 * Pavé numérique de saisie du code — partagé par l'écran de déverrouillage et
 * par le réglage du verrou.
 *
 * Pourquoi un pavé plutôt qu'un champ texte : un champ ouvre le clavier
 * système (délai, moitié d'écran masquée) et surtout PERD le focus entre deux
 * étapes — on tapait alors dans le vide, d'où le « rien ne se passe ». Ici la
 * saisie est toujours prête, gérée en interne, et se valide d'elle-même au 4e
 * chiffre. Le clavier physique marche aussi, pour l'ordinateur.
 *
 * L'erreur est pilotée par le parent (`erreur`) : le parent vérifie le code,
 * et s'il est faux lève `erreur` — on secoue les points, puis on efface et on
 * previent via `onErreurFin`.
 */
const LONGUEUR = 4

export default function PaveCode({
  onComplete,
  erreur = false,
  onErreurFin,
  erreurTexte = 'Code incorrect',
  biometrie = false,
  onBiometrie,
  biometrieEnCours = false,
  compact = false,
}) {
  const [saisie, setSaisie] = useState('')

  useEffect(() => {
    if (!erreur) return
    // Laisse voir les points remplis (rouges) avant d'effacer : vider aussitôt
    // donnerait l'impression d'une frappe non prise en compte, pas d'un refus.
    const t = setTimeout(() => {
      setSaisie('')
      onErreurFin?.()
    }, 550)
    return () => clearTimeout(t)
  }, [erreur, onErreurFin])

  const taper = useCallback(
    (chiffre) => {
      setSaisie((s) => {
        if (s.length >= LONGUEUR) return s
        const suite = s + chiffre
        if (suite.length === LONGUEUR) onComplete?.(suite)
        return suite
      })
    },
    [onComplete],
  )

  const effacer = useCallback(() => setSaisie((s) => s.slice(0, -1)), [])

  // Clavier physique : sur ordinateur, taper quatre chiffres bat le pointage
  // à la souris.
  useEffect(() => {
    const auClavier = (e) => {
      if (erreur) return
      if (/^\d$/.test(e.key)) taper(e.key)
      else if (e.key === 'Backspace') effacer()
    }
    window.addEventListener('keydown', auClavier)
    return () => window.removeEventListener('keydown', auClavier)
  }, [taper, effacer, erreur])

  const hauteur = compact ? 'h-14' : 'h-16'

  return (
    <div className="flex w-full flex-col items-center">
      <div className={`flex gap-3.5 ${erreur ? 'animate-[secousse_.4s]' : ''}`}>
        {Array.from({ length: LONGUEUR }, (_, i) => (
          <span
            key={i}
            className="size-3.5 rounded-full transition-colors"
            style={{
              background:
                i < saisie.length ? (erreur ? 'var(--rouge)' : 'var(--action)') : 'var(--gris-data)',
            }}
          />
        ))}
      </div>

      <p
        className="mt-3 h-4 text-xs"
        style={{ color: 'var(--rouge)', visibility: erreur ? 'visible' : 'hidden' }}
      >
        {erreurTexte}
      </p>

      <div className="mt-4 w-full max-w-[300px]">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Touche key={n} hauteur={hauteur} onClick={() => taper(String(n))}>
              {n}
            </Touche>
          ))}

          {biometrie ? (
            <Touche
              hauteur={hauteur}
              onClick={onBiometrie}
              discret
              aria-label="Déverrouiller par empreinte"
            >
              <Fingerprint
                size={24}
                strokeWidth={1.75}
                className={biometrieEnCours ? 'animate-pulse' : ''}
              />
            </Touche>
          ) : (
            <span />
          )}

          <Touche hauteur={hauteur} onClick={() => taper('0')}>
            0
          </Touche>

          <Touche hauteur={hauteur} onClick={effacer} discret aria-label="Effacer un chiffre">
            <Delete size={22} strokeWidth={1.75} />
          </Touche>
        </div>
      </div>
    </div>
  )
}

function Touche({ children, onClick, discret = false, hauteur = 'h-16', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`grid ${hauteur} place-items-center rounded-[18px] text-xl outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent)]`}
      style={{
        background: discret ? 'transparent' : 'var(--surface)',
        color: discret ? 'var(--texte-doux)' : 'var(--texte)',
        fontVariantNumeric: 'tabular-nums',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
