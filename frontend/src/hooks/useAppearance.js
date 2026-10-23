import { getLevels } from '../constants/themes'

export function useAppearance(child, progress) {
  if (!child || !progress) return { avatarSrc: null, landscapeSrc: null, thumbSrc: null, title: '', level: 1 }

  const currentLevel = progress.level ?? 1
  const avatarLevel  = Math.min(progress.selectedAvatarLevel ?? currentLevel, currentLevel)
  const landscapeLevel = Math.min(progress.selectedLandscapeLevel ?? currentLevel, currentLevel)

  const levels = getLevels(child.avatar)
  const avatarData    = levels[Math.min(avatarLevel, levels.length) - 1]    ?? levels[0]
  const landscapeData = levels[Math.min(landscapeLevel, levels.length) - 1] ?? levels[0]

  // Fall back to the nearest lower level that actually has an image asset
  function nearestSrc(data, idx, key) {
    if (data?.[key]) return data[key]
    for (let i = idx - 1; i >= 0; i--) {
      if (levels[i]?.[key]) return levels[i][key]
    }
    return null
  }
  const avIdx  = Math.min(avatarLevel, levels.length) - 1
  const laIdx  = Math.min(landscapeLevel, levels.length) - 1

  return {
    title:        avatarData?.title ?? '',
    level:        currentLevel,
    avatarLevel,
    landscapeLevel,
    avatarSrc:    nearestSrc(avatarData,    avIdx, 'avatar'),
    landscapeSrc: nearestSrc(landscapeData, laIdx, 'landscape'),
    thumbSrc:     nearestSrc(landscapeData, laIdx, 'thumb'),
  }
}
