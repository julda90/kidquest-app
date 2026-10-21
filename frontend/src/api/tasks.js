import { apiFetch } from './client'

export const getTasksByFamily = (familyId) => apiFetch(`/api/tasks/family/${familyId}`)
export const getTasksByChild  = (childId)  => apiFetch(`/api/tasks/child/${childId}`)
export const createTask       = (familyId, data) => apiFetch(`/api/tasks/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateTask       = (taskId,   data) => apiFetch(`/api/tasks/${taskId}`,           { method: 'PUT',  body: JSON.stringify(data) })
export const deleteTask       = (taskId)         => apiFetch(`/api/tasks/${taskId}`,           { method: 'DELETE' })
export const approveTask      = (taskId, bonus)  => apiFetch(`/api/tasks/${taskId}/approve`,   { method: 'POST', body: JSON.stringify({ bonus }) })
export const rejectTask       = (taskId)         => apiFetch(`/api/tasks/${taskId}/reject`,    { method: 'POST' })
export const submitTask       = (taskId)         => apiFetch(`/api/tasks/${taskId}/submit`,    { method: 'POST' })
export const getTaskKinds     = ()               => apiFetch(`/api/tasks/kinds`)
