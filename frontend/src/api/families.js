import { apiFetch } from './client'

export const getFamilies   = ()                     => apiFetch('/api/families')
export const createFamily  = (data)                 => apiFetch('/api/families',           { method: 'POST', body: JSON.stringify(data) })
export const updateFamily  = (id, data)             => apiFetch(`/api/families/${id}`,     { method: 'PUT',  body: JSON.stringify(data) })
export const deleteFamily  = (id)                   => apiFetch(`/api/families/${id}`,     { method: 'DELETE' })
export const getActiveGoal = (familyId)             => apiFetch(`/api/families/${familyId}/goal`)
export const createGoal    = (familyId, data)       => apiFetch(`/api/families/${familyId}/goal`, { method: 'POST', body: JSON.stringify(data) })
export const cancelGoal    = (familyId, goalId)     => apiFetch(`/api/families/${familyId}/goal/${goalId}/cancel`, { method: 'POST' })
