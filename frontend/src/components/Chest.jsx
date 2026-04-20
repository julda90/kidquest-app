const TIERS = {
  small:  { fill: '#cd7f32', shine: '#e8a96a', shadow: '#7a4a1a', label: 'Bronze' },
  medium: { fill: '#aaaaaa', shine: '#d8d8d8', shadow: '#666',    label: 'Silver' },
  large:  { fill: '#ffd700', shine: '#fff176', shadow: '#b8860b', label: 'Gold'   },
}

export function chestTier(pointCost) {
  if (pointCost <= 100) return 'small'
  if (pointCost <= 200) return 'medium'
  return 'large'
}

export default function Chest({ pointCost, progress = 0, unlocked = false, size = 80 }) {
  const tier   = chestTier(pointCost)
  const colors = TIERS[tier]
  const pct    = Math.min(Math.max(progress, 0), 1)

  // clip path fills from bottom
  const clipId   = `clip-${tier}-${Math.random().toString(36).slice(2)}`
  const fillHeight = 54 * pct
  const fillY      = 100 - fillHeight

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={clipId}>
          <rect x="10" y={fillY} width="80" height={fillHeight} />
        </clipPath>
      </defs>

      {/* Body */}
      <rect x="10" y="46" width="80" height="48" rx="6"
        fill={unlocked ? colors.fill : '#ccc'} />

      {/* Fill level */}
      {pct > 0 && (
        <rect x="10" y="46" width="80" height="48" rx="6"
          fill={colors.fill} clipPath={`url(#${clipId})`} opacity="0.9" />
      )}

      {/* Body shine */}
      <rect x="14" y="50" width="30" height="8" rx="3"
        fill={unlocked ? colors.shine : '#e0e0e0'} opacity="0.6" />

      {/* Lid */}
      <rect x="8" y="30" width="84" height="20" rx="6"
        fill={unlocked ? colors.fill : '#bbb'} />
      <rect x="12" y="33" width="35" height="7" rx="3"
        fill={unlocked ? colors.shine : '#d5d5d5'} opacity="0.7" />

      {/* Hinge band */}
      <rect x="10" y="44" width="80" height="6" rx="2"
        fill={unlocked ? colors.shadow : '#999'} />

      {/* Lock */}
      <rect x="42" y="36" width="16" height="14" rx="3"
        fill={unlocked ? colors.shadow : '#888'} />
      <circle cx="50" cy="39" r="4" fill="none"
        stroke={unlocked ? colors.shine : '#bbb'} strokeWidth="2.5" />

      {/* Glow when unlocked */}
      {unlocked && (
        <rect x="8" y="28" width="84" height="66" rx="7"
          fill="none" stroke={colors.shine} strokeWidth="2.5" opacity="0.8" />
      )}
    </svg>
  )
}
