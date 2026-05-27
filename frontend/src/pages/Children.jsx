import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren, createChild, updateChild, deleteChild } from '../api/children'
import { getTasksByFamily } from '../api/tasks'
import { getFamilies } from '../api/families'
import { getTransactionsByChild, createPointTransaction } from '../api/pointTransactions'
import { getAvatarSrc } from '../constants/avatars'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ChildForm from '../components/ChildForm'
import styles from './Children.module.css'

const STATUS_LABEL = {
  UNASSIGNED: 'Unassigned', ASSIGNED: 'Assigned',
  PENDING_APPROVAL: 'Pending', COMPLETED: 'Done', REJECTED: 'Rejected',
}
const STATUS_DOT = {
  UNASSIGNED: styles.dotGray, ASSIGNED: styles.dotBlue,
  PENDING_APPROVAL: styles.dotOrange, COMPLETED: styles.dotGreen, REJECTED: styles.dotRed,
}

export default function Children() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [familyId,  setFamilyId]  = useState('')
  const [families,  setFamilies]  = useState([])
  const [children,  setChildren]  = useState([])
  const [tasks,     setTasks]     = useState([])
  const [points,    setPoints]    = useState({})
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [modal,         setModal]         = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [adjustTarget,  setAdjustTarget]  = useState(null) // child object
  const [adjustAmount,  setAdjustAmount]  = useState('')
  const [adjustReason,  setAdjustReason]  = useState('')
  const [adjusting,     setAdjusting]     = useState(false)
  const [adjustError,   setAdjustError]   = useState('')

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setFamilies(fams)
      const fId = me.familyId || localStorage.getItem('activeFamilyId')
      if (fId) {
        setFamilyId(fId)
        const [ch, tk] = await Promise.all([getChildren(fId), getTasksByFamily(fId)])
        setChildren(ch)
        setTasks(tk)
        const txResults = await Promise.all(ch.map(c => getTransactionsByChild(c.id)))
        const totals = {}
        ch.forEach((c, i) => { totals[c.id] = txResults[i].reduce((s, tx) => s + tx.amount, 0) })
        setPoints(totals)
      }
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function refetch(fId) {
    const [ch, tk] = await Promise.all([getChildren(fId), getTasksByFamily(fId)])
    setChildren(ch)
    setTasks(tk)
    const txResults = await Promise.all(ch.map(c => getTransactionsByChild(c.id)))
    const totals = {}
    ch.forEach((c, i) => { totals[c.id] = txResults[i].reduce((s, tx) => s + tx.amount, 0) })
    setPoints(totals)
  }

  async function handleSave({ familyId: selFamilyId, ...data }) {
    if (modal.item) {
      await updateChild(modal.item.id, data)
      await refetch(modal.item.familyId || familyId)
    } else {
      await createChild(selFamilyId, data)
      await refetch(selFamilyId || familyId)
    }
    setModal(null)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteChild(deleteTarget.id)
      setDeleteTarget(null)
      await refetch(familyId)
    } catch { setDeleteTarget(null) } finally { setDeleting(false) }
  }

  function openAdjust(child) {
    setAdjustTarget(child)
    setAdjustAmount('')
    setAdjustReason('')
    setAdjustError('')
  }

  async function handleAdjustSubmit(e) {
    e.preventDefault()
    const amt = Number(adjustAmount)
    if (!adjustAmount || isNaN(amt) || amt === 0) {
      setAdjustError('Enter a non-zero amount.')
      return
    }
    setAdjusting(true)
    setAdjustError('')
    try {
      await createPointTransaction(adjustTarget.id, {
        amount: amt,
        reason: adjustReason.trim() || (amt > 0 ? 'Points added manually' : 'Points deducted manually'),
      })
      setAdjustTarget(null)
      await refetch(familyId)
    } catch (err) {
      setAdjustError(err.message || 'Failed to adjust points.')
    } finally {
      setAdjusting(false)
    }
  }

  function handleLogout() { logout(); navigate('/login') }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="children" onLogout={handleLogout} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Children</h1>
            <p className={styles.subtitle}>View and manage children in your family.</p>
          </div>
          <button className={styles.btnAdd} onClick={() => setModal({ item: null })}>+ Add Child</button>
        </header>

        {children.length === 0
          ? <p className={styles.empty}>No children added yet.</p>
          : <div className={styles.grid}>
              {children.map(child => {
                const avatarSrc  = getAvatarSrc(child.avatar)
                const childTasks = tasks.filter(t => t.assignedTo === child.id)
                const done       = childTasks.filter(t => t.status === 'COMPLETED').length
                const total      = points[child.id] ?? 0
                const pct        = childTasks.length ? Math.round((done / childTasks.length) * 100) : 0

                return (
                  <div key={child.id} className={styles.card}>
                    <div className={styles.cardActions}>
                      <button className={styles.iconBtn} title="Edit"
                        onClick={() => setModal({ item: child })}>✏️</button>
                      <button className={styles.iconBtn} title="Delete"
                        onClick={() => setDeleteTarget({ id: child.id, name: child.name })}>🗑️</button>
                    </div>

                    <div className={styles.avatarWrap}>
                      {avatarSrc
                        ? <img src={avatarSrc} alt={child.name} className={styles.avatar} />
                        : <span className={styles.avatarEmoji}>👤</span>
                      }
                    </div>

                    <div className={styles.childName}>{child.name}</div>
                    <div className={styles.childAge}>Age {child.age}</div>

                    <div className={styles.pointsRow}>
                      <div className={styles.pointsBadge}>
                        <span className={styles.ptsValue}>{total}</span>
                        <span className={styles.ptsLabel}> pts</span>
                      </div>
                      <button className={styles.adjustBtn} title="Adjust points"
                        onClick={() => openAdjust(child)}>± pts</button>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressLabel}>{done} / {childTasks.length} tasks completed</div>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {childTasks.length > 0 && (
                      <div className={styles.taskList}>
                        {childTasks.slice(0, 5).map(task => (
                          <div key={task.taskId} className={styles.taskRow}>
                            <span className={styles.taskTitle}>{task.title}</span>
                            <span className={`${styles.statusDot} ${STATUS_DOT[task.status]}`}
                              title={STATUS_LABEL[task.status]} />
                          </div>
                        ))}
                        {childTasks.length > 5 && (
                          <div className={styles.moreLabel}>+{childTasks.length - 5} more tasks</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
        }
      </main>

      {modal && (
        <Modal title={modal.item ? 'Edit Child' : 'New Child'} onClose={() => setModal(null)}>
          <ChildForm initial={modal.item ?? {}} families={families}
            onSubmit={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting} />
      )}

      {adjustTarget && (
        <Modal title={`Adjust Points — ${adjustTarget.name}`} onClose={() => setAdjustTarget(null)}>
          <form onSubmit={handleAdjustSubmit} noValidate>
            {adjustError && <p className={styles.adjustErr}>{adjustError}</p>}
            <div className={styles.adjustField}>
              <label>Amount <span className={styles.adjustHint}>(use – to deduct)</span></label>
              <input
                type="number"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="e.g. 10 or -5"
                autoFocus
              />
            </div>
            <div className={styles.adjustField}>
              <label>Reason <span className={styles.adjustHint}>(optional)</span></label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="Bonus for helping out…"
              />
            </div>
            {adjustAmount && Number(adjustAmount) !== 0 && (
              <p className={styles.adjustPreview}>
                {Number(adjustAmount) > 0 ? '➕' : '➖'} {Math.abs(Number(adjustAmount))} pts will be{' '}
                {Number(adjustAmount) > 0 ? 'added to' : 'deducted from'} {adjustTarget.name}'s total.
              </p>
            )}
            <div className={styles.adjustActions}>
              <button type="button" className={styles.adjustCancel}
                onClick={() => setAdjustTarget(null)}>Cancel</button>
              <button type="submit" className={styles.adjustSubmit} disabled={adjusting}>
                {adjusting ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
