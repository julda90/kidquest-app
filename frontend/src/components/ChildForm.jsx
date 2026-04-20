import { useState } from 'react'
import f from './Form.module.css'
import { AVATARS } from '../constants/avatars'

export default function ChildForm({ initial = {}, families = [], onSubmit, onCancel }) {
  const [name,        setName]        = useState(initial.name     ?? '')
  const [age,         setAge]         = useState(initial.age      ?? '')
  const [avatar,      setAvatar]      = useState(initial.avatar   ?? (AVATARS[0]?.id ?? ''))
  const [familyId,    setFamilyId]    = useState(initial.familyId ?? (families[0]?.id ?? ''))
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  function validate() {
    const e = {}
    if (!name.trim())            e.name     = 'Name is required.'
    if (!age || Number(age) < 1) e.age      = 'Must be at least 1.'
    if (!familyId)               e.familyId = 'Please select a family.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), age: Number(age), avatar, familyId })
    } catch (err) {
      setServerError(err.message || 'Failed to save child.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={f.serverError}>{serverError}</div>}

      <div className={f.group}>
        <label>Name *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className={errors.name ? f.inputError : ''} placeholder="Emma" />
        {errors.name && <span className={f.fieldError}>{errors.name}</span>}
      </div>

      <div className={f.group}>
        <label>Age *</label>
        <input type="number" min="1" max="18" value={age} onChange={e => setAge(e.target.value)}
          className={errors.age ? f.inputError : ''} placeholder="8" />
        {errors.age && <span className={f.fieldError}>{errors.age}</span>}
      </div>

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

      <div className={f.group}>
        <label>Avatar</label>
        {AVATARS.length === 0
          ? <p className={f.avatarEmpty}>No avatars yet — add PNG files to <code>src/constants/avatars/</code>.</p>
          : <div className={f.avatarGrid}>
              {AVATARS.map(a => (
                <button key={a.id} type="button"
                  className={`${f.avatarOption} ${avatar === a.id ? f.avatarSelected : ''}`}
                  onClick={() => setAvatar(a.id)}
                  title={a.id}>
                  <img src={a.src} alt={a.id} className={f.avatarImg} />
                </button>
              ))}
            </div>
        }
      </div>

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Save Child'}
        </button>
      </div>
    </form>
  )
}
