import { apiFetch } from './client'

export const getRoutines    = (familyId)        => apiFetch(`/api/routines?familyId=${familyId}`)
export const createRoutine  = (familyId, data)  => apiFetch(`/api/routines?familyId=${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateRoutine  = (routineId, data) => apiFetch(`/api/routines/${routineId}`,          { method: 'PUT',  body: JSON.stringify(data) })
export const deleteRoutine  = (routineId)       => apiFetch(`/api/routines/${routineId}`,          { method: 'DELETE' })
