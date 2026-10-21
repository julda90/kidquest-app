import { useState } from 'react'
import f from './Form.module.css'

const STATUSES = ['UNASSIGNED', 'ASSIGNED', 'PENDING_APPROVAL', 'COMPLETED', 'REJECTED']
const STATUS_LABEL = { UNASSIGNED: 'Unassigned', ASSIGNED: 'Assigned', PENDING_APPROVAL: 'Pending Approval', COMPLETED: 'Completed', REJECTED: 'Rejected' }

export default function TaskForm({ initial = {}, children = [], families = [], onSubmit, onCancel }) {
  const [title,           setTitle]           = useState(initial.title          ?? '')
  const [desc,            setDesc]            = useState(initial.description    ?? '')
  const [points,          setPoints]          = useState(initial.pointValue     ?? '')
  const [dueDate,         setDueDate]         = useState(initial.dueDate        ?? '')
  const [status,          setStatus]          = useState(initial.status         ?? 'UNASSIGNED')
  const [assignedTo,      setAssignedTo]      = useState(initial.assignedTo     ?? '')
  const [familyId,        setFamilyId]        = useState(initial.familyId       ?? (families[0]?.id ?? ''))
  const [kind,            setKind]            = useState(initial.kind           ?? '')
  const [bonusValue,      setBonusValue]      = useState(initial.bonusValue     ?? '')
  const [latePointValue,  setLatePointValue]  = useState(initial.latePointValue ?? '')
  const [noReminderBonus, setNoReminderBonus] = useState(initial.noReminderBonus ?? '')
  const [openQuest,       setOpenQuest]       = useState(initial.openQuest      ?? false)
  const [dailyLimit,      setDailyLimit]      = useState(initial.dailyLimit     ?? 1)
  const [errors,          setErrors]          = useState({})
  const [serverError,     setServerError]     = useState('')
  const [loading,         setLoading]         = useState(false)

  const isHomework = kind === 'HOMEWORK'

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
        kind: kind || null,
        bonusValue: bonusValue !== '' ? Number(bonusValue) : null,
        latePointValue: latePointValue !== '' ? Number(latePointValue) : null,
        noReminderBonus: noReminderBonus !== '' ? Number(noReminderBonus) : null,
        openQuest,
        dailyLimit: openQuest ? Number(dailyLimit) : 1,
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

      <div className={f.group}>
        <label>Typ úkolu</label>
        <select value={kind} onChange={e => setKind(e.target.value)}>
          <option value="">— Výchozí —</option>
          <option value="TABLE">Prostírání (TABLE)</option>
          <option value="LAUNDRY">Prádlo (LAUNDRY)</option>
          <option value="ROOM">Pokoj (ROOM)</option>
          <option value="HOMEWORK">Domácí úkol (HOMEWORK)</option>
          <option value="WOOD">Dřevo (WOOD)</option>
          <option value="KINDLING">Třísky (KINDLING)</option>
          <option value="BIG_OTHER">Velký úkol (BIG_OTHER)</option>
          <option value="OTHER">Ostatní (OTHER)</option>
        </select>
      </div>

      <div className={f.row}>
        <div className={f.group}>
          <label>Body včas *</label>
          <input type="number" min="1" value={points} onChange={e => setPoints(e.target.value)}
            className={errors.points ? f.inputError : ''} placeholder="10" />
          {errors.points && <span className={f.fieldError}>{errors.points}</span>}
        </div>
        <div className={f.group}>
          <label>Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {isHomework && (
        <div className={f.row}>
          <div className={f.group}>
            <label>Body později</label>
            <input type="number" min="1" value={latePointValue} onChange={e => setLatePointValue(e.target.value)} placeholder="10" />
          </div>
          <div className={f.group}>
            <label>Bonus Detektiv chyb</label>
            <input type="number" min="0" value={bonusValue} onChange={e => setBonusValue(e.target.value)} placeholder="15" />
          </div>
        </div>
      )}

      {isHomework && (
        <div className={f.group}>
          <label>Bonus bez připomínání</label>
          <input type="number" min="0" value={noReminderBonus} onChange={e => setNoReminderBonus(e.target.value)} placeholder="5" />
        </div>
      )}

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

      <div className={f.group}>
        <label className={f.checkRow}>
          <input type="checkbox" checked={openQuest} onChange={e => setOpenQuest(e.target.checked)} />
          Vedlejší quest (může si vzít sám/a kdokoliv z rodiny)
        </label>
      </div>

      {openQuest && (
        <div className={f.group}>
          <label>Max. vzít za den</label>
          <input type="number" min="1" max="10" value={dailyLimit}
            onChange={e => setDailyLimit(e.target.value)} style={{ width: '80px' }} />
        </div>
      )}

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Cancel</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}
