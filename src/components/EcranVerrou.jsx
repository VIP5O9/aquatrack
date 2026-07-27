import { useCallback, useEffect, useState } from 'react'
import { Droplet } from 'lucide-react'
import PaveCode from './PaveCode.jsx'
import { verifierCode, demanderBiometrie } from '../lib/verrou.js'
import { useStore } from '../store/useStore.js'

/**
 * Ecran de deverrouillage.
 *
 * Pave numerique a grosses cibles (PaveCode) : on le compose debout, souvent
 * d'une seule main, parfois en plein soleil. Aucun champ de texte.
 *
 * La biometrie est proposee en premier quand elle est disponible, et se
 * declenche d'elle-meme a l'ouverture : dans le cas courant, l'utilisateur
 * pose son doigt sans rien avoir a toucher.
 */
export default function EcranVerrou() {
  const reglages = useStore((s) => s.reglages)
  const deverrouiller = useStore((s) => s.deverrouiller)

  const [erreur, setErreur] = useState(false)
  const [biometrieEnCours, setBiometrieEnCours] = useState(false)

  const avecBiometrie = !!reglages.verrou_biometrie

  const lancerBiometrie = useCallback(async () => {
    if (!avecBiometrie || biometrieEnCours) return
    setBiometrieEnCours(true)
    const ok = await demanderBiometrie(reglages.verrou_biometrie)
    setBiometrieEnCours(false)
    if (ok) deverrouiller()
  }, [avecBiometrie, biometrieEnCours, reglages.verrou_biometrie, deverrouiller])

  // Proposee d'emblee : le geste attendu est de poser le doigt, pas de
  // chercher un bouton.
  useEffect(() => {
    lancerBiometrie()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifier = useCallback(
    async (code) => {
      const ok = await verifierCode(code, reglages.verrou_sel, reglages.verrou_empreinte)
      if (ok) deverrouiller()
      else setErreur(true)
    },
    [reglages.verrou_sel, reglages.verrou_empreinte, deverrouiller],
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between px-6 py-10"
      style={{ background: 'var(--fond)' }}
    >
      <div className="flex flex-col items-center pt-6">
        <span
          className="grid size-14 place-items-center rounded-[16px]"
          style={{ background: 'var(--accent)', color: 'var(--sur-accent)' }}
        >
          <Droplet size={26} strokeWidth={2} fill="currentColor" />
        </span>

        <h1 className="mt-5 text-lg font-medium">Application verrouillée</h1>
        <p className="sous-ligne mt-1">
          {avecBiometrie ? 'Empreinte ou code à 4 chiffres' : 'Saisissez votre code à 4 chiffres'}
        </p>
      </div>

      <PaveCode
        onComplete={verifier}
        erreur={erreur}
        onErreurFin={() => setErreur(false)}
        biometrie={avecBiometrie}
        onBiometrie={lancerBiometrie}
        biometrieEnCours={biometrieEnCours}
      />
    </div>
  )
}
