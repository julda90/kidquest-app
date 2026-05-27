import { useState } from 'react'
import f from './Form.module.css'

export default function RewardForm({ initial = {}, families = [], onSubmit, onCancel }) {
  const [name,     setName]     = useState(initial.name        ?? '')
  const [desc,     setDesc]     = useState(initial.description ?? '')
  const [cost,     setCost]     = useState(initial.pointCost   ?? '')
  const [active,   setActive]   = useState(initial.active      ?? true)
  const [familyId, setFamilyId] = useState(initial.familyId   ?? (families[0]?.id ?? ''))
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required.'
    if (!cost || Number(cost) < 1) e.cost = 'Must be at least 1.'
    if (!familyId) e.familyId = 'Please select a family.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({ familyId, name: name.trim(), description: desc.trim() || null, pointCost: Number(cost), active })
    } catch (err) {
      setServerError(err.message || 'Failed to save reward.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={f.serverError}>{serverError}</div>}
      {!initial.familyId && families.length > 0 && (
        <div className={f.group}>
          <label>Family *</label>
          <select value={familyId} onChange={e => setFamilyId(e.target.value)}
            className={errors.familyId ? f.inputError : ''}>
            <option value="">— Select a family —</option>
            {families.map(fam => (
              <option key={fam.id} value={fam.id}>{fam.name}</option>
            ))}
          </select>
          {errors.familyId && <span className={f.fieldError}>{errors.familyId}</span>}
        </div>
      )}

      <div className={f.group}>
        <label>Name *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className={errors.name ? f.inputError : ''} placeholder="Extra screen time" />
        {errors.name && <span className={f.fieldError}>{errors.name}</span>}
      </div>

      <div className={f.group}>
        <label>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details…" />
      </div>

      <div className={f.group}>
        <label>Point Cost *</label>
        <input type="number" min="1" value={cost} onChange={e => setCost(e.target.value)}
          className={errors.cost ? f.inputError : ''} placeholder="50" />
        {errors.cost && <span className={f.fieldError}>{errors.cost}</span>}
      </div>

      <div className={f.group}>
        <label className={f.checkRow}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          Active (visible to children)
        </label>
      </div>

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Save Reward'}
        </button>
      </div>
    </form>
  )
}
