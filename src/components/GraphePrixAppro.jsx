import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatPrix, formatDateAxe, formatDateCourte, formatGallons } from '../lib/format.js'

/**
 * Évolution du prix d'approvisionnement — tracé en escalier (stepAfter).
 * Rendu haute fidélité avec infobulle frosted glass (flou 16px),
 * points de livraison lumineux et échelle optimisée.
 */
export default function GraphePrixAppro({ historique, hauteur = 160 }) {
  if (!historique?.length) return null

  // Un seul achat ne fait pas une courbe : on double le point pour tracer un palier lisible.
  const donnees =
    historique.length === 1
      ? [historique[0], { ...historique[0], date: historique[0].date + ' ' }]
      : historique

  const trait = 'var(--accent)'
  const encre = 'var(--texte-doux)'

  const pas = Math.max(1, Math.floor(donnees.length / 4))
  const reperes = donnees.filter((_, i) => i % pas === 0).map((d) => d.date)

  return (
    <div style={{ height: hauteur }} className="w-full relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={donnees} margin={{ top: 12, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid
            vertical
            horizontal={false}
            stroke="var(--bordure)"
            strokeDasharray="3 4"
            opacity={0.7}
          />

          <XAxis
            dataKey="date"
            ticks={reperes}
            tickFormatter={(d) => formatDateAxe(d.trim())}
            tick={{ fontSize: 11, fill: encre }}
            axisLine={false}
            tickLine={false}
            minTickGap={14}
          />

          {/* Échelle resserrée pour faire ressortir les variations de prix par gallon */}
          <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />

          <Tooltip
            cursor={{ stroke: trait, strokeWidth: 1.2, strokeDasharray: '3 3', opacity: 0.7 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload
              if (!active || !p) return null
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
                  <span className="text-[11px] opacity-75 block mb-0.5">
                    {formatDateCourte(p.date.trim())}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold chiffres" style={{ color: 'var(--accent)' }}>
                      {formatPrix(p.coutGallon)}
                    </span>
                    <span className="text-[11px] text-[var(--texte-doux)]">/gallon</span>
                  </div>
                  {p.gallons && (
                    <span className="text-[11px] opacity-75 block mt-0.5">
                      Volume : {formatGallons(p.gallons)}
                    </span>
                  )}
                </div>
              )
            }}
          />

          <Line
            type="stepAfter"
            dataKey="coutGallon"
            stroke={trait}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: trait,
              strokeWidth: 2,
              stroke: 'var(--surface)',
            }}
            activeDot={{
              r: 6,
              strokeWidth: 2.5,
              stroke: 'var(--surface)',
              fill: 'var(--accent)',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
