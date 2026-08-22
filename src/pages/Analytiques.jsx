import { useMemo, useState } from 'react'
import { Warehouse, TrendingUp, Truck, PieChart, Sparkles } from 'lucide-react'
import EnTete from '../components/EnTete.jsx'
import CarteHero from '../components/CarteHero.jsx'
import CarteStat from '../components/CarteStat.jsx'
import BarreSplit from '../components/BarreSplit.jsx'
import SegmentPills from '../components/SegmentPills.jsx'
import EtatVide from '../components/EtatVide.jsx'
import GrapheRevenus from '../components/GrapheRevenus.jsx'
import GrapheSemaine from '../components/GrapheSemaine.jsx'
import GraphePrixAppro from '../components/GraphePrixAppro.jsx'
import DonutCategories from '../components/DonutCategories.jsx'
import SuiviLots from '../components/SuiviLots.jsx'
import CartePrevision from '../components/CartePrevision.jsx'
import ComparaisonRevenus from '../components/ComparaisonRevenus.jsx'
import { usePeriode } from '../components/FeuillePeriode.jsx'
import { useStore, useEtat } from '../store/useStore.js'
import * as M from '../lib/metrics.js'
import { formatHTG, formatPrix, formatGallons } from '../lib/format.js'

const PERIODES = [
  { valeur: '7j', libelle: '7j' },
  { valeur: '30j', libelle: '30j' },
  { valeur: '12m', libelle: 'Tout' },
]

export default function Analytiques() {
  const etat = useEtat()
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)
  const periodeGlobale = usePeriode()
  const [fenetre, setFenetre] = useState('30j')

  const c = useMemo(
    () => calculer(etat, fenetre, periodeGlobale),
    [etat, fenetre, periodeGlobale],
  )

  return (
    <div className="anim-vue">
      <EnTete
        titre="Analytiques"
        periode={periodeGlobale.libelle}
        onPeriode={() => ouvrirFeuille('periode')}
      />

      <div className="anim-cartes grid gap-3.5 lg:grid-cols-2 lg:items-start pb-6">
        {/* Bénéfice Net Hero Card + Activité par jour de la semaine */}
        <CarteHero
          titre="Bénéfice Net"
          chiffre={formatHTG(c.benefice)}
          delta={c.deltaBenefice}
          deltaColore
          sousLigne={
            c.beneficePrecedent != null
              ? `${formatHTG(c.beneficePrecedent)} à la même date le mois dernier`
              : c.libellePeriode
          }
          className="lg:col-span-2"
        >
          <GrapheSemaine donnees={c.semaine} jourActif={c.jourActuel} />
        </CarteHero>

        {/* Prévisions de fin de mois & Rupture */}
        <CartePrevision prevision={c.prevision} rupture={c.rupture} serie={c.seriePrevision} />

        {/* Revenus dans le temps avec sélecteur de période */}
        <section className="carte lg:col-span-2">
          <header className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="titre-carte">Revenus</h2>
              <p className="sous-ligne mt-0.5">Évolution chronologique des encaissements</p>
            </div>
            <SegmentPills
              taille="compacte"
              options={PERIODES}
              valeur={fenetre}
              onChange={setFenetre}
              className="w-auto"
            />
          </header>
          <GrapheRevenus
            donnees={c.serie}
            cle="revenus"
            hauteur={175}
            parMois={fenetre === '12m'}
          />
        </section>

        {/* Comparaison période sur période */}
        <ComparaisonRevenus etat={etat} />

        {/* Où part votre argent (Donut des catégories) */}
        <section className="carte">
          <header className="mb-1">
            <h2 className="titre-carte">Où part votre argent</h2>
            <p className="sous-ligne mt-0.5">
              {c.repartition?.deficitaire
                ? `${formatHTG(c.repartition.depense)} dépensés`
                : `Sur ${formatHTG(c.repartition?.total ?? 0)} encaissés`}{' '}
              · {c.libellePeriode.toLowerCase()}
            </p>
          </header>

          {!c.repartition || c.repartition.depense <= 0 ? (
            <EtatVide
              icone={PieChart}
              titre="Pas encore de dépenses"
              texte="Saisissez une dépense pour voir la répartition de vos charges."
            />
          ) : c.repartition.deficitaire ? (
            <div className="mt-3">
              <DonutCategories
                parts={c.donutDepenses}
                total={c.repartition.depense}
                libelleCentre="dépensé"
              />
              <p className="sous-ligne mt-3.5 text-xs text-[var(--texte-doux)] leading-relaxed">
                {formatHTG(c.repartition.depense)} de dépenses pour{' '}
                {formatHTG(c.repartition.total)} encaissés. Fréquent lors d'un gros
                réapprovisionnement : le stock acheté se vendra sur les semaines suivantes.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <DonutCategories parts={c.donut} total={c.repartition.total} />
            </div>
          )}
        </section>

        {/* Revenus vs Dépenses (Hero Card Bleue) */}
        <CarteHero
          variante="bleue"
          titre="Revenus et dépenses"
          chiffre={formatHTG(c.revenus)}
          sousLigne={`dont ${formatHTG(c.depenses)} de dépenses engagées`}
        >
          <BarreSplit
            surSombre
            gauche={{ libelle: 'Bénéfice', valeur: Math.max(0, c.benefice) }}
            droite={{ libelle: 'Dépenses', valeur: c.depenses }}
          />
        </CarteHero>

        {/* Prix d'approvisionnement */}
        <section className="carte">
          <header className="mb-3">
            <h2 className="titre-carte">Prix d'approvisionnement</h2>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <span className="chiffre-hero text-[28px] font-bold text-[var(--texte)]">
                {c.dernierCout != null ? formatPrix(c.dernierCout) : '—'}
              </span>
              {c.variation && (
                <span className="text-xs font-medium text-[var(--texte-doux)]">
                  {c.variation.sens === 'hausse' ? '↗' : c.variation.sens === 'baisse' ? '↘' : '→'}{' '}
                  depuis {formatPrix(c.variation.avant)}
                </span>
              )}
            </div>
            <p className="sous-ligne mt-0.5">par gallon livré par la compagnie</p>
          </header>

          {c.historique.length ? (
            <GraphePrixAppro historique={c.historique} />
          ) : (
            <EtatVide
              icone={Truck}
              titre="Aucun réapprovisionnement"
              texte="Saisissez un achat de camion pour suivre l'évolution du prix d'achat."
            />
          )}
        </section>

        {/* Marge par gallon */}
        <section className="carte">
          <h2 className="titre-carte">Marge par gallon</h2>

          {!c.margeActuelle ? (
            <EtatVide
              icone={TrendingUp}
              titre="Marge inconnue"
              texte="Saisissez un réapprovisionnement pour connaître votre coût de revient et votre marge réelle."
            />
          ) : (
            <div className="mt-2">
              <p className="chiffre-hero text-[28px] font-bold text-[var(--texte)]">
                {formatPrix(c.margeActuelle.marge)}
              </p>
              <p className="sous-ligne mt-0.5">
                Vente à {formatPrix(c.margeActuelle.prix)} · Dernier coût{' '}
                {formatPrix(c.margeActuelle.cout)}
              </p>

              <BarreSplit
                className="mt-4"
                gauche={{
                  libelle: 'Coût',
                  valeur: c.margeActuelle.cout,
                  couleur: 'var(--surface-doux)',
                }}
                droite={{
                  libelle: 'Marge',
                  valeur: c.margeActuelle.marge,
                  couleur: 'var(--action)',
                }}
              />

              {c.margeMois && (
                <p className="sous-ligne mt-4 text-xs">
                  Marge réalisée sur la période :{' '}
                  <strong className="text-[var(--texte)] font-semibold">
                    {formatPrix(c.margeMois.marge)}
                  </strong>{' '}
                  par gallon, au coût moyen pondéré de {formatPrix(c.margeMois.cout)}.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Rendement de chaque camion (FIFO) */}
        <section className="carte lg:col-span-2">
          <header className="mb-3.5">
            <h2 className="titre-carte">Rendement par approvisionnement</h2>
            <p className="sous-ligne mt-0.5">
              Écoulement et rentabilité de chaque livraison, du plus récent au plus ancien.
            </p>
          </header>
          <SuiviLots suivi={c.suivi} />
        </section>

        {/* Stock et paiements */}
        <div className="colonne grid gap-3.5">
          <CarteStat
            titre="Gallons en stock"
            icone={Warehouse}
            chiffre={Math.round(c.stock).toLocaleString('fr-FR')}
            sousLigne={
              c.jours != null
                ? `~${Math.round(c.jours)} jours d'autonomie au rythme actuel`
                : 'Autonomie inconnue'
            }
          />

          <section className="carte">
            <header className="mb-3">
              <h2 className="titre-carte">Modes de paiement</h2>
              <p className="sous-ligne mt-0.5">Répartition des encaissements</p>
            </header>
            {c.paiement ? (
              <BarreSplit
                gauche={{
                  libelle: `Cash · ${formatHTG(c.paiement.cash)}`,
                  valeur: c.paiement.cash,
                  couleur: 'var(--surface-doux)',
                }}
                droite={{
                  libelle: `MonCash · ${formatHTG(c.paiement.moncash)}`,
                  valeur: c.paiement.moncash,
                  couleur: 'var(--accent)',
                }}
              />
            ) : (
              <EtatVide titre="Aucun encaissement sur cette période" />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function calculer(etat, fenetre, periodeGlobale) {
  const mois = periodeGlobale.intervalle
  const precedent = periodeGlobale.cle === 'mois' ? M.moisPrecedentAuMemeJour() : null

  const serie =
    fenetre === '12m'
      ? M.serieMensuelle(etat, 12)
      : M.serieQuotidienne(etat, M.derniersJours(fenetre === '7j' ? 7 : 30), {
          rognerFin: true,
        })

  const repartition = M.ouPartArgent(etat, mois)

  const donut = repartition
    ? [
        ...repartition.parts.map((p) => ({ nom: p.nom, montant: p.montant, couleur: p.couleur })),
        { nom: 'Bénéfice', montant: Math.max(0, repartition.benefice), couleur: '#22D3F5' },
      ].filter((p) => p.montant > 0)
    : []

  const donutDepenses = repartition
    ? repartition.parts.map((p) => ({ nom: p.nom, montant: p.montant, couleur: p.couleur }))
    : []

  return {
    revenus: M.totalRevenus(etat, mois),
    depenses: M.totalDepenses(etat, mois),
    benefice: M.beneficeNet(etat, mois),
    beneficePrecedent: precedent ? M.beneficeNet(etat, precedent) : null,
    deltaBenefice: precedent
      ? M.variationPct(M.beneficeNet(etat, mois), M.beneficeNet(etat, precedent))
      : null,
    libellePeriode: periodeGlobale.libelle,
    serie,
    semaine: M.serieSemaine(etat, M.derniersJours(28)),
    jourActuel: (new Date().getDay() + 6) % 7,
    repartition,
    donut,
    donutDepenses,
    historique: M.historiquePrixAppro(etat, M.TOUT),
    suivi: M.suiviApprovisionnements(etat),
    prevision: M.previsionMois(etat),
    rupture: M.previsionRupture(etat),
    seriePrevision: M.seriePrevision(etat),
    dernierCout: M.dernierCoutGallon(etat),
    variation: M.variationDernierPrix(etat),
    margeActuelle: M.margeActuelle(etat),
    margeMois: M.margePeriode(etat, mois),
    stock: M.gallonsEnStock(etat),
    jours: M.joursDeStock(etat),
    paiement: M.splitPaiement(etat, mois),
  }
}
