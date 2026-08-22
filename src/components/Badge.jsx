import React from 'react'

/**
 * Badge — Pastille & badge d'état réutilisable Apple Fluid Glass & Emil Kowalski.
 *
 * Supporte différentes variantes sémantiques et un point indicateur optionnel :
 *   - 'neutre' : surface douce discrète
 *   - 'action' : fort contraste contrasté
 *   - 'accent' : aqua luminescent avec dégradé hero
 *   - 'succes' : vert validation
 *   - 'danger' : rouge alerte
 *   - 'glass'  : matériau verre translucide
 */
export default function Badge({
  children,
  variante = 'neutre',
  taille = 'md',
  point = false,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const Component = onClick ? 'button' : 'span'

  // Variantes de style
  let variantStyle = {}
  let pointColor = ''

  switch (variante) {
    case 'action':
      variantStyle = {
        background: 'var(--action)',
        color: 'var(--sur-action)',
        boxShadow: 'var(--rim-light-subtle)',
      }
      pointColor = 'var(--sur-action)'
      break

    case 'accent':
      variantStyle = {
        background: 'var(--hero-gradient)',
        color: 'var(--sur-hero)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'var(--lueur-accent)',
      }
      pointColor = 'var(--cyan)'
      break

    case 'succes':
      variantStyle = {
        background: 'var(--vert-clair)',
        color: 'var(--vert)',
        border: '1px solid rgba(22, 163, 74, 0.25)',
      }
      pointColor = 'var(--vert)'
      break

    case 'danger':
      variantStyle = {
        background: 'var(--rouge-clair)',
        color: 'var(--rouge)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
      }
      pointColor = 'var(--rouge)'
      break

    case 'glass':
      variantStyle = {
        background: 'var(--glass-material-subtil)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-subtle)',
        color: 'var(--texte)',
      }
      pointColor = 'var(--accent)'
      break

    case 'neutre':
    default:
      variantStyle = {
        background: 'var(--surface-doux)',
        color: 'var(--texte-doux)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-subtle)',
      }
      pointColor = 'var(--texte-doux)'
      break
  }

  // Tailles
  let sizeClass = 'text-xs px-2.5 py-1 rounded-[10px]'
  let pointSize = 'size-1.5'

  if (taille === 'sm') {
    sizeClass = 'text-[11px] px-2 py-0.5 rounded-[8px]'
    pointSize = 'size-1'
  } else if (taille === 'lg') {
    sizeClass = 'text-sm px-3.5 py-1.5 rounded-[12px]'
    pointSize = 'size-2'
  }

  const combinedClasses = [
    'inline-flex items-center gap-1.5 font-medium tracking-tight select-none transition-all duration-150',
    sizeClass,
    onClick ? 'tactile-press cursor-pointer active:scale-95' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      onClick={onClick}
      className={combinedClasses}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {point && (
        <span
          className={`${pointSize} rounded-full shrink-0 animate-pulse`}
          style={{ background: pointColor }}
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  )
}
