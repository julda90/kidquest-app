const modules = import.meta.glob('./avatars/*.png', { eager: true })

export const AVATARS = Object.entries(modules).map(([path, mod]) => ({
  id: path.split('/').pop().replace('.png', ''),
  src: mod.default,
}))

export function getAvatarSrc(id) {
  return AVATARS.find(a => a.id === id)?.src ?? null
}
