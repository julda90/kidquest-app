import { useState } from 'react'
import f from './Form.module.css'

const STATUSES = ['UNASSIGNED', 'ASSIGNED', 'PENDING_APPROVAL', 'COMPLETED', 'REJECTED']
const STATUS_LABEL = { UNASSIGNED: 'Unassigned', ASSIGNED: 'Assigned', PENDING_APPROVAL: 'Pending Approval', COMPLETED: 'Completed', REJECTED: 'Rejected' }

export default function TaskForm({ initial = {}, children = [], families = [], onSubmit, onCancel }) {
  const [title,      setTitle]      = useState(initial.title      ?? '')
  const [desc,       setDesc]       = useState(initial.description ?? '')
  const [points,     setPoints]     = useState(initial.pointValue  ?? '')
  const [dueDate,    setDueDate]    = useState(initial.dueDate     ?? '')
  const [status,     setStatus]     = useState(initial.status      ?? 'UNASSIGNED')
  const [assignedTo, setAssignedTo] = useState(initial.assignedTo  ?? '')
  const [familyId,   setFamilyId]   = useState(initial.familyId   ?? (families[0]?.id ?? ''))
  const [errors,      setErrors]      = useState({})
  const [serverError, setServerError] = useState('')
  const [loading,     setLoading]     = useState(false)

  function validate() {
    const e = {}
    if (!title.trim())            e.title    = 'Title is required.'
    if (!points || Number(points) < 1) e.points = 'Must be at least 1.'
    if (!familyId)                e.familyId = 'Please select a family.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({
        familyId,
        title: title.trim(),
        description: desc.trim() || null,
        pointValue: Number(points),
        dueDate: dueDate || null,
        status,
        assignedToId: assignedTo || null,
      })
    } catch (err) {
      setServerError(err.message || 'Failed to save task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={f.serverError}>{serverError}</div>}
      <div className={f.group}>
        <label>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className={errors.title ? f.inputError : ''} placeholder="Clean your room" />
        {errors.title && <span className={f.fieldError}>{errors.title}</span>}
      </div>

      <div className={f.group}>
        <label>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details…" />
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

      <div className={f.row}>
        <div className={f.group}>
          <label>Points *</label>
          <input type="number" min="1" value={points} onChange={e => setPoints(e.target.value)}
            className={errors.points ? f.inputError : ''} placeholder="10" />
          {errors.points && <span className={f.fieldError}>{errors.points}</span>}
        </div>
        <div className={f.group}>
          <label>Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className={f.row}>
        <div className={f.group}>
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div className={f.group}>
          <label>Assign To</label>
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
            <option value="">— Unassigned —</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}
