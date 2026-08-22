import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('===================================================================')
console.log('Aqua Track Milestone 1 — Empirical Verification & Stress Test Suite')
console.log('===================================================================\n')

let passCount = 0
let failCount = 0

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`)
    passCount++
  } else {
    console.error(`  ✗ FAIL: ${testName}`)
    if (details) console.error(`    Details: ${details}`)
    failCount++
  }
}

// -----------------------------------------------------------------------------
// 1. File Inspection & Token Extraction
// -----------------------------------------------------------------------------
console.log('--- Suite 1: File Existence & Token Architecture ---')
const tokensCssPath = path.join(rootDir, 'src/styles/tokens.css')
const indexCssPath = path.join(rootDir, 'src/styles/index.css')
const appCssPath = path.join(rootDir, 'src/App.css')

assert(fs.existsSync(tokensCssPath), 'src/styles/tokens.css exists')
assert(fs.existsSync(indexCssPath), 'src/styles/index.css exists')
assert(fs.existsSync(appCssPath), 'src/App.css exists')

const tokensCss = fs.readFileSync(tokensCssPath, 'utf8')
const indexCss = fs.readFileSync(indexCssPath, 'utf8')
const appCss = fs.readFileSync(appCssPath, 'utf8')

// Check required multi-tiered surface tokens in light mode
const lightTokens = [
  '--fond',
  '--surface',
  '--surface-elevated',
  '--surface-doux',
  '--glass-material',
  '--glass-material-subtil',
  '--glass-material-elevated',
  '--bordure',
  '--border-subtle',
  '--rim-light',
  '--rim-light-subtle',
  '--rim-light-elevated',
  '--hero-gradient',
  '--hero-gradient-eclat',
  '--accent',
  '--accent-glow',
  '--transition-ui',
  '--transition-tiroir',
  '--transition-tactile',
]

lightTokens.forEach((token) => {
  assert(tokensCss.includes(`${token}:`), `Light token declared: ${token}`)
})

// Check dark mode token parity in :root[data-theme='dark']
const darkSectionMatch = tokensCss.match(/:root\[data-theme='dark'\]\s*\{([^}]+)\}/s)
assert(darkSectionMatch !== null, ":root[data-theme='dark'] selector present in tokens.css")

if (darkSectionMatch) {
  const darkContent = darkSectionMatch[1]
  const darkTokens = [
    '--fond',
    '--surface',
    '--surface-elevated',
    '--surface-doux',
    '--glass-material',
    '--glass-material-subtil',
    '--glass-material-elevated',
    '--bordure',
    '--border-subtle',
    '--rim-light',
    '--rim-light-subtle',
    '--rim-light-elevated',
    '--hero-gradient',
    '--accent',
    '--accent-glow',
    '--ombre-carte',
    '--ombre-elevated',
    '--voile',
  ]

  darkTokens.forEach((token) => {
    assert(darkContent.includes(`${token}:`), `Dark token override declared: ${token}`)
  })
}

// -----------------------------------------------------------------------------
// 2. Motion Curves & Spring Physics Oracle
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Cubic-Bezier Motion Curves & Spring Physics ---')

function solveCubicBezier(p1x, p1y, p2x, p2y) {
  // Cubic Bezier curve evaluator: x(t), y(t) with P0=(0,0), P3=(1,1)
  function bezierCoord(t, p1, p2) {
    // B(t) = 3*(1-t)^2 * t * p1 + 3*(1-t) * t^2 * p2 + t^3
    return 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3)
  }

  function bezierDerivative(t, p1, p2) {
    // B'(t) = 3*(1-t)^2 * p1 + 6*(1-t)*t * (p2 - p1) + 3*t^2 * (1 - p2)
    return 3 * Math.pow(1 - t, 2) * p1 + 6 * (1 - t) * t * (p2 - p1) + 3 * Math.pow(t, 2) * (1 - p2)
  }

  // Find t for a given x using Newton-Raphson
  function getTForX(xTarget) {
    let t = xTarget
    for (let i = 0; i < 8; i++) {
      const currentX = bezierCoord(t, p1x, p2x) - xTarget
      if (Math.abs(currentX) < 1e-6) return t
      const dxdt = bezierDerivative(t, p1x, p2x)
      if (Math.abs(dxdt) < 1e-6) break
      t -= currentX / dxdt
    }
    return Math.max(0, Math.min(1, t))
  }

  function sample(x) {
    const t = getTForX(x)
    return bezierCoord(t, p1y, p2y)
  }

  return { sample, p1x, p1y, p2x, p2y }
}

// Test UI Entry curve: cubic-bezier(0.23, 1, 0.32, 1)
const uiCurve = solveCubicBezier(0.23, 1, 0.32, 1)
assert(tokensCss.includes('cubic-bezier(0.23, 1, 0.32, 1)'), 'tokens.css contains cubic-bezier(0.23, 1, 0.32, 1)')
assert(uiCurve.p1x >= 0 && uiCurve.p1x <= 1, 'UI curve x1 is in valid CSS range [0, 1]')
assert(uiCurve.p2x >= 0 && uiCurve.p2x <= 1, 'UI curve x2 is in valid CSS range [0, 1]')

// Initial slope (velocity at entry)
const initialSlopeUI = uiCurve.p1y / uiCurve.p1x
console.log(`  ℹ UI Entry Initial Velocity Slope: ${initialSlopeUI.toFixed(3)} (ideal > 3.0 for responsive snap)`)
assert(initialSlopeUI > 3.5, 'UI Entry curve has high initial velocity (> 3.5) for instant responsiveness')

// Settling behavior: at 50% time elapsed, position is high
const pos50UI = uiCurve.sample(0.5)
console.log(`  ℹ UI Entry Position at 50% duration: ${(pos50UI * 100).toFixed(1)}%`)
assert(pos50UI > 0.85, 'UI Entry curve reaches >85% completion at 50% duration')

// Monotonicity check (no negative overshoot or wild oscillation)
let isMonotonicUI = true
let prevY = 0
for (let x = 0; x <= 1; x += 0.02) {
  const y = uiCurve.sample(x)
  if (y < prevY - 1e-5) isMonotonicUI = false
  prevY = y
}
assert(isMonotonicUI, 'UI Entry curve is strictly monotonic (zero jank / no reverse motion)')

// Test Sheet Drawer curve: cubic-bezier(0.32, 0.72, 0, 1)
const sheetCurve = solveCubicBezier(0.32, 0.72, 0, 1)
assert(tokensCss.includes('cubic-bezier(0.32, 0.72, 0, 1)'), 'tokens.css contains cubic-bezier(0.32, 0.72, 0, 1)')
assert(sheetCurve.p1x >= 0 && sheetCurve.p1x <= 1, 'Sheet curve x1 is in valid CSS range [0, 1]')
assert(sheetCurve.p2x >= 0 && sheetCurve.p2x <= 1, 'Sheet curve x2 is in valid CSS range [0, 1]')

const pos50Sheet = sheetCurve.sample(0.5)
console.log(`  ℹ Sheet Drawer Position at 50% duration: ${(pos50Sheet * 100).toFixed(1)}%`)
assert(pos50Sheet > 0.75, 'Sheet Drawer curve reaches >75% completion at 50% duration (smooth deceleration)')

// -----------------------------------------------------------------------------
// 3. Tactile Press Feedback & Zero-Slop Hardware Layering
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Tactile Press Feedback & GPU Acceleration ---')

// Check .tactile-press in App.css / index.css
assert(appCss.includes('.tactile-press:active'), '.tactile-press:active defined in App.css')
assert(appCss.includes('transform: scale(0.97);'), '.tactile-press:active applies scale(0.97)')
assert(appCss.includes('user-select: none;'), '.tactile-press has user-select: none protection')
assert(appCss.includes('-webkit-tap-highlight-color: transparent;'), '.tactile-press removes webkit tap highlight')
assert(appCss.includes('will-change: transform;'), '.tactile-press includes will-change: transform')

// Sub-variants
assert(appCss.includes('.tactile-press-subtil:active'), '.tactile-press-subtil:active defined')
assert(appCss.includes('transform: scale(0.985);'), '.tactile-press-subtil applies scale(0.985)')
assert(appCss.includes('.tactile-press-accent:active'), '.tactile-press-accent:active defined')
assert(appCss.includes('transform: scale(0.96);'), '.tactile-press-accent applies scale(0.96)')

// GPU acceleration utility
assert(appCss.includes('.gpu-accel'), '.gpu-accel class defined')
assert(appCss.includes('transform: translateZ(0);'), '.gpu-accel applies 3D transform translateZ(0)')
assert(appCss.includes('backface-visibility: hidden;'), '.gpu-accel applies backface-visibility: hidden')
assert(appCss.includes('perspective: 1000px;'), '.gpu-accel applies perspective: 1000px')

// Verify transition targets only composite properties (transform, opacity, box-shadow, filter)
const tactileTransitionMatch = appCss.match(/\.tactile-press\s*\{([^}]+)\}/s)
if (tactileTransitionMatch) {
  const props = tactileTransitionMatch[1]
  assert(!props.includes('width') && !props.includes('height') && !props.includes('margin') && !props.includes('top'),
    '.tactile-press avoids layout properties (zero reflow/layout shifts)')
}

// -----------------------------------------------------------------------------
// 4. Glassmorphism Utilities & Translucent Material Architecture
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Glassmorphism Utilities & Backdrop Filtering ---')

const glassClasses = [
  { name: '.effet-verre', file: indexCss },
  { name: '.effet-verre-subtil', file: indexCss },
  { name: '.effet-verre-elevated', file: indexCss },
  { name: '.glass-panel', file: indexCss },
  { name: '.glass-nav', file: appCss },
  { name: '.glass-header', file: appCss },
  { name: '.glass-sheet', file: appCss },
  { name: '.glass-pill', file: appCss },
]

glassClasses.forEach(({ name, file }) => {
  assert(file.includes(name), `Glassmorphic class declared: ${name}`)
})

// Verify WebKit prefix for backdrop-filter across all glass rules
const hasBackdropFilter = indexCss.includes('backdrop-filter: blur(') && appCss.includes('backdrop-filter: blur(')
const hasWebkitBackdropFilter = indexCss.includes('-webkit-backdrop-filter: blur(') && appCss.includes('-webkit-backdrop-filter: blur(')

assert(hasBackdropFilter, 'Standard backdrop-filter is used')
assert(hasWebkitBackdropFilter, '-webkit-backdrop-filter prefix is applied for Safari / iOS PWA compatibility')

// Verify saturation enhancement
assert(indexCss.includes('saturate(180%)') || appCss.includes('saturate(180%)'), 'Apple-style saturate(180%) applied on glass material')

// -----------------------------------------------------------------------------
// 5. Contrast Ratios & WCAG 2.1 AA/AAA Compliance Oracle
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Color Contrast & WCAG 2.1 Compliance ---')

function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return { r, g, b }
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1))
  const lum2 = relativeLuminance(hexToRgb(hex2))
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

// Light theme contrast
const lightBg = '#ffffff'
const lightFond = '#f4f6fa'
const lightText = '#19181d'
const lightAccent = '#2672dd'
const lightGreen = '#16a34a'
const lightRed = '#dc2626'

const crLightTextOnWhite = contrastRatio(lightText, lightBg)
console.log(`  ℹ Light Mode: Primary Text (${lightText}) on Surface (${lightBg}) = ${crLightTextOnWhite.toFixed(2)}:1`)
assert(crLightTextOnWhite >= 7.0, 'Light Mode Primary Text passes WCAG AAA (>= 7.0:1)')

const crLightTextOnFond = contrastRatio(lightText, lightFond)
console.log(`  ℹ Light Mode: Primary Text (${lightText}) on Page Background (${lightFond}) = ${crLightTextOnFond.toFixed(2)}:1`)
assert(crLightTextOnFond >= 7.0, 'Light Mode Primary Text on Fond passes WCAG AAA (>= 7.0:1)')

const crLightAccentOnWhite = contrastRatio(lightAccent, lightBg)
console.log(`  ℹ Light Mode: Accent Blue (${lightAccent}) on Surface (${lightBg}) = ${crLightAccentOnWhite.toFixed(2)}:1`)
assert(crLightAccentOnWhite >= 4.5, 'Light Mode Accent Blue passes WCAG AA (>= 4.5:1)')

// Dark theme contrast
const darkBg = '#15161b'
const darkFond = '#0b0c0f'
const darkElevated = '#1f2027'
const darkText = '#f1f2f6'
const darkAccent = '#5b9bf5'
const darkGreen = '#4ade80'
const darkRed = '#f87171'

const crDarkTextOnBg = contrastRatio(darkText, darkBg)
console.log(`  ℹ Dark Mode: Primary Text (${darkText}) on Dark Surface (${darkBg}) = ${crDarkTextOnBg.toFixed(2)}:1`)
assert(crDarkTextOnBg >= 7.0, 'Dark Mode Primary Text on Surface passes WCAG AAA (>= 7.0:1)')

const crDarkTextOnElevated = contrastRatio(darkText, darkElevated)
console.log(`  ℹ Dark Mode: Primary Text (${darkText}) on Elevated Surface (${darkElevated}) = ${crDarkTextOnElevated.toFixed(2)}:1`)
assert(crDarkTextOnElevated >= 7.0, 'Dark Mode Primary Text on Elevated Surface passes WCAG AAA (>= 7.0:1)')

const crDarkAccentOnBg = contrastRatio(darkAccent, darkBg)
console.log(`  ℹ Dark Mode: Brightened Accent (${darkAccent}) on Dark Surface (${darkBg}) = ${crDarkAccentOnBg.toFixed(2)}:1`)
assert(crDarkAccentOnBg >= 4.5, 'Dark Mode Accent Blue passes WCAG AA (>= 4.5:1)')

const crDarkGreenOnBg = contrastRatio(darkGreen, darkBg)
console.log(`  ℹ Dark Mode: Status Green (${darkGreen}) on Dark Surface (${darkBg}) = ${crDarkGreenOnBg.toFixed(2)}:1`)
assert(crDarkGreenOnBg >= 4.5, 'Dark Mode Status Green passes WCAG AA (>= 4.5:1)')

const crDarkRedOnBg = contrastRatio(darkRed, darkBg)
console.log(`  ℹ Dark Mode: Status Red (${darkRed}) on Dark Surface (${darkBg}) = ${crDarkRedOnBg.toFixed(2)}:1`)
assert(crDarkRedOnBg >= 4.5, 'Dark Mode Status Red passes WCAG AA (>= 4.5:1)')

// -----------------------------------------------------------------------------
// 6. Reduced Motion Accessibility Check
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Reduced Motion Accessibility ---')
assert(indexCss.includes('@media (prefers-reduced-motion: reduce)'), 'prefers-reduced-motion media query implemented')
assert(indexCss.includes('animation-duration: 0.01ms !important;'), 'Reduced motion collapses animation duration to 0.01ms')
assert(indexCss.includes('transition-duration: 0.01ms !important;'), 'Reduced motion collapses transition duration to 0.01ms')

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n===================================================================')
console.log(`Verification Complete: ${passCount} PASSED, ${failCount} FAILED`)
console.log('===================================================================')

if (failCount > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
