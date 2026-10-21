import { getLevels } from '../constants/themes'

export function useAppearance(child, progress) {
  if (!child || !progress) return { avatarSrc: null, landscapeSrc: null, thumbSrc: null, title: '', level: 1 }

  const currentLevel = progress.level ?? 1
  const avatarLevel  = Math.min(progress.selectedAvatarLevel ?? currentLevel, currentLevel)
  const landscapeLevel = Math.min(progress.selectedLandscapeLevel ?? currentLevel, currentLevel)

  const levels = getLevels(child.avatar)
  const avatarData    = levels[Math.min(avatarLevel, levels.length) - 1]    ?? levels[0]
  const landscapeData = levels[Math.min(landscapeLevel, levels.length) - 1] ?? levels[0]

  return {
    title:        avatarData?.title ?? '',
    level:        currentLevel,
    avatarLevel,
    landscapeLevel,
    avatarSrc:    avatarData?.avatar    ?? null,
    landscapeSrc: landscapeData?.landscape ?? null,
    thumbSrc:     landscapeData?.thumb  ?? null,
  }
}
