import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Truck, TriangleAlert, ShieldCheck, HelpCircle } from 'lucide-react'
import Pastille from './Pastille.jsx'
import EtatVide from './EtatVide.jsx'
import { formatHTG, formatDateAxe, formatDateCourte, formatGallons } from '../lib/format.js'

/**
 * Prévisions de fin de mois et de rupture de stock — Apple Fluid Glass visualizer :
 * Courbe historique pleine + courbe projetée en pointillés + bande d'intervalle
 * de confiance à 80% fanning out jusqu'à la fin du mois.
 */
const LIBELLES_FIABILITE = {
  bonne: { texte: 'Prévision fiable', icone: ShieldCheck, classe: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
  moyenne: { texte: 'Prévision approximative', icone: HelpCircle, classe: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
  faible: { texte: 'Prévision peu fiable', icone: TriangleAlert, classe: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
}

export default function CartePrevision({ prevision, rupture, serie }) {
  if (!prevision) {
    return (
      <section className="carte">
        <h2 className="titre-carte">Prévisions</h2>
        <EtatVide
          icone={TrendingUp}
          titre="Pas encore assez d'historique"
          texte="Clôturez quelques journées : l'app pourra alors projeter votre fin de mois et la date de votre prochaine commande."
        />
      </section>
    )
  }

  const f = prevision.fiabilite
  const fiabiliteConfig = LIBELLES_FIABILITE[f.niveau] || LIBELLES_FIABILITE.moyenne
  const IconeFiabilite = fiabiliteConfig.icone

  // Enrichissement de la série avec l'intervalle de confiance à 80% (fanning out sur la projection)
  const donneesGraphique = useMemo(() => {
    if (!serie?.length) return []

    const indexTransition = serie.findIndex((p) => p.realise != null && p.projete != null)
    const totalFutur = serie.length - 1 - (indexTransition >= 0 ? indexTransition : 0)

    return serie.map((p, idx) => {
      if (p.realise != null && p.projete == null) {
        return {
          ...p,
          intervalle: [p.realise, p.realise],
          borneBasse: p.realise,
          borneHaute: p.realise,
        }
      }
      if (p.projete != null) {
        const step = indexTransition >= 0 ? Math.max(0, idx - indexTransition) : idx
        const progress = totalFutur > 0 ? Math.sqrt(step / totalFutur) : 1
        const deltaBas = (prevision.total - prevision.bas) * progress
        const deltaHaut = (prevision.haut - prevision.total) * progress
        const bBas = Math.max(0, Math.round(p.projete - deltaBas))
        const bHaut = Math.round(p.projete + deltaHaut)
        return {
          ...p,
          intervalle: [bBas, bHaut],
          borneBasse: bBas,
          borneHaute: bHaut,
        }
      }
      return p
    })
  }, [serie, prevision])

  return (
    <section className="carte">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="titre-carte">Fin de mois estimée</h2>
          <p className="sous-ligne mt-0.5">
            {formatHTG(prevision.realise)} déjà encaissés ·{' '}
            {prevision.joursRestants.length} jour{prevision.joursRestants.length > 1 ? 's' : ''}{' '}
            restant{prevision.joursRestants.length > 1 ? 's' : ''}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${fiabiliteConfig.classe}`}
        >
          <IconeFiabilite size={12} strokeWidth={2.5} />
          {fiabiliteConfig.texte}
        </span>
      </header>

      <div className="mt-3">
        <p className="chiffre-hero text-[28px] font-bold text-[var(--texte)]">
          {formatHTG(prevision.total)}
        </p>
        <p className="sous-ligne mt-0.5 text-xs font-medium">
          Fourchette 80 % : entre{' '}
          <strong className="text-[var(--texte)] font-semibold">{formatHTG(prevision.bas)}</strong> et{' '}
          <strong className="text-[var(--texte)] font-semibold">{formatHTG(prevision.haut)}</strong>
        </p>
      </div>

      {donneesGraphique?.length > 0 && (
        <div className="mt-4 w-full select-none" style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={donneesGraphique} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
              <defs>
                <linearGradient id="degrade-prevision" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="degrade-intervalle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical
                horizontal={false}
                stroke="var(--bordure)"
                strokeDasharray="3 4"
                opacity={0.7}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateAxe}
                tick={{ fontSize: 11, fill: 'var(--texte-doux)' }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis hide domain={[0, 'dataMax']} />

              <Tooltip
                cursor={{ stroke: 'var(--accent)', strokeWidth: 1.2, strokeDasharray: '3 3', opacity: 0.7 }}
                content={({ active, payload, label }) => {
                  const p = payload?.[0]?.payload
                  if (!active || !p) return null
                  const projete = p.realise == null
                  return (
                    <div
                      className="pointer-events-none rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap shadow-lg border"
                      style={{
                        background: 'var(--glass-material-elevated)',
                        color: 'var(--texte)',
                        backdropFilter: 'blur(16px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                        borderColor: 'var(--border-subtle)',
                        boxShadow: 'var(--ombre-flottant)',
                      }}
                    >
                      <span className="text-[11px] opacity-75 block mb-0.5">{formatDateCourte(label)}</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold chiffres" style={{ color: 'var(--accent)' }}>
                          {formatHTG(projete ? p.projete : p.realise)}
                        </span>
                        <span className="text-[10px] text-[var(--texte-doux)]">
                          {projete ? '(estimé)' : '(réalisé)'}
                        </span>
                      </div>
                      {projete && p.borneBasse != null && p.borneHaute != null && (
                        <span className="text-[10px] text-[var(--texte-doux)] block mt-0.5">
                          Fourchette : {formatHTG(p.borneBasse)} – {formatHTG(p.borneHaute)}
                        </span>
                      )}
                    </div>
                  )
                }}
              />

              {/* Bande d'intervalle de confiance à 80% */}
              <Area
                type="monotone"
                dataKey="intervalle"
                stroke="none"
                fill="url(#degrade-intervalle)"
                fillOpacity={1}
                dot={false}
                connectNulls
              />

              {/* Courbe réalisée (historique solide) */}
              <Area
                type="monotone"
                dataKey="realise"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#degrade-prevision)"
                dot={false}
                connectNulls={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: 'var(--surface)',
                  fill: 'var(--accent)',
                }}
              />

              {/* Courbe projetée (projection en pointillés) */}
              <Area
                type="monotone"
                dataKey="projete"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
                connectNulls={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: 'var(--surface)',
                  fill: 'var(--accent)',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Légende optique */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--texte-doux)]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="h-0.5 w-4 rounded-full bg-[var(--accent)]" />
          Réalisé
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span
            className="h-0.5 w-4 rounded-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, var(--accent) 0 3px, transparent 3px 6px)',
            }}
          />
          Estimé
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span
            className="h-2 w-3.5 rounded-xs"
            style={{ background: 'rgba(38, 114, 221, 0.18)', outline: '1px solid rgba(38, 114, 221, 0.3)' }}
          />
          Intervalle 80%
        </span>
      </div>

      {/* Note d'observation de fiabilité */}
      <p className="mt-3 text-xs text-[var(--texte-doux)]">
        Calculé sur {f.nb} journée{f.nb > 1 ? 's' : ''} observée{f.nb > 1 ? 's' : ''}
        {f.raison ? ` (${f.raison})` : ''}.
      </p>

      {/* Section Alerte Rupture de Stock */}
      {rupture?.jours != null && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
          <Pastille bloc>
            <div className="flex items-start gap-2.5">
              {rupture.urgent ? (
                <TriangleAlert size={16} strokeWidth={2.5} className="text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Truck size={16} strokeWidth={2} className="text-[var(--accent)] shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-semibold text-[var(--texte)]">
                  {rupture.stock <= 0
                    ? 'Citerne vide — commandez un camion immédiatement'
                    : rupture.urgent
                      ? `Citerne vide dans ${rupture.jours} jour${rupture.jours > 1 ? 's' : ''} — commandez maintenant`
                      : `Commandez avant le ${formatDateCourte(rupture.dateCommande)} · citerne vide vers le ${formatDateCourte(rupture.date)}`}
                </p>
                {rupture.stock > 0 && (
                  <p className="text-[var(--texte-doux)] mt-0.5">
                    {formatGallons(rupture.stock)} en citerne, selon le rythme de consommation observé.
                  </p>
                )}
              </div>
            </div>
          </Pastille>
        </div>
      )}
    </section>
  )
}
