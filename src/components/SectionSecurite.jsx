import { useEffect, useState } from 'react'
import { Lock, Fingerprint, ShieldCheck } from 'lucide-react'
import Pastille from './Pastille.jsx'
import PaveCode from './PaveCode.jsx'
import { GroupeReglage, ChipIcone, Interrupteur } from './LigneReglage.jsx'
import SegmentPills from './SegmentPills.jsx'
import { useStore, useEtat } from '../store/useStore.js'
import { DELAIS, biometrieDisponible, enrolerBiometrie, verifierCode } from '../lib/verrou.js'

/**
 * Reglages de securite.
 *
 * Toute saisie de code passe par le meme pave numerique que l'ecran de
 * deverrouillage (PaveCode) : pas de champ texte, pas de clavier systeme qui
 * s'ouvre et se ferme, pas de focus perdu entre deux etapes. On tape, ca se
 * valide au 4e chiffre. C'est ce qui reglait le « rien ne se passe ».
 *
 * L'ordre suit la logique d'activation : d'abord un code, ensuite le delai
 * d'inactivite et la biometrie. La biometrie ne remplace jamais le code — un
 * capteur qui refuse un doigt mouille (frequent au comptoir) laisserait sinon
 * l'utilisateur dehors de ses propres donnees.
 */
export default function SectionSecurite() {
  const etat = useEtat()
  const definirCode = useStore((s) => s.definirCode)
  const retirerVerrou = useStore((s) => s.retirerVerrou)
  const verrouiller = useStore((s) => s.verrouiller)
  const majReglages = useStore((s) => s.majReglages)

  const r = etat.reglages
  const [etape, setEtape] = useState(null) // null | 'nouveau' | 'confirmer' | 'retirer'
  const [premier, setPremier] = useState('')
  const [erreur, setErreur] = useState(false)
  const [message, setMessage] = useState(null)
  const [capteur, setCapteur] = useState(false)

  useEffect(() => {
    biometrieDisponible().then(setCapteur)
  }, [])

  function reinitialiser() {
    setEtape(null)
    setPremier('')
    setErreur(false)
  }

  // Premiere saisie : on memorise, on passe a la confirmation.
  function saisirNouveau(code) {
    setPremier(code)
    setMessage(null)
    setEtape('confirmer')
  }

  // Confirmation : identique -> on pose le code ; sinon on secoue et on
  // recommence depuis la premiere saisie (on ne sait pas laquelle etait fausse).
  async function confirmer(code) {
    if (code === premier) {
      await definirCode(code)
      setMessage('Verrouillage activé.')
      reinitialiser()
    } else {
      setErreur(true)
    }
  }

  // Desactivation : on redemande le code. Sans cela, quiconque a l'app ouverte
  // le retirerait en deux gestes.
  async function retirer(code) {
    const ok = await verifierCode(code, r.verrou_sel, r.verrou_empreinte)
    if (ok) {
      await retirerVerrou()
      setMessage('Verrouillage désactivé.')
      reinitialiser()
    } else {
      setErreur(true)
    }
  }

  function finErreur() {
    setErreur(false)
    // Une confirmation ratee repart de zero ; un mauvais code de retrait se
    // retente sur place.
    if (etape === 'confirmer') {
      setEtape('nouveau')
      setPremier('')
    }
  }

  async function basculerBiometrie(actif) {
    if (!actif) return majReglages({ verrou_biometrie: null })
    try {
      const id = await enrolerBiometrie(r.nom_utilisateur)
      await majReglages({ verrou_biometrie: id })
      setMessage('Empreinte enregistrée.')
    } catch {
      setMessage("L'enrôlement a échoué ou a été annulé.")
    }
  }

  return (
    <GroupeReglage
      titre="Sécurité"
      aide="Ce verrou protège contre quelqu'un qui prend le téléphone en main. Il ne chiffre pas vos données : gardez aussi le téléphone protégé par le verrouillage du système."
    >
      <div className="px-3.5 py-4">
        <p className="sous-ligne mb-4">
          Un code à 4 chiffres protège vos chiffres quand le téléphone reste posé sur le
          comptoir.
        </p>

        {!r.verrou_actif ? (
          etape ? (
            <PanneauCode
              titre={etape === 'confirmer' ? 'Confirmez le code' : 'Choisissez un code à 4 chiffres'}
              etape={etape}
              onComplete={etape === 'confirmer' ? confirmer : saisirNouveau}
              erreur={erreur}
              onErreurFin={finErreur}
              erreurTexte="Les deux codes ne correspondent pas"
              onAnnuler={reinitialiser}
            />
          ) : (
            <button
              onClick={() => setEtape('nouveau')}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-[var(--surface-doux)] active:bg-[var(--surface-doux)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
              style={{ background: 'var(--surface-doux)' }}
            >
              <ChipIcone icone={Lock} />
              Activer le verrouillage
            </button>
          )
        ) : (
          <div className="flex flex-col gap-5">
            <div
              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm"
              style={{ background: 'var(--surface-doux)' }}
            >
              <ChipIcone icone={ShieldCheck} couleur="var(--vert)" />
              Verrouillage actif
            </div>

            <div>
              <p className="mb-2 text-[13px]" style={{ color: 'var(--texte-doux)' }}>
                Verrouiller après une inactivité de
              </p>
              <SegmentPills
                taille="compacte"
                valeur={r.verrou_delai}
                onChange={(v) => majReglages({ verrou_delai: v })}
                options={DELAIS.map((d) => ({ valeur: d.valeur, libelle: d.libelle }))}
              />
              <p className="sous-ligne mt-2">
                Le téléphone se verrouille {DELAIS.find((d) => d.valeur === r.verrou_delai)?.aide},
                ou dès qu'on quitte l'application aussi longtemps.
              </p>
            </div>

            {capteur && (
              <label className="flex cursor-pointer items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm">
                    <Fingerprint size={16} strokeWidth={1.75} />
                    Empreinte ou visage
                  </span>
                  <span className="sous-ligne mt-0.5 block">
                    Déverrouillage sans saisir le code. Le code reste toujours disponible en
                    secours.
                  </span>
                </span>
                <Interrupteur actif={!!r.verrou_biometrie} onChange={basculerBiometrie} />
              </label>
            )}

            {etape === 'retirer' ? (
              <PanneauCode
                titre="Saisissez votre code pour désactiver"
                etape="retirer"
                onComplete={retirer}
                erreur={erreur}
                onErreurFin={finErreur}
                erreurTexte="Code incorrect"
                onAnnuler={reinitialiser}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={verrouiller}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--surface)]"
                  style={{ background: 'var(--action)', color: 'var(--sur-action)' }}
                >
                  <Lock size={15} strokeWidth={2} />
                  Verrouiller maintenant
                </button>
                <button
                  onClick={() => setEtape('retirer')}
                  className="rounded text-[13px] text-[var(--texte-doux)] underline underline-offset-2 outline-none transition-colors hover:text-[var(--rouge)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Désactiver
                </button>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="mt-4">
            <Pastille bloc>{message}</Pastille>
          </div>
        )}
      </div>
    </GroupeReglage>
  )
}

/**
 * Panneau de saisie : un intitulé, le pavé, et « Annuler ». Posé sur une
 * surface douce pour que les touches claires ressortent — même figure/fond
 * que l'écran de déverrouillage. `key={etape}` remet le pavé à zéro d'une
 * étape à l'autre.
 */
function PanneauCode({ titre, etape, onComplete, erreur, onErreurFin, erreurTexte, onAnnuler }) {
  return (
    <div
      className="flex flex-col items-center rounded-[16px] px-3.5 py-5"
      style={{ background: 'var(--surface-doux)' }}
    >
      <p className="mb-3 text-[13px]" style={{ color: 'var(--texte-doux)' }}>
        {titre}
      </p>
      <PaveCode
        key={etape}
        compact
        onComplete={onComplete}
        erreur={erreur}
        onErreurFin={onErreurFin}
        erreurTexte={erreurTexte}
      />
      <button
        onClick={onAnnuler}
        className="mt-3 rounded px-2 text-[13px] text-[var(--texte-doux)] outline-none transition-colors hover:text-[var(--texte)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        Annuler
      </button>
    </div>
  )
}
