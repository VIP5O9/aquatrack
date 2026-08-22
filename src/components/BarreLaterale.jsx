import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  ChartNoAxesColumn,
  ScrollText,
  Settings,
  Droplet,
  Lock,
  Sun,
  Moon,
  MonitorSmartphone,
} from 'lucide-react'
import { useStore, useEtat } from '../store/useStore.js'
import BadgeSync from './BadgeSync.jsx'
import * as M from '../lib/metrics.js'
import { formatHTG, MONTANT_MASQUE } from '../lib/format.js'

/**
 * Navigation latérale — Desktop (>= 1024px) avec esthétique Apple Fluid Glass.
 *
 * Translucide avec flou optique (backdrop-filter: blur(20px) saturate(180%)),
 * délimitation droite sous-pixel et éclairage rim-light.
 * Contient les liens de navigation principaux, la synthèse mensuelle en direct,
 * le verrouillage rapide et le sélecteur de thème tactile.
 */
const ONGLETS = [
  { to: '/tableau-de-bord', libelle: 'Accueil', icone: Home },
  { to: '/analytiques', libelle: 'Analytiques', icone: ChartNoAxesColumn },
  { to: '/journal', libelle: 'Journal', icone: ScrollText },
  { to: '/reglages', libelle: 'Réglages', icone: Settings },
]

const THEMES = [
  { valeur: 'light', icone: Sun, titre: 'Thème clair' },
  { valeur: 'dark', icone: Moon, titre: 'Thème sombre' },
  { valeur: 'system', icone: MonitorSmartphone, titre: 'Suivre le système' },
]

export default function BarreLaterale() {
  const etat = useEtat()
  const themeMode = useStore((s) => s.themeMode)
  const changerTheme = useStore((s) => s.changerTheme)
  const applicationMasquee = useStore((s) => s.applicationMasquee)
  const montantsCaches = useStore((s) => s.montantsCaches)

  const resume = useMemo(() => {
    const mois = M.moisCourant()
    return {
      net: M.beneficeNet(etat, mois),
      stock: M.gallonsEnStock(etat),
      jours: M.joursDeStock(etat),
    }
  }, [etat])

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col select-none lg:flex"
      style={{
        background: 'var(--glass-material)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light)',
      }}
    >
      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        {/* --- Marque & Identité --- */}
        <div className="mb-6 flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-[12px] shadow-sm"
            style={{
              background: 'var(--hero-gradient)',
              color: 'var(--sur-hero)',
              boxShadow: 'var(--lueur-accent)',
            }}
          >
            <Droplet size={19} strokeWidth={2.2} fill="currentColor" />
          </span>
          <span className="text-[15px] leading-tight font-medium tracking-tight">
            Aqua Track
            <span className="block text-[11px] font-normal" style={{ color: 'var(--texte-doux)' }}>
              Gestion de kiosque
            </span>
          </span>
        </div>

        {/* --- Navigation --- */}
        <nav aria-label="Navigation latérale">
          <ul className="flex flex-col gap-1.5">
            {ONGLETS.map((o) => (
              <li key={o.to}>
                <NavLink
                  to={o.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all duration-150 active:scale-[0.98] ${
                      isActive ? '' : 'hover:bg-[var(--surface-doux)]'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--action)' : undefined,
                    color: isActive ? 'var(--sur-action)' : 'var(--texte-doux)',
                    fontWeight: isActive ? 500 : 400,
                    boxShadow: isActive ? 'var(--rim-light-subtle)' : undefined,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <o.icone
                        size={19}
                        strokeWidth={isActive ? 2.25 : 1.75}
                        className="transition-transform duration-150 group-hover:scale-105"
                      />
                      <span>{o.libelle}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* --- Synthèse du mois -------------------------------------------- */}
        <section
          className="mt-6 rounded-[18px] p-4"
          style={{
            background: 'var(--surface-doux)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--rim-light-subtle)',
          }}
        >
          <p className="text-[11px] font-medium tracking-wider uppercase" style={{ color: 'var(--texte-doux)' }}>
            Ce mois
          </p>
          <p className="chiffres mt-1.5 text-[22px] leading-none font-medium tracking-tight">
            {montantsCaches ? MONTANT_MASQUE : formatHTG(resume.net)}
          </p>
          <p className="sous-ligne mt-1">bénéfice net</p>

          <div
            className="mt-3.5 flex items-baseline justify-between gap-2 pt-3.5"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <span className="sous-ligne">En stock</span>
            <span className="chiffres text-sm font-medium">
              {Math.round(resume.stock).toLocaleString('fr-FR')} gal
            </span>
          </div>
          {resume.jours != null && (
            <p
              className="mt-0.5 text-right text-[11px]"
              style={{
                color: resume.jours < 3 ? 'var(--texte)' : 'var(--texte-doux)',
                fontWeight: resume.jours < 3 ? 500 : 400,
              }}
            >
              {resume.stock <= 0 ? 'Citerne vide' : `~${Math.round(resume.jours)} jours restants`}
            </p>
          )}
        </section>

        <div className="flex-1" />
      </div>

      {/* --- Pied : actions rapides --------------------------------------- */}
      <div
        className="p-5 pt-4"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--glass-material-subtil)',
        }}
      >
        {etat.reglages.verrou_actif && (
          <button
            onClick={() => {
              applicationMasquee()
              useStore.setState({ verrouille: true })
            }}
            className="mb-3 flex w-full items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 text-[13px] font-medium transition-all active:scale-[0.98]"
            style={{
              background: 'var(--surface-doux)',
              color: 'var(--texte-doux)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--rim-light-subtle)',
            }}
          >
            <Lock size={15} strokeWidth={1.75} />
            <span>Verrouiller maintenant</span>
          </button>
        )}

        <div className="flex items-center justify-between gap-2">
          <BadgeSync />

          <div
            className="flex gap-0.5 rounded-full p-0.5"
            style={{
              background: 'var(--surface-doux)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {THEMES.map((t) => {
              const actif = themeMode === t.valeur
              return (
                <button
                  key={t.valeur}
                  onClick={() => changerTheme(t.valeur)}
                  title={t.titre}
                  aria-label={t.titre}
                  aria-pressed={actif}
                  className="grid size-7 place-items-center rounded-full transition-all active:scale-90"
                  style={{
                    background: actif ? 'var(--action)' : 'transparent',
                    color: actif ? 'var(--sur-action)' : 'var(--texte-doux)',
                    boxShadow: actif ? 'var(--rim-light-subtle)' : undefined,
                  }}
                >
                  <t.icone size={13} strokeWidth={2} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
