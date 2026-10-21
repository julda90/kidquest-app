import { apiFetch } from './client'

export const getRewards      = (familyId, { includeArchived = false } = {}) =>
  apiFetch(`/api/rewards/family/${familyId}?includeArchived=${includeArchived}`)
export const getRewardStats  = (familyId) => apiFetch(`/api/rewards/family/${familyId}/stats`)
export const createReward    = (familyId, data)  => apiFetch(`/api/rewards/family/${familyId}`, { method: 'POST', body: JSON.stringify(data) })
export const updateReward    = (rewardId, data)  => apiFetch(`/api/rewards/${rewardId}`,        { method: 'PUT',  body: JSON.stringify(data) })
export const deleteReward    = (rewardId)        => apiFetch(`/api/rewards/${rewardId}`,        { method: 'DELETE' })
export const archiveReward   = (rewardId)        => apiFetch(`/api/rewards/${rewardId}/archive`, { method: 'POST' })
export const restoreReward   = (rewardId)        => apiFetch(`/api/rewards/${rewardId}/restore`, { method: 'POST' })
