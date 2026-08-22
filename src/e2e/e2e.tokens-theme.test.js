import './setup.js'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  lireMode,
  resoudre,
  appliquer,
  ecrireMode,
  couleurDonnees,
  suivreSysteme,
  MODES,
} from '../lib/theme.js'
import fs from 'node:fs'
import path from 'node:path'

describe('F01: Multi-tiered Surface & Glass Token System (Tier 1 & Tier 2)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset = {}
  })

  // Tier 1: Feature Coverage
  it('T1.F01.01: reads default theme as "system" when unconfigured', () => {
    expect(lireMode()).toBe('system')
  })

  it('T1.F01.02: sets and persists light mode correctly', () => {
    const result = ecrireMode('light')
    expect(result).toBe('light')
    expect(lireMode()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('T1.F01.03: sets and persists dark mode correctly', () => {
    const result = ecrireMode('dark')
    expect(result).toBe('dark')
    expect(lireMode()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('T1.F01.04: transposes brand data colors for dark mode elevation', () => {
    // #222026 (brand black) -> #E8E8EA (bright ink on dark surface)
    expect(couleurDonnees('#222026', true)).toBe('#E8E8EA')
    // #2672DD (brand blue) -> #5B9BF5 (brightened blue)
    expect(couleurDonnees('#2672DD', true)).toBe('#5B9BF5')
    // Cyan stays identical on both light and dark
    expect(couleurDonnees('#22D3F5', true)).toBe('#22D3F5')
    // #E4E4E6 (neutral grey) -> #4A4952
    expect(couleurDonnees('#E4E4E6', true)).toBe('#4A4952')
  })

  it('T1.F01.05: preserves original data colors in light mode', () => {
    expect(couleurDonnees('#222026', false)).toBe('#222026')
    expect(couleurDonnees('#2672DD', false)).toBe('#2672DD')
    expect(couleurDonnees('#22D3F5', false)).toBe('#22D3F5')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F01.01: handles corrupted or invalid localStorage theme string safely', () => {
    localStorage.setItem('kiosque-theme', 'neon-purple-invalid')
    expect(lireMode()).toBe('system')
  })

  it('T2.F01.02: handles null or undefined or empty hex strings in color transposition', () => {
    expect(couleurDonnees(null, true)).toBe(null)
    expect(couleurDonnees(undefined, true)).toBe(undefined)
    expect(couleurDonnees('', true)).toBe('')
  })

  it('T2.F01.03: handles lowercase and uppercase hex inputs consistently', () => {
    expect(couleurDonnees('#222026', true)).toBe('#E8E8EA')
    expect(couleurDonnees('#222026'.toLowerCase(), true)).toBe('#E8E8EA')
    expect(couleurDonnees('#2672dd', true)).toBe('#5B9BF5')
  })

  it('T2.F01.04: untransposed custom hex colors pass through unchanged in dark mode', () => {
    expect(couleurDonnees('#FF00AA', true)).toBe('#FF00AA')
    expect(couleurDonnees('#123456', true)).toBe('#123456')
  })

  it('T2.F01.05: resolves system theme fallback when matchMedia matches dark', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = (q) => ({
      matches: q.includes('dark'),
      media: q,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    })

    expect(resoudre('system')).toBe('dark')
    expect(resoudre('light')).toBe('light')
    expect(resoudre('dark')).toBe('dark')

    window.matchMedia = originalMatchMedia
  })
})

describe('F02: Optical Borders & Rim Light Tokens Verification (Tier 1 & Tier 2)', () => {
  const tokensCssPath = path.resolve(__dirname, '../styles/tokens.css')
  const indexCssPath = path.resolve(__dirname, '../styles/index.css')
  let tokensContent = ''
  let indexContent = ''

  beforeEach(() => {
    tokensContent = fs.readFileSync(tokensCssPath, 'utf8')
    indexContent = fs.readFileSync(indexCssPath, 'utf8')
  })

  it('T1.F02.01: declares all surface and border tokens in tokens.css', () => {
    expect(tokensContent).toContain('--fond:')
    expect(tokensContent).toContain('--surface:')
    expect(tokensContent).toContain('--surface-elevated:')
    expect(tokensContent).toContain('--border-subtle:')
    expect(tokensContent).toContain('--glass-material:')
    expect(tokensContent).toContain('--rim-light:')
  })

  it('T1.F02.02: declares hero gradient and contrast tokens in light and dark mode', () => {
    expect(tokensContent).toContain('--hero-gradient:')
    expect(tokensContent).toContain('--sur-hero: #ffffff;')
    expect(tokensContent).toContain('--hero:')
  })

  it('T1.F02.03: declares subtle optical shadows in tokens.css', () => {
    expect(tokensContent).toContain('--ombre-carte:')
    expect(tokensContent).toContain('--ombre-flottant:')
    expect(tokensContent).toContain('--voile:')
  })

  it('T1.F02.04: applies card layout primitive (.carte) with surface tokens in index.css', () => {
    expect(indexContent).toContain('.carte {')
    expect(indexContent).toContain('background: var(--surface);')
    expect(indexContent).toContain('border-radius: var(--radius-carte);')
    expect(indexContent).toContain('padding: var(--padding-carte);')
  })

  it('T1.F02.05: defines .carte-noire and .carte-bleue variants with hero tokens', () => {
    expect(indexContent).toContain('.carte-noire {')
    expect(indexContent).toContain('background: var(--hero-gradient);')
    expect(indexContent).toContain('.carte-bleue {')
    expect(indexContent).toContain('background: var(--hero-gradient);')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F02.01: ensures min-width: 0 on .carte and .colonne to prevent flex/grid blowout', () => {
    expect(indexContent).toContain('min-width: 0;')
  })

  it('T2.F02.02: verifies dark mode delta contrast tokens are properly bound', () => {
    expect(tokensContent).toContain('--delta-haut: var(--vert);')
    expect(tokensContent).toContain('--delta-bas: var(--rouge);')
  })

  it('T2.F02.03: verifies light mode delta hero contrast variants', () => {
    expect(tokensContent).toContain('--delta-haut-hero: #4ade80;')
    expect(tokensContent).toContain('--delta-bas-hero: #ffb3b3;')
  })

  it('T2.F02.04: checks settings text contrast override token for light mode', () => {
    expect(indexContent).toContain(":root:not([data-theme='dark']) .reglages")
    expect(indexContent).toContain('--texte-doux: rgb(25 24 29 / 0.68);')
  })

  it('T2.F02.05: verifies font family declaration uses Readex Pro variable', () => {
    expect(tokensContent).toContain("'Readex Pro Variable'")
  })
})

describe('F03 & F04: Spring Easing, Animations & Tactile Interactions (Tier 1 & Tier 2)', () => {
  const tokensCssPath = path.resolve(__dirname, '../styles/tokens.css')
  const indexCssPath = path.resolve(__dirname, '../styles/index.css')
  let tokensContent = ''
  let indexContent = ''

  beforeEach(() => {
    tokensContent = fs.readFileSync(tokensCssPath, 'utf8')
    indexContent = fs.readFileSync(indexCssPath, 'utf8')
  })

  it('T1.F03.01: declares view transition keyframes and animation', () => {
    expect(indexContent).toContain('@keyframes vue-entree')
    expect(indexContent).toContain('transform: translateY(8px);')
  })

  it('T1.F03.02: declares list entry animation stagger (.anim-liste)', () => {
    expect(indexContent).toContain('@keyframes liste-entree')
    expect(indexContent).toContain('.anim-liste > *')
    expect(indexContent).toContain('calc(var(--i, 0) * 24ms)')
  })

  it('T1.F03.03: declares sheet rise animation (@keyframes montee)', () => {
    expect(indexContent).toContain('@keyframes montee')
    expect(indexContent).toContain('transform: translateY(16px)')
  })

  it('T1.F03.04: declares spring cubic-bezier tokens in tokens.css', () => {
    expect(tokensContent).toContain('--transition-ui: cubic-bezier(0.23, 1, 0.32, 1);')
    expect(tokensContent).toContain('--transition-tiroir: cubic-bezier(0.32, 0.72, 0, 1);')
  })

  it('T1.F04.01: declares tactile 44px min target utility (.cible-tactile)', () => {
    expect(indexContent).toContain('.cible-tactile')
    expect(indexContent).toContain('min-height: 44px;')
    expect(indexContent).toContain('min-width: 44px;')
  })

  it('T1.F04.02: declares calendar cell active press state (.case-cal:active)', () => {
    expect(indexContent).toContain('.case-cal:active')
    expect(indexContent).toContain('transform: scale(0.95);')
  })

  // Tier 2: Boundary & Corner Cases
  it('T2.F04.01: declares PIN error shake animation keyframes (@keyframes secousse)', () => {
    expect(indexContent).toContain('@keyframes secousse')
    expect(indexContent).toContain('transform: translateX(-6px);')
    expect(indexContent).toContain('transform: translateX(6px);')
  })

  it('T2.F04.02: declares prefers-reduced-motion accessibility media query', () => {
    expect(indexContent).toContain('@media (prefers-reduced-motion: reduce)')
    expect(indexContent).toContain('animation-duration: 0.01ms !important;')
    expect(indexContent).toContain('transition-duration: 0.01ms !important;')
  })

  it('T2.F04.03: declares tabular numeric alignment utility (.chiffres)', () => {
    expect(indexContent).toContain('.chiffres')
    expect(indexContent).toContain('font-variant-numeric: tabular-nums;')
  })

  it('T2.F04.04: declares scrollbar concealment utility (.defile-x)', () => {
    expect(indexContent).toContain('.defile-x')
    expect(indexContent).toContain('scrollbar-width: none;')
  })

  it('T2.F04.05: declares card cascade stepped delays (nth-child)', () => {
    expect(indexContent).toContain('.anim-cartes > *:nth-child(2)')
    expect(indexContent).toContain('animation-delay: 40ms;')
    expect(indexContent).toContain('.anim-cartes > *:nth-child(5)')
    expect(indexContent).toContain('animation-delay: 160ms;')
  })
})
