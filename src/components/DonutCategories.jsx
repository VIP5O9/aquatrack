import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatHTG } from '../lib/format.js'
import { couleurDonnees } from '../lib/theme.js'
import { useSombre } from '../store/useStore.js'

/**
 * Donut « Où part votre argent » — standard Apple Fluid Glass :
 * Segments à rayons soignés, pourcentages posés directement sur l'anneau,
 * total/détail interactif au centre, légende tactile avec pastilles optiques.
 */
export default function DonutCategories({
  parts: brutes,
  total,
  taille = 210,
  libelleCentre = 'encaissé',
}) {
  const [actif, setActif] = useState(null)
  const sombre = useSombre()

  // Transposition des couleurs pour assurer le contraste parfait dans les deux thèmes
  const parts = useMemo(
    () => (brutes ?? []).map((p) => ({ ...p, couleur: couleurDonnees(p.couleur, sombre) })),
    [brutes, sombre],
  )

  if (!parts.length || total <= 0) return null

  const rayonExterne = taille / 2 - 14
  const rayonInterne = rayonExterne * 0.64

  return (
    <div className="w-full select-none">
      <div className="relative mx-auto" style={{ width: taille, height: taille }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={parts}
              dataKey="montant"
              nameKey="nom"
              innerRadius={rayonInterne}
              outerRadius={rayonExterne}
              paddingAngle={2.5}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              onMouseEnter={(_, i) => setActif(i)}
              onMouseLeave={() => setActif(null)}
              label={({ cx, cy, midAngle, innerRadius: ri, outerRadius: ro, percent, index }) => {
                if (percent < 0.08) return null
                const rad = -midAngle * (Math.PI / 180)
                const r = ri + (ro - ri) / 2
                return (
                  <text
                    x={cx + r * Math.cos(rad)}
                    y={cy + r * Math.sin(rad)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}
                    fill={lisibleSur(parts[index].couleur)}
                  >
                    {Math.round(percent * 100)} %
                  </text>
                )
              }}
              labelLine={false}
            >
              {parts.map((p, i) => (
                <Cell
                  key={p.nom}
                  fill={p.couleur}
                  style={{
                    transform: actif === i ? 'scale(1.045)' : 'none',
                    transformOrigin: 'center',
                    transition: 'transform 0.2s var(--transition-ui), filter 0.2s ease',
                    filter: actif === i ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centre du Donut avec affichage interactif */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center px-2">
            <p className="chiffres text-[18px] leading-tight font-semibold tracking-tight text-[var(--texte)]">
              {formatHTG(actif != null ? parts[actif].montant : total)}
            </p>
            <p className="sous-ligne mt-0.5 max-w-[12ch] truncate font-medium text-[var(--texte-doux)]">
              {actif != null ? parts[actif].nom : libelleCentre}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des catégories & légende */}
      <ul className="mt-4 flex flex-col gap-1.5">
        {parts.map((p, i) => {
          const estActif = actif === i
          const pct = Math.round((p.montant / total) * 100)
          return (
            <li
              key={p.nom}
              onMouseEnter={() => setActif(i)}
              onMouseLeave={() => setActif(null)}
              onClick={() => setActif(estActif ? null : i)}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                estActif ? 'bg-[var(--surface-doux)]' : 'hover:bg-[var(--surface-doux)]/50'
              }`}
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full shadow-sm"
                style={{
                  background: p.couleur,
                  boxShadow: estActif ? `0 0 8px ${p.couleur}` : 'none',
                  outline: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              />
              <span
                className={`min-w-0 flex-1 truncate font-medium ${
                  estActif ? 'text-[var(--texte)]' : 'text-[var(--texte-doux)]'
                }`}
              >
                {p.nom}
              </span>
              <span className="chiffres shrink-0 font-semibold text-[var(--texte)]">
                {formatHTG(p.montant)}
              </span>
              <span
                className="chiffres w-11 shrink-0 text-right font-medium text-[var(--texte-doux)]"
              >
                {pct} %
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Calcule le contraste optimal pour le texte sur le segment */
function lisibleSur(hex) {
  if (!hex || typeof hex !== 'string') return '#FFFFFF'
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16) || 0
  const g = parseInt(c.slice(2, 4), 16) || 0
  const b = parseInt(c.slice(4, 6), 16) || 0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#19181d' : '#FFFFFF'
}
