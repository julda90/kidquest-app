import { apiFetch } from './client'

export const getChildren    = (familyId)         => apiFetch(`/api/children/family/${familyId}`)
export const createChild    = (familyId, data)   => apiFetch(`/api/children/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateChild    = (childId,  data)   => apiFetch(`/api/children/${childId}`,         { method: 'PUT',  body: JSON.stringify(data) })
export const deleteChild    = (childId)          => apiFetch(`/api/children/${childId}`,         { method: 'DELETE' })
export const getProgress    = (childId)          => apiFetch(`/api/children/${childId}/progress`)
export const openChest      = (childId)          => apiFetch(`/api/children/${childId}/chest/open`, { method: 'POST' })
export const updateAppearance = (childId, body) => apiFetch(`/api/children/${childId}/appearance`, { method: 'PUT', body: JSON.stringify(body) })
export const getEarningRate = (familyId, days = 14) => apiFetch(`/api/children/family/${familyId}/earning-rate?days=${days}`)
