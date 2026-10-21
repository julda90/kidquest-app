import { useState } from 'react'
import f from './Form.module.css'

const TIER_OPTIONS = ['SMALL', 'MEDIUM', 'BIG', 'MEGA']
const TIER_LABELS  = { SMALL: 'Malá (50)', MEDIUM: 'Střední (150)', BIG: 'Velká (300)', MEGA: 'Mega (600)' }
const TIER_PRICES  = { SMALL: 50, MEDIUM: 150, BIG: 300, MEGA: 600 }

const ICON_OPTIONS = ['🍦','🍫','🍕','🎬','🎮','🧗','🎳','🧩','🧱','📚','🎨','🚲','🏊','🎡','🐴','🍰','🧸','⚽','🎟️','🌙','🎪','🛁','☕','🥐']

export default function RewardForm({ initial = {}, familyId, children = [], onSubmit, onCancel }) {
  const [name,    setName]    = useState(initial.name        ?? '')
  const [desc,    setDesc]    = useState(initial.description ?? '')
  const [cost,    setCost]    = useState(initial.pointCost   ?? TIER_PRICES.SMALL)
  const [active,  setActive]  = useState(initial.active      ?? true)
  const [tier,    setTier]    = useState(initial.tier        ?? 'SMALL')
  const [icon,    setIcon]    = useState(initial.icon        ?? '')
  const [childId, setChildId] = useState(initial.childId     ?? '')
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  function handleTierChange(t) {
    setTier(t)
    if (!initial.id) setCost(TIER_PRICES[t])
  }

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Název je povinný.'
    if (!cost || Number(cost) < 1) e.cost = 'Musí být alespoň 1.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({
        familyId: familyId || initial.familyId,
        name: name.trim(),
        description: desc.trim() || null,
        pointCost: Number(cost),
        active,
        tier,
        icon: icon.trim() || null,
        childId: childId || null,
      })
    } catch (err) {
      setServerError(err.message || 'Nepodařilo se uložit odměnu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={f.serverError}>{serverError}</div>}

      <div className={f.group}>
        <label>Název *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className={errors.name ? f.inputError : ''} placeholder="Zmrzlina" />
        {errors.name && <span className={f.fieldError}>{errors.name}</span>}
      </div>

      <div className={f.group}>
        <label>Popis</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Volitelný popis…" />
      </div>

      <div className={f.row}>
        <div className={f.group}>
          <label>Tier</label>
          <select value={tier} onChange={e => handleTierChange(e.target.value)}>
            {TIER_OPTIONS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
          </select>
        </div>
        <div className={f.group}>
          <label>Cena (body) *</label>
          <input type="number" min="1" value={cost} onChange={e => setCost(e.target.value)}
            className={errors.cost ? f.inputError : ''} placeholder="50" />
          {errors.cost && <span className={f.fieldError}>{errors.cost}</span>}
        </div>
      </div>

      {children.length > 0 && (
        <div className={f.group}>
          <label>Dítě (pro konkrétní dítě nebo pro všechny)</label>
          <select value={childId} onChange={e => setChildId(e.target.value)}>
            <option value="">— Pro všechny —</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className={f.group}>
        <label>Ikona</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
          {ICON_OPTIONS.map(e => (
            <button key={e} type="button"
              onClick={() => setIcon(icon === e ? '' : e)}
              style={{ fontSize: '20px', padding: '4px 6px', borderRadius: '6px',
                border: icon === e ? '2px solid #667eea' : '2px solid #e0e0f0',
                background: icon === e ? '#f0f0ff' : '#fff', cursor: 'pointer' }}>
              {e}
            </button>
          ))}
        </div>
        <input value={icon} onChange={e => setIcon(e.target.value)}
          placeholder="nebo vlastní emoji…" maxLength={8}
          style={{ width: '100%', fontSize: '18px', border: '1.5px solid #e0e0f0', borderRadius: '8px', padding: '6px 10px' }} />
      </div>

      <div className={f.group}>
        <label className={f.checkRow}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          Aktivní (viditelné pro děti)
        </label>
      </div>

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Zrušit</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Ukládám…' : 'Uložit odměnu'}
        </button>
      </div>
    </form>
  )
}
