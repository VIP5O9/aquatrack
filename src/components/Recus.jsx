import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react'
import { preparerRecu, formatTaille, ErreurImage } from '../lib/images.js'
import { lireImageRecu } from '../lib/db.js'
import Pastille from './Pastille.jsx'
import VisionneuseImage from './VisionneuseImage.jsx'

/**
 * Pièces jointes d'une dépense — photos de reçus (Apple Fluid Glass & Emil Kowalski Standards).
 *
 * Les reçus vivent dans l'état du composant jusqu'à l'enregistrement de la
 * dépense, jamais avant. Persister à l'ajout laisserait des images orphelines
 * en base chaque fois qu'un formulaire est abandonné.
 *
 * Propose deux boutons tactiles : « Photographier » ouvre directement l'appareil
 * photo arrière (`capture="environment"`), « Choisir » ouvre la galerie.
 */

const aUnAppareilPhoto =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

export default function Recus({ recus = [], onChange }) {
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [apercu, setApercu] = useState(null)

  const appareil = useRef(null)
  const galerie = useRef(null)

  async function ajouter(evenement) {
    const fichiers = [...(evenement.target.files ?? [])]
    evenement.target.value = ''
    if (!fichiers.length) return

    setOccupe(true)
    setErreur(null)
    const nouveaux = []
    for (const f of fichiers) {
      try {
        const prepare = await preparerRecu(f)
        nouveaux.push({
          id: crypto.randomUUID(),
          nom: f.name,
          prepare,
          url: URL.createObjectURL(prepare.vignette),
          nouveau: true,
        })
      } catch (e) {
        setErreur(e instanceof ErreurImage ? e.message : "Cette image n'a pas pu être traitée.")
      }
    }
    if (nouveaux.length) onChange?.([...recus, ...nouveaux])
    setOccupe(false)
  }

  function retirer(id) {
    const r = recus.find((x) => x.id === id)
    if (r?.nouveau && r.url) URL.revokeObjectURL(r.url)
    onChange?.(recus.filter((x) => x.id !== id))
  }

  return (
    <div className="select-none">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium" style={{ color: 'var(--texte-doux)' }}>
          Reçus & Justificatifs
        </span>
        {recus.length > 0 && (
          <span className="text-[11px]" style={{ color: 'var(--texte-tres-doux)' }}>
            {recus.length} photo{recus.length > 1 ? 's' : ''} ·{' '}
            {formatTaille(recus.reduce((t, r) => t + (r.prepare?.taille ?? r.taille ?? 0), 0))}
          </span>
        )}
      </div>

      {recus.length > 0 && (
        <ul className="defile-x mb-2.5 flex gap-2.5 pb-1">
          {recus.map((r) => (
            <li key={r.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setApercu(r)}
                className="group block size-20 overflow-hidden rounded-[16px] border border-[var(--border-subtle)] shadow-sm transition-transform active:scale-95"
                style={{
                  background: 'var(--surface-doux)',
                  boxShadow: 'var(--rim-light-subtle)',
                }}
              >
                <Vignette recu={r} />
              </button>

              <button
                type="button"
                onClick={() => retirer(r.id)}
                aria-label="Retirer ce reçu"
                className="tactile-press absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full border border-white/20 shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--action)',
                  color: 'var(--sur-action)',
                  boxShadow: 'var(--ombre-flottant)',
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Boutons d'ajout */}
      <div className="flex gap-2">
        {aUnAppareilPhoto && (
          <BoutonAjout
            icone={occupe ? Loader2 : Camera}
            libelle={occupe ? 'Traitement…' : 'Photographier'}
            onClick={() => appareil.current?.click()}
            occupe={occupe}
          />
        )}
        <BoutonAjout
          icone={occupe && !aUnAppareilPhoto ? Loader2 : ImagePlus}
          libelle={
            occupe && !aUnAppareilPhoto
              ? 'Traitement…'
              : aUnAppareilPhoto
                ? 'Choisir'
                : 'Ajouter une photo'
          }
          onClick={() => galerie.current?.click()}
          occupe={occupe}
        />
      </div>

      <input
        ref={appareil}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={ajouter}
        className="hidden"
      />
      <input
        ref={galerie}
        type="file"
        accept="image/*"
        multiple
        onChange={ajouter}
        className="hidden"
      />

      {erreur && (
        <div className="mt-2.5">
          <Pastille bloc>{erreur}</Pastille>
        </div>
      )}

      {apercu && (
        <VisionneuseImage
          recu={apercu}
          alt={apercu.nom || 'Reçu de dépense'}
          onFermer={() => setApercu(null)}
        />
      )}
    </div>
  )
}

function BoutonAjout({ icone: Icone, libelle, onClick, occupe }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={occupe}
      className="tactile-press group flex flex-1 items-center justify-center gap-2 rounded-[16px] py-3 text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
      style={{
        background: 'var(--surface-doux)',
        color: 'var(--texte-doux)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-subtle)',
      }}
    >
      <Icone size={16} strokeWidth={1.8} className={occupe ? 'animate-spin' : ''} />
      <span>{libelle}</span>
    </button>
  )
}

function Vignette({ recu }) {
  const [url, setUrl] = useState(recu.url ?? null)

  useEffect(() => {
    if (recu.url) return
    let annule = false
    let objet = null
    lireImageRecu(recu.id, 'vignette').then((blob) => {
      if (annule || !blob) return
      objet = URL.createObjectURL(blob)
      setUrl(objet)
    })
    return () => {
      annule = true
      if (objet) URL.revokeObjectURL(objet)
    }
  }, [recu.id, recu.url])

  if (!url) return <span className="block size-full" />
  return <img src={url} alt="" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" />
}
