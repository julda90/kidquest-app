import { apiFetch } from './client'

export const getChildren    = (familyId)         => apiFetch(`/api/children/family/${familyId}`)
export const createChild    = (familyId, data)   => apiFetch(`/api/children/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateChild    = (childId,  data)   => apiFetch(`/api/children/${childId}`,         { method: 'PUT',  body: JSON.stringify(data) })
export const deleteChild    = (childId)          => apiFetch(`/api/children/${childId}`,         { method: 'DELETE' })
export const getProgress    = (childId)          => apiFetch(`/api/children/${childId}/progress`)
export const openChest      = (childId)          => apiFetch(`/api/children/${childId}/chest/open`, { method: 'POST' })
export const updateSkin     = (childId, skin)    => apiFetch(`/api/children/${childId}/skin`,       { method: 'PUT',  body: JSON.stringify({ skin }) })
