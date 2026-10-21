export const TIER_RANGES = {
  STANDARD: {
    SMALL:  { min: 100,  max: 200,  label: 'Malá',    hint: '1–3 dny práce' },
    MEDIUM: { min: 350,  max: 700,  label: 'Střední', hint: '1–2 týdny' },
    BIG:    { min: 1200, max: 2500, label: 'Velká',   hint: '3–5 týdnů' },
    MEGA:   { min: 3500, max: 6000, label: 'Mega',    hint: '2–3 měsíce' },
  },
  YOUNG: {
    SMALL:  { min: 30,   max: 60,   label: 'Malá',    hint: '1–2 dny' },
    MEDIUM: { min: 100,  max: 200,  label: 'Střední', hint: 'asi týden' },
    BIG:    { min: 300,  max: 500,  label: 'Velká',   hint: '2–3 týdny' },
    MEGA:   { min: 800,  max: 1200, label: 'Mega',    hint: 'měsíc' },
  },
}

export function rangeFor(reward, children = []) {
  if (reward.childId) {
    const child = children.find(c => c.id === reward.childId)
    if (child?.age != null && child.age < 6) return TIER_RANGES.YOUNG
  }
  return TIER_RANGES.STANDARD
}

export function midpoint(tierRange) {
  return Math.round((tierRange.min + tierRange.max) / 2 / 10) * 10
}

export function isOutOfRange(reward, children = []) {
  if (reward.childId) {
    const child = children.find(c => c.id === reward.childId)
    if (child?.age != null && child.age < 6) return false
  }
  const ranges = rangeFor(reward, children)
  const r = ranges[reward.tier]
  if (!r) return false
  return reward.pointCost < r.min || reward.pointCost > r.max
}
