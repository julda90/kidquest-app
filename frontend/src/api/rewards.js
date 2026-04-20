import { apiFetch } from './client'

export const getRewards   = (familyId)        => apiFetch(`/api/rewards/family/${familyId}`)
export const createReward = (familyId, data)  => apiFetch(`/api/rewards/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateReward = (rewardId, data)  => apiFetch(`/api/rewards/${rewardId}`,        { method: 'PUT',  body: JSON.stringify(data) })
export const deleteReward = (rewardId)        => apiFetch(`/api/rewards/${rewardId}`,        { method: 'DELETE' })
