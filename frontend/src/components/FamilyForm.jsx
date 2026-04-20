import { useState } from 'react'
import f from './Form.module.css'

export default function FamilyForm({ initial = {}, onSubmit, onCancel }) {
  const [name,        setName]        = useState(initial.name ?? '')
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({ name: name.trim() })
    } catch (err) {
      setServerError(err.message || 'Failed to save family.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={f.serverError}>{serverError}</div>}
      <div className={f.group}>
        <label>Family Name *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className={errors.name ? f.inputError : ''} placeholder="The Smiths" autoFocus />
        {errors.name && <span className={f.fieldError}>{errors.name}</span>}
      </div>
      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Save Family'}
        </button>
      </div>
    </form>
  )
}
