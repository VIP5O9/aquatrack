import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplet, Warehouse, TrendingUp, CalendarPlus, ChevronRight } from 'lucide-react'
import EnTete from '../components/EnTete.jsx'
import CarteHero from '../components/CarteHero.jsx'
import CarteStat from '../components/CarteStat.jsx'
import Pastille from '../components/Pastille.jsx'
import BadgeSync from '../components/BadgeSync.jsx'
import BoutonMasque from '../components/BoutonMasque.jsx'
import BanniereRappel from '../components/BanniereRappel.jsx'
import EtatVide from '../components/EtatVide.jsx'
import GrapheRevenus from '../components/GrapheRevenus.jsx'
import LigneJournal, { versLigne } from '../components/LigneJournal.jsx'
import { usePeriode } from '../components/FeuillePeriode.jsx'
import { useStore, useEtat } from '../store/useStore.js'
import * as M from '../lib/metrics.js'
import {
  formatHTG, formatGallons, formatPrix, formatDateLongue, formatDateCourte, cleJour, salutation,
  MONTANT_MASQUE,
} from '../lib/format.js'

/**
 * « Bonjour » / « Bonsoir », réévalue au fil de la journée.
 *
 * Au kiosque l'application reste ouverte du matin au soir : calculer la
 * formule une seule fois au montage laisserait « Bonjour » affiché à 20 h.
 * On repasse donc à chaque minute — et au retour au premier plan, car un
 * téléphone en veille ne fait pas tourner ses minuteries.
 */
function useSalutation() {
  const [salut, setSalut] = useState(salutation)

  useEffect(() => {
    const reevaluer = () => setSalut(salutation())
    const minuterie = setInterval(reevaluer, 60_000)
    document.addEventListener('visibilitychange', reevaluer)
    return () => {
      clearInterval(minuterie)
      document.removeEventListener('visibilitychange', reevaluer)
    }
  }, [])

  return salut
}

export default function Dashboard() {
  const etat = useEtat()
  const ouvrirFeuille = useStore((s) => s.ouvrirFeuille)
  const periode = usePeriode()

  const c = useMemo(() => calculer(etat, periode), [etat, periode])
  const vide = etat.journees.length === 0 && etat.depenses.length === 0
  const salut = useSalutation()

  // Discrétion : quand c'est actif, tout montant devient des points. Les
  // quantités (gallons) et les dates restent, elles ne trahissent pas la caisse.
  const caches = useStore((s) => s.montantsCaches)
  const m = (texte) => (caches ? MONTANT_MASQUE : texte)

  return (
    <>
      <EnTete
        titre={
          etat.reglages.nom_utilisateur
            ? `${salut}, ${etat.reglages.nom_utilisateur}`
            : salut
        }
        sousTitre={formatDateLongue(new Date())}
        periode={periode.libelle}
        onPeriode={() => ouvrirFeuille('periode')}
        apres={<BadgeSync />}
      />

      <BanniereRappel />

      {vide ? (
        <div className="carte anim-vue">
          <EtatVide
            icone={CalendarPlus}
            titre="Aucune opération enregistrée"
            texte="Clôturez votre première journée pour voir vos revenus, votre marge et votre stock."
            action={
              <button
                type="button"
                onClick={() => ouvrirFeuille('cloture')}
                className="tactile-press rounded-full px-5 py-2.5 text-sm font-medium transition-transform active:scale-95"
                style={{ background: 'var(--action)', color: 'var(--sur-action)' }}
              >
                Clôturer la journée
              </button>
            }
          />
        </div>
      ) : (
        <div className="anim-cartes grid gap-3 lg:grid-cols-[2fr_1fr] lg:items-start">
          {/* ---- Colonne principale --------------------------------------- */}
          <div className="colonne flex flex-col gap-3">
            <RappelCloture jours={c.nonClotures} onCloturer={ouvrirFeuille} />

            <CarteHero
              variante="noire"
              titre="Bénéfice Net"
              coin={<BoutonMasque />}
              chiffre={m(formatHTG(c.benefice))}
              delta={caches ? null : c.deltaBenefice}
              deltaColore
              sousLigne={
                c.beneficePrecedent != null
                  ? `${m(formatHTG(c.beneficePrecedent))} à la même date le mois dernier`
                  : periode.libelle
              }
              sousChiffres={[
                { libelle: 'Revenus', valeur: m(formatHTG(c.revenus)) },
                { libelle: 'Dépenses', valeur: m(formatHTG(c.depenses)) },
              ]}
            >
              <GrapheRevenus donnees={c.serie} cle="cumul" surSombre hauteur={140} />
            </CarteHero>

            <section className="carte">
              <header className="mb-2 flex items-center justify-between">
                <h2 className="titre-carte font-medium tracking-tight">Opérations récentes</h2>
                <Link
                  to="/journal"
                  className="tactile-press inline-flex items-center gap-0.5 text-xs font-medium transition-colors hover:text-[var(--texte)]"
                  style={{ color: 'var(--texte-doux)' }}
                >
                  <span>Tout voir</span>
                  <ChevronRight size={14} strokeWidth={2} />
                </Link>
              </header>
              <ul className="anim-liste">
                {c.recentes.map((l, i) => (
                  <li key={l.cle} style={{ '--i': i }}>
                    <LigneJournal
                      ligne={l}
                      masque={caches}
                      onClick={() =>
                        l.type === 'revenu'
                          ? ouvrirFeuille('cloture', { date: l.source.date })
                          : l.suitGallons
                            ? ouvrirFeuille('lot', { id: l.source.id })
                            : ouvrirFeuille('depense', l.source)
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ---- Colonne latérale ----------------------------------------- */}
          <div className="colonne flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <CarteStat
                titre="Gallons vendus"
                icone={Droplet}
                chiffre={Math.round(c.gallonsVendus).toLocaleString('fr-FR')}
                delta={c.deltaGallons}
                sousLigne="ce mois-ci"
              />
              <CarteStat
                titre="Gallons en stock"
                icone={Warehouse}
                chiffre={Math.round(c.stock).toLocaleString('fr-FR')}
                alerte={c.stockBas}
                sousLigne={
                  c.jours == null
                    ? 'autonomie inconnue'
                    : c.stock <= 0
                      ? 'Citerne vide — commandez un camion'
                      : `~${Math.round(c.jours)} jour${Math.round(c.jours) > 1 ? 's' : ''} restant${Math.round(c.jours) > 1 ? 's' : ''}`
                }
              />
            </div>

            {c.hausse && (
              <Link to="/analytiques" className="tactile-press">
                <Pastille bloc>
                  ⚠ Prix d'appro en hausse : {formatPrix(c.hausse.avant)} →{' '}
                  {formatPrix(c.hausse.apres)}/gallon
                </Pastille>
              </Link>
            )}

            {c.marge && (
              <CarteStat
                titre="Marge par gallon"
                icone={TrendingUp}
                chiffre={formatPrix(c.marge.marge)}
                sousLigne={`Vente ${formatPrix(c.marge.prix)} · Coût ${formatPrix(c.marge.cout)}`}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Rappel des journées non clôturées.
 *
 * C'est le moteur d'usage quotidien : sans lui, l'utilisateur oublie de
 * saisir et les données se trouent. On n'affiche jamais plus de trois jours
 * à la fois — au-delà, la liste devient décourageante plutôt qu'incitative.
 */
function RappelCloture({ jours, onCloturer }) {
  if (!jours?.length) return null
  const aTraiter = jours.slice(-3)

  return (
    <div className="flex flex-col gap-2">
      {aTraiter.map((j) => (
        <Pastille key={j} bloc onClick={() => onCloturer('cloture', { date: j })}>
          <span className="flex-1">
            Vous n'avez pas clôturé {formatDateCourte(j)}
          </span>
          <span className="font-medium" style={{ opacity: 0.85 }}>Saisir →</span>
        </Pastille>
      ))}
      {jours.length > 3 && (
        <p className="sous-ligne px-1">
          {jours.length - 3} autre{jours.length - 3 > 1 ? 's' : ''} journée
          {jours.length - 3 > 1 ? 's' : ''} en attente.
        </p>
      )}
    </div>
  )
}

function calculer(etat, periode) {
  const mois = periode.intervalle
  // À durées égales : le mois en cours n'est pas fini, le comparer à un mois
  // précédent complet afficherait une baisse tous les débuts de mois. La
  // comparaison n'a de sens que sur le mois courant.
  const precedent = periode.cle === 'mois' ? M.moisPrecedentAuMemeJour() : null

  const revenus = M.totalRevenus(etat, mois)
  const depenses = M.totalDepenses(etat, mois)
  const benefice = revenus - depenses
  const beneficePrecedent = precedent ? M.beneficeNet(etat, precedent) : null

  const gallonsVendus = M.gallonsVendus(etat, mois)
  const stock = M.gallonsEnStock(etat)
  const jours = M.joursDeStock(etat)

  const variation = M.variationDernierPrix(etat)

  // La courbe est bornée à 90 jours. Sur « Depuis le début », l'intervalle
  // ouvert engendrerait des centaines de milliers de points et figerait la
  // page — et une courbe de cette longueur ne serait de toute façon pas
  // lisible sur un téléphone.
  const debutSerie = [mois.debut, M.derniersJours(90).debut].sort().pop()

  const lignes = [
    ...etat.journees.map((j) => versLigne(j, etat)),
    ...etat.depenses.map((d) => versLigne(d, etat)),
  ].sort((a, b) => b.tri.localeCompare(a.tri))

  return {
    revenus,
    depenses,
    benefice,
    beneficePrecedent,
    deltaBenefice: precedent ? M.variationPct(benefice, beneficePrecedent) : null,
    gallonsVendus,
    deltaGallons: precedent
      ? M.variationPct(gallonsVendus, M.gallonsVendus(etat, precedent))
      : null,
    stock,
    jours,
    // Trois jours d'autonomie : un camion ne se commande pas le jour même.
    stockBas: stock <= 0 || (jours != null && jours < 3),
    hausse: variation?.sens === 'hausse' ? variation : null,
    marge: M.margeActuelle(etat),
    // Le cumul s'arrête à aujourd'hui : prolonger jusqu'à la fin du mois
    // dessinerait un long plateau sur des jours qui n'ont pas encore eu lieu.
    serie: M.serieNetteCumulee(
      etat,
      M.creerPeriode(debutSerie, [mois.fin, cleJour()].sort()[0]),
    ),
    recentes: lignes.slice(0, 8),
    nonClotures: M.joursNonClotures(etat),
  }
}

