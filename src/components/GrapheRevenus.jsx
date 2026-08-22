import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatHTG, formatDateAxe, formatDateCourte, formatMoisAnnee } from '../lib/format.js'

/**
 * Courbe d'évolution des revenus — motif Apple Fluid Glass :
 * Trait fluide avec halo lumineux, dégradé subtil multi-paliers,
 * grille optique en pointillés, infobulle frosted glass avec flou 16px.
 */
export default function GrapheRevenus({
  donnees,
  cle = 'revenus',
  surSombre = false,
  hauteur = 170,
  parMois = false,
}) {
  if (!donnees?.length) return null

  const trait = surSombre ? '#FFFFFF' : 'var(--accent)'
  const grille = surSombre ? 'var(--sur-hero-faible)' : 'var(--bordure)'
  const encre = surSombre ? 'var(--sur-hero-doux)' : 'var(--texte-doux)'
  const idDegrade = `degrade-${cle}-${surSombre ? 'sombre' : 'clair'}`

  // 4 à 5 repères pour une lisibilité aérée
  const pas = Math.max(1, Math.floor(donnees.length / 4))
  const reperes = donnees.filter((_, i) => i % pas === 0).map((d) => d.date)

  const etiquette = parMois ? formatMoisAnnee : formatDateCourte

  return (
    <div style={{ height: hauteur }} className="w-full relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={donnees} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
          <defs>
            <linearGradient id={idDegrade} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trait} stopOpacity={surSombre ? 0.32 : 0.22} />
              <stop offset="55%" stopColor={trait} stopOpacity={surSombre ? 0.12 : 0.06} />
              <stop offset="100%" stopColor={trait} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical
            horizontal={false}
            stroke={grille}
            strokeDasharray="3 4"
            opacity={0.7}
          />

          <XAxis
            dataKey="date"
            ticks={reperes}
            tickFormatter={parMois ? (d) => formatMoisAnnee(d).slice(0, 4) : formatDateAxe}
            tick={{ fontSize: 11, fill: encre, fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={14}
          />

          <YAxis hide domain={['dataMin', 'dataMax']} />

          <Tooltip
            cursor={{ stroke: trait, strokeWidth: 1.2, strokeDasharray: '3 3', opacity: 0.7 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.[0]) return null
              return (
                <div
                  className="pointer-events-none rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap shadow-lg border transition-transform"
                  style={{
                    background: surSombre ? 'rgba(255, 255, 255, 0.94)' : 'var(--glass-material-elevated)',
                    color: surSombre ? '#0b0c0f' : 'var(--texte)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    borderColor: surSombre ? 'rgba(255, 255, 255, 0.4)' : 'var(--border-subtle)',
                    boxShadow: 'var(--ombre-flottant)',
                  }}
                >
                  <span className="text-[11px] opacity-75 block mb-0.5">{etiquette(label)}</span>
                  <span className="text-sm font-semibold chiffres" style={{ color: surSombre ? '#124ea4' : 'var(--accent)' }}>
                    {formatHTG(payload[0].value)}
                  </span>
                </div>
              )
            }}
          />

          <Area
            type="monotone"
            dataKey={cle}
            stroke={trait}
            strokeWidth={2.5}
            fill={`url(#${idDegrade})`}
            activeDot={{
              r: 5,
              strokeWidth: 2.5,
              stroke: surSombre ? '#124ea4' : 'var(--surface)',
              fill: trait,
            }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
