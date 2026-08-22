import { CalendarCheck, Truck, ChevronRight } from 'lucide-react'
import Feuille from './Feuille.jsx'
import FeuilleCloture from './FeuilleCloture.jsx'
import FeuilleDepense from './FeuilleDepense.jsx'
import FeuillePeriode from './FeuillePeriode.jsx'
import FeuilleLot from './FeuilleLot.jsx'
import FeuilleExport from './FeuilleExport.jsx'
import { useStore } from '../store/useStore.js'

/**
 * Aiguillage des feuilles de saisie — Apple Fluid Glass & Emil Kowalski Standards.
 *
 * Route les différents flux de saisie et présente l'écran de sélection initiale
 * avec des tuiles d'action tactiles à relief optique.
 */
export default function GestionnaireFeuille() {
  const feuille = useStore((s) => s.feuille)
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)
  const fermerFeuille = useStore((s) => s.fermerFeuille)

  if (!feuille) return null

  if (feuille.type === 'cloture') {
    return <FeuilleCloture dateInitiale={feuille.donnees?.date} />
  }

  if (feuille.type === 'depense') {
    return <FeuilleDepense depense={feuille.donnees} />
  }

  if (feuille.type === 'periode') {
    return <FeuillePeriode />
  }

  if (feuille.type === 'lot') {
    return <FeuilleLot lotId={feuille.donnees?.id} />
  }

  if (feuille.type === 'export') {
    return <FeuilleExport />
  }

  return (
    <Feuille titre="Que voulez-vous enregistrer ?" onFermer={fermerFeuille}>
      <div className="flex flex-col gap-2.5 pt-1 pb-4">
        <Choix
          icone={CalendarCheck}
          titre="Clôturer la journée"
          texte="Saisir la recette et le volume du jour"
          accent
          onClick={() => ouvrirFeuille('cloture')}
        />
        <Choix
          icone={Truck}
          titre="Ajouter une dépense"
          texte="Réapprovisionnement d'eau, matériel, divers"
          onClick={() => ouvrirFeuille('depense')}
        />
      </div>
    </Feuille>
  )
}

function Choix({ icone: Icone, titre, texte, onClick, accent = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group flex items-center gap-3.5 rounded-[18px] p-4 text-left select-none transition-all duration-150 active:scale-[0.98]"
      style={{
        background: 'var(--surface-doux)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-subtle)',
      }}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-[14px] transition-transform duration-150 group-hover:scale-105"
        style={
          accent
            ? {
                background: 'var(--hero-gradient)',
                color: 'var(--sur-hero)',
                boxShadow: 'var(--lueur-accent)',
              }
            : {
                background: 'var(--action)',
                color: 'var(--sur-action)',
                boxShadow: 'var(--rim-light-subtle)',
              }
        }
      >
        <Icone size={20} strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium tracking-tight text-[var(--texte)]">
          {titre}
        </span>
        <span className="sous-ligne mt-0.5 block text-xs text-[var(--texte-doux)]">
          {texte}
        </span>
      </span>

      <ChevronRight
        size={18}
        strokeWidth={2}
        className="transition-transform duration-150 group-hover:translate-x-0.5"
        style={{ color: 'var(--texte-tres-doux)' }}
      />
    </button>
  )
}
