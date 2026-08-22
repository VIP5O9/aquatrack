import { useState } from 'react'
import { Database, FileSpreadsheet, ChevronRight, Loader2 } from 'lucide-react'
import Feuille from './Feuille.jsx'
import Pastille from './Pastille.jsx'
import { useStore } from '../store/useStore.js'
import { exporterSauvegarde, exporterExcel } from '../lib/echange.js'

/**
 * Choix du format d'export.
 *
 * L'ordre et la formulation portent une intention : la sauvegarde JSON vient
 * en premier et est la seule presentee comme telle. Les CSV sont utiles mais
 * ne protegent pas les donnees — ils ne transportent pas les photos de recus.
 * Quelqu'un qui exporte « pour ne rien perdre » doit repartir avec le JSON.
 */
export default function FeuilleExport() {
  const fermerFeuille = useStore((s) => s.fermerFeuille)
  const [occupe, setOccupe] = useState(null)
  const [fait, setFait] = useState(null)

  async function lancer(cle, action, message) {
    setOccupe(cle)
    try {
      const r = await action()
      setFait(message(r))
    } finally {
      setOccupe(null)
    }
  }

  return (
    <Feuille titre="Exporter" onFermer={fermerFeuille}>
      <div className="flex flex-col gap-2 pb-4">
        <Choix
          icone={Database}
          titre="Sauvegarde complète"
          texte="Fichier JSON — tout est dedans, photos de reçus comprises. C'est le format à garder pour ne rien perdre."
          occupe={occupe === 'json'}
          onClick={() =>
            lancer('json', exporterSauvegarde, (r) =>
              r.recus > 0
                ? `Sauvegarde téléchargée, ${r.recus} reçu${r.recus > 1 ? 's' : ''} inclus.`
                : 'Sauvegarde téléchargée.',
            )
          }
        />

        <Choix
          icone={FileSpreadsheet}
          titre="Feuille de calcul Excel"
          texte="Un classeur .xlsx avec deux feuilles — Recettes et Dépenses. Dates et montants correctement formatés, prêts à imprimer ou à donner au comptable."
          occupe={occupe === 'excel'}
          onClick={() =>
            lancer(
              'excel',
              exporterExcel,
              (r) => `Classeur téléchargé : ${r.recettes} journées, ${r.depenses} dépenses.`,
            )
          }
        />

        {fait && <Pastille bloc>{fait}</Pastille>}

        <p className="sous-ligne mt-2">
          Le fichier Excel ne contient pas les photos de reçus — un tableur ne sait pas
          transporter d'images. Pour une sauvegarde qui restaure tout, choisissez le format
          JSON.
        </p>
      </div>
    </Feuille>
  )
}

function Choix({ icone: Icone, titre, texte, onClick, occupe }) {
  return (
    <button
      onClick={onClick}
      disabled={occupe}
      className="group tactile-press flex items-center gap-3.5 rounded-[18px] border border-[var(--border-subtle)] p-4 text-left shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
      style={{ background: 'var(--surface-doux)', boxShadow: 'var(--rim-light-subtle)' }}
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-[14px] shadow-sm transition-transform duration-200 group-hover:scale-105"
        style={{ background: 'var(--action)', color: 'var(--sur-action)', boxShadow: 'var(--rim-light-subtle)' }}
      >
        {occupe ? (
          <Loader2 size={20} strokeWidth={1.8} className="animate-spin" />
        ) : (
          <Icone size={20} strokeWidth={1.8} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{titre}</span>
        <span className="sous-ligne mt-0.5 block leading-relaxed">{texte}</span>
      </span>
      <ChevronRight
        size={18}
        strokeWidth={2}
        className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
        style={{ color: 'var(--texte-tres-doux)' }}
      />
    </button>
  )
}
