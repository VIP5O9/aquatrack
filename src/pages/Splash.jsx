import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, Sparkles, ArrowRight } from 'lucide-react'
import { lireMeta, ecrireMeta } from '../lib/db.js'

/**
 * Écran d'accueil (Splash Screen) — Apple Fluid Glass & Ambient Aesthetics.
 *
 * Présentation de marque à fort impact avec iconographie d'eau fluide,
 * aura luminescente ambiante, typographie d'affichage optique et bouton
 * de démarrage à ressort tactile.
 *
 * Persiste la complétion dans `lireMeta('splash_vu')` pour basculer
 * directement sur le tableau de bord aux ouvertures subséquentes.
 */
export default function Splash() {
  const naviguer = useNavigate()

  useEffect(() => {
    lireMeta('splash_vu', false).then((vu) => {
      if (vu) naviguer('/tableau-de-bord', { replace: true })
    })
  }, [naviguer])

  async function commencer() {
    await ecrireMeta('splash_vu', true)
    naviguer('/tableau-de-bord')
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-6 py-12 select-none">
      {/* Halo lumineux d'ambiance en arrière-plan */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-40 blur-3xl transition-opacity dark:opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(38, 114, 221, 0.45) 0%, rgba(6, 182, 212, 0.25) 50%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        {/* Pilule de marque supérieure */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
          style={{
            background: 'var(--surface-doux)',
            color: 'var(--texte-doux)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--rim-light-subtle)',
          }}
        >
          <Droplet size={14} className="text-cyan-500" fill="currentColor" />
          <span>Gestion de kiosque d'eau PWA</span>
        </div>

        {/* Illustration vectorielle fluide */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute size-44 rounded-full opacity-60 blur-xl dark:opacity-40"
            style={{ background: 'var(--hero-gradient)' }}
            aria-hidden="true"
          />
          <Illustration />
        </div>

        <h1 className="mt-8 text-[32px] font-semibold tracking-tight sm:text-[36px]">
          Aqua&nbsp;Track
        </h1>

        <p
          className="mt-3 max-w-[34ch] text-[15px] leading-relaxed"
          style={{ color: 'var(--texte-doux)' }}
        >
          Suivez vos ventes de gallons d'eau, gérez vos revenus et optimisez votre activité
          en toute autonomie.
        </p>
      </div>

      {/* Bouton de démarrage tactile */}
      <div className="relative z-10 w-full max-w-[420px]">
        <button
          onClick={commencer}
          type="button"
          className="tactile-press-accent group flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[15px] font-medium transition-all duration-150 active:scale-[0.98]"
          style={{
            background: 'var(--hero-gradient)',
            color: 'var(--sur-hero)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'var(--lueur-accent), var(--ombre-flottant)',
          }}
        >
          <span>Commencer</span>
          <ArrowRight
            size={18}
            strokeWidth={2.2}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  )
}

/**
 * Illustration dessinée en SVG pur avec dégradés multi-arrêts,
 * reflets optiques de goutte d'eau et trajectoire de croissance dynamique.
 */
function Illustration() {
  return (
    <svg
      width="190"
      height="190"
      viewBox="0 0 190 190"
      fill="none"
      role="img"
      aria-label="Goutte d'eau luminescente et courbe de croissance"
      className="relative drop-shadow-xl"
    >
      <defs>
        <linearGradient id="goutte-gradient" x1="95" y1="20" x2="95" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3F5" />
          <stop offset="55%" stopColor="#2672DD" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>

        <linearGradient id="courbe-gradient" x1="38" y1="152" x2="154" y2="136" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#2672DD" />
        </linearGradient>

        <filter id="lueur" x="0" y="0" width="190" height="190" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Disque récepteur en verre */}
      <circle
        cx="95"
        cy="95"
        r="84"
        fill="var(--surface)"
        stroke="var(--border-subtle)"
        strokeWidth="1.5"
      />

      {/* Anneaux d'onde concentriques */}
      <circle cx="95" cy="95" r="68" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />

      {/* Goutte principale lumineuse */}
      <path
        d="M95 24c0 0 36 40 36 64a36 36 0 1 1-72 0c0-24 36-64 36-64z"
        fill="url(#goutte-gradient)"
      />

      {/* Reflet de courbure Apple */}
      <path
        d="M78 94a18 18 0 0 1 11-17"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Courbe ascendante — Trajectoire d'activité & croissance */}
      <path
        d="M38 152c15 0 22-14 34-14s17 11 30 11 24-22 36-22 13 7 19 7"
        stroke="url(#courbe-gradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Point d'étape lumineux */}
      <circle cx="157" cy="134" r="5" fill="#22D3F5" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  )
}
