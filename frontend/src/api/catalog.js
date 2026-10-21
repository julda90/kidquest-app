import { apiFetch } from './client'

export const getTaskCatalog   = (familyId) => apiFetch(`/api/catalog/tasks?familyId=${familyId}`)
export const getRewardCatalog = (familyId) => apiFetch(`/api/catalog/rewards?familyId=${familyId}`)
export const importCatalog    = (familyId, data) =>
  apiFetch(`/api/families/${familyId}/catalog/import`, { method: 'POST', body: JSON.stringify(data) })
