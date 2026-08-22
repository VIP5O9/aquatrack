import React from 'react'

/**
 * Carte — Composant de surface multi-niveaux Apple Fluid Glass & Emil Kowalski.
 *
 * Supporte les variantes de profondeur :
 *   - 'standard' : surface de base avec bordure optique 1px et rim-light
 *   - 'elevated' / 'elevee' : surface surélevée pour modales et popovers
 *   - 'hero' : dégradé aqua profond avec lueur luminescente
 *   - 'glass' : verre translucide avec flou optique 20px
 *   - 'doux' : fond doux pour pastilles, sélecteurs et sous-sections
 *
 * Intègre un retour tactile automatique (:active scale(0.98)) si `onClick` ou `interactive` est fourni.
 */
export default function Carte({
  children,
  variante = 'standard',
  interactive = false,
  onClick,
  as,
  className = '',
  style = {},
  ...props
}) {
  const isClickable = Boolean(onClick || interactive)
  const Component = as || (onClick ? 'button' : 'div')

  // Définition des classes de variante
  let variantClass = 'carte'
  let variantStyle = {}

  switch (variante) {
    case 'elevated':
    case 'elevee':
      variantClass = 'carte-elevated'
      variantStyle = {
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-elevated), var(--ombre-elevated)',
      }
      break

    case 'hero':
      variantClass = 'carte-hero'
      variantStyle = {
        background: 'var(--hero-gradient)',
        color: 'var(--sur-hero)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.30), var(--ombre-flottant), var(--lueur-hero)',
      }
      break

    case 'glass':
      variantClass = 'effet-verre'
      variantStyle = {
        background: 'var(--glass-material)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light), var(--ombre-carte)',
      }
      break

    case 'doux':
      variantClass = 'carte-doux'
      variantStyle = {
        background: 'var(--surface-doux)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light-subtle)',
      }
      break

    case 'standard':
    default:
      variantClass = 'carte'
      variantStyle = {
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--rim-light), var(--ombre-carte)',
      }
      break
  }

  const combinedClasses = [
    'rounded-[24px] p-5 transition-all duration-150',
    variantClass,
    isClickable ? 'tactile-press cursor-pointer select-none active:scale-[0.98]' : '',
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
      {children}
    </Component>
  )
}
