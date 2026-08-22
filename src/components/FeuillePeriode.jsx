import { Check } from 'lucide-react'
import Feuille from './Feuille.jsx'
import { useStore } from '../store/useStore.js'
import * as M from '../lib/metrics.js'

/**
 * Choix de la periode consultee.
 *
 * Le bouton « Ce mois » de la maquette n'etait qu'un decor : il ouvre
 * desormais ce selecteur. L'ordre suit une echelle de temps croissante — la
 * semaine, le mois, l'annee, tout — pour qu'on le parcoure sans reflechir.
 */
export const PERIODES = {
  semaine: { libelle: 'Cette semaine', calc: () => M.semaineCourante() },
  mois: { libelle: 'Ce mois', calc: () => M.moisCourant() },
  precedent: { libelle: 'Mois dernier', calc: () => M.moisPrecedent() },
  '30j': { libelle: '30 derniers jours', calc: () => M.derniersJours(30) },
  annee: { libelle: 'Cette année', calc: () => M.anneeCourante() },
  tout: { libelle: 'Depuis le début', calc: () => M.TOUT },
}

/** Resout la cle de periode en intervalle, plus son libelle d'affichage. */
export function usePeriode() {
  const cle = useStore((s) => s.periode)
  const def = PERIODES[cle] ?? PERIODES.mois
  return { cle, libelle: def.libelle, intervalle: def.calc() }
}

export default function FeuillePeriode() {
  const periode = useStore((s) => s.periode)
  const choisirPeriode = useStore((s) => s.choisirPeriode)
  const fermerFeuille = useStore((s) => s.fermerFeuille)

  return (
    <Feuille titre="Période" onFermer={fermerFeuille}>
      <ul className="flex flex-col gap-1 pb-4">
        {Object.entries(PERIODES).map(([cle, { libelle }]) => {
          const actif = cle === periode
          return (
            <li key={cle}>
              <button
                type="button"
                onClick={() => {
                  choisirPeriode(cle)
                  fermerFeuille()
                }}
                className="tactile-press flex w-full items-center justify-between rounded-[16px] border border-[var(--border-subtle)] px-4 py-3.5 text-left text-sm font-medium transition-all"
                style={{
                  background: actif ? 'var(--action)' : 'var(--surface-doux)',
                  color: actif ? 'var(--sur-action)' : 'var(--texte)',
                  boxShadow: actif ? 'var(--ombre-carte)' : 'var(--rim-light-subtle)',
                }}
              >
                <span>{libelle}</span>
                {actif && <Check size={18} strokeWidth={2.5} />}
              </button>
            </li>
          )
        })}
      </ul>
    </Feuille>
  )
}
