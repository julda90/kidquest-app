export { MINECRAFT_LEVELS } from './minecraft'
export { FROZEN_LEVELS } from './frozen'
export { UNICORN_LEVELS } from './unicorn'
export { RACER_LEVELS } from './racer'

import { MINECRAFT_LEVELS } from './minecraft'
import { FROZEN_LEVELS } from './frozen'
import { UNICORN_LEVELS } from './unicorn'
import { RACER_LEVELS } from './racer'

export function getLevels(avatar) {
  switch (avatar) {
    case 'minecraft':  return MINECRAFT_LEVELS
    case 'elsa':       return FROZEN_LEVELS
    case 'unicorn':    return UNICORN_LEVELS
    default:           return MINECRAFT_LEVELS
  }
}

export function getLevelData(avatar, level) {
  const levels = getLevels(avatar)
  return levels[Math.min(Math.max(level, 1), levels.length) - 1] ?? levels[0]
}
