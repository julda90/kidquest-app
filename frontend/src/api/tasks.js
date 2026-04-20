import { apiFetch } from './client'

export const getTasksByFamily = (familyId) => apiFetch(`/api/tasks/family/${familyId}`)
export const getTasksByChild  = (childId)  => apiFetch(`/api/tasks/child/${childId}`)
export const createTask       = (familyId, data) => apiFetch(`/api/tasks/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateTask       = (taskId,   data) => apiFetch(`/api/tasks/${taskId}`,           { method: 'PUT',  body: JSON.stringify(data) })
export const deleteTask       = (taskId)         => apiFetch(`/api/tasks/${taskId}`,           { method: 'DELETE' })
