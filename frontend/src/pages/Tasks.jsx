import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getTasksByFamily, createTask, updateTask, deleteTask, approveTask, rejectTask } from '../api/tasks'
import { getFamilies } from '../api/families'
import { getAvatarSrc } from '../constants/avatars'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import TaskForm from '../components/TaskForm'
import styles from './Tasks.module.css'

const STATUS_CYCLE = {
  UNASSIGNED: 'ASSIGNED', ASSIGNED: 'PENDING_APPROVAL',
  COMPLETED: 'UNASSIGNED', REJECTED: 'ASSIGNED',
}
const STATUS_LABEL = {
  UNASSIGNED: 'Unassigned', ASSIGNED: 'Assigned',
  PENDING_APPROVAL: 'Pending Approval', COMPLETED: 'Completed', REJECTED: 'Rejected',
}
const STATUS_FILTERS = ['ALL', 'UNASSIGNED', 'ASSIGNED', 'PENDING_APPROVAL', 'COMPLETED', 'REJECTED']
const FILTER_LABEL   = { ALL: 'All', ...STATUS_LABEL }

const STATUS_CLASS = {
  UNASSIGNED:       styles.sGray,
  ASSIGNED:         styles.sBlue,
  PENDING_APPROVAL: styles.sOrange,
  COMPLETED:        styles.sGreen,
  REJECTED:         styles.sRed,
}

export default function Tasks() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [familyId,     setFamilyId]     = useState('')
  const [families,     setFamilies]     = useState([])
  const [children,     setChildren]     = useState([])
  const [tasks,        setTasks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [childFilter,  setChildFilter]  = useState('')
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [awardTarget,  setAwardTarget]  = useState(null) // { task, child }
  const [awarding,     setAwarding]     = useState(false)
  const [hwOnTime,     setHwOnTime]     = useState(true)
  const [hwSelfChecked,setHwSelfChecked]= useState(false)
  const [hwNoReminder, setHwNoReminder] = useState(false)
  const [awardToast,   setAwardToast]   = useState(null)

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setFamilies(fams)
      const fId = me.familyId || localStorage.getItem('activeFamilyId')
      if (!fId) {
        console.warn('[KidQuest] No familyId on user and no activeFamilyId in localStorage — tasks will not load. User id:', me.id, 'email:', me.email)
        setError('Your account is not linked to a family. Please contact support or re-create your family.')
        return
      }
      setFamilyId(fId)
      const [ch, tk] = await Promise.all([getChildren(fId), getTasksByFamily(fId)])
      setChildren(ch)
      setTasks(tk)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function refetch(fId) {
    const [ch, tk] = await Promise.all([getChildren(fId), getTasksByFamily(fId)])
    setChildren(ch)
    setTasks(tk)
  }

  async function handleSave({ familyId: selFamilyId, ...data }) {
    if (modal.item) {
      await updateTask(modal.item.taskId, data)
    } else {
      await createTask(selFamilyId, data)
    }
    setModal(null)
    await refetch(selFamilyId || familyId)
  }

  async function applyStatusUpdate(task, nextStatus) {
    await updateTask(task.taskId, {
      title: task.title, description: task.description,
      pointValue: task.pointValue, dueDate: task.dueDate,
      status: nextStatus,
      assignedToId: task.assignedTo ?? null,
    })
    await refetch(task.familyId || familyId)
  }

  function cycleStatus(task) {
    const next = STATUS_CYCLE[task.status]
    if (next === 'COMPLETED' && task.assignedTo) {
      setAwardTarget({ task, child: childMap[task.assignedTo] })
    } else {
      applyStatusUpdate(task, next)
    }
  }

  async function handleAwardConfirm() {
    const { task } = awardTarget
    setAwarding(true)
    const isHw = task.kind === 'HOMEWORK'
    try {
      const result = await approveTask(task.taskId, {
        onTime:      isHw ? hwOnTime      : true,
        selfChecked: isHw ? hwSelfChecked : false,
        noReminder:  isHw ? hwNoReminder  : false,
      })
      setAwardTarget(null)
      setHwOnTime(true); setHwSelfChecked(false); setHwNoReminder(false)
      const parts = [`⭐ +${result.awardedPoints} bodů`]
      if (result.levelUp) parts.push(`🆙 Nová úroveň ${result.newLevel}!`)
      if (result.streakDays > 1) parts.push(`🔥 Série ${result.streakDays} dní`)
      if (result.newBadges?.length) parts.push(`🏅 Nový odznak!`)
      if (result.goalReached) parts.push(`🎯 Rodinný cíl splněn!`)
      setAwardToast(parts.join(' · '))
      setTimeout(() => setAwardToast(null), 5000)
      await refetch(task.familyId || familyId)
    } catch { setAwardTarget(null) }
    finally { setAwarding(false) }
  }

  async function handleRejectTask(task) {
    try {
      await rejectTask(task.taskId)
      await refetch(task.familyId || familyId)
    } catch { /* ignore */ }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTask(deleteTarget.id)
      setDeleteTarget(null)
      await refetch(familyId)
    } catch { setDeleteTarget(null) } finally { setDeleting(false) }
  }

  function handleLogout() { logout(); navigate('/login') }

  const childMap = Object.fromEntries(children.map(c => [c.id, c]))

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
    if (childFilter && t.assignedTo !== childFilter) return false
    return true
  })

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="tasks" onLogout={handleLogout} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Tasks</h1>
            <p className={styles.subtitle}>Manage and track tasks for your family.</p>
          </div>
          <button className={styles.btnAdd} onClick={() => setModal({ item: null })}>+ Add Task</button>
        </header>

        <div className={styles.filters}>
          <div className={styles.tabs}>
            {STATUS_FILTERS.map(s => (
              <button key={s}
                className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}
                onClick={() => setStatusFilter(s)}>
                {FILTER_LABEL[s]}
              </button>
            ))}
          </div>
          <select className={styles.childSelect} value={childFilter}
            onChange={e => setChildFilter(e.target.value)}>
            <option value="">All children</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {filtered.length === 0
          ? <p className={styles.empty}>No tasks match the current filter.</p>
          : <div className={styles.taskList}>
              {filtered.map(task => {
                const child     = childMap[task.assignedTo]
                const avatarSrc = child ? getAvatarSrc(child.avatar) : null
                return (
                  <div key={task.taskId} className={styles.taskCard}>
                    <div className={styles.assignee}>
                      {child
                        ? <>{avatarSrc
                            ? <img src={avatarSrc} alt={child.name} className={styles.assigneeAvatar} />
                            : <span className={styles.assigneeEmoji}>👤</span>}
                          <span className={styles.assigneeName}>{child.name}</span>
                        </>
                        : <span className={styles.unassigned}>—</span>
                      }
                    </div>

                    <div className={styles.taskBody}>
                      <div className={styles.taskTitle}>{task.title}</div>
                      {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                      <div className={styles.taskMeta}>
                        <span className={styles.pts}>⭐ {task.pointValue} pts</span>
                        {task.dueDate && <span className={styles.due}>📅 {task.dueDate}</span>}
                      </div>
                    </div>

                    <div className={styles.taskRight}>
                      <button
                        className={`${styles.statusBtn} ${STATUS_CLASS[task.status]}`}
                        title="Click to advance status"
                        onClick={() => cycleStatus(task)}>
                        {STATUS_LABEL[task.status]}
                      </button>
                      <div className={styles.actions}>
                        {task.status === 'PENDING_APPROVAL' && task.assignedTo && (
                          <button className={styles.awardBtn} title="Award points"
                            onClick={() => setAwardTarget({ task, child: childMap[task.assignedTo] })}>
                            ⭐ Award
                          </button>
                        )}
                        <button className={styles.iconBtn} title="Edit"
                          onClick={() => setModal({ item: task })}>✏️</button>
                        <button className={styles.iconBtn} title="Delete"
                          onClick={() => setDeleteTarget({ id: task.taskId, name: task.title })}>🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </main>

      {modal && (
        <Modal title={modal.item ? 'Edit Task' : 'New Task'} onClose={() => setModal(null)}>
          <TaskForm initial={modal.item ?? {}} children={children} families={families}
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

      {awardToast && (
        <div className={styles.toast}>{awardToast}</div>
      )}

      {awardTarget && (() => {
        const t = awardTarget.task
        const isHw = t.kind === 'HOMEWORK'
        const base = isHw ? (hwOnTime ? (t.pointValue ?? 20) : (t.latePointValue ?? t.pointValue ?? 10)) : (t.pointValue ?? 0)
        const bonus1 = isHw && hwSelfChecked && t.bonusValue > 0 ? t.bonusValue : 0
        const bonus2 = isHw && hwNoReminder && t.noReminderBonus > 0 ? t.noReminderBonus : 0
        const hwTotal = base + bonus1 + bonus2
        return (
          <Modal title="Schválit úkol" onClose={() => !awarding && setAwardTarget(null)}>
            <div className={styles.awardDialog}>
              <div className={styles.awardPtsBadge}>⭐ {isHw ? hwTotal : t.pointValue}</div>
              <p className={styles.awardMsg}>
                Označit <strong>„{t.title}"</strong> jako splněný pro{' '}
                <strong>{awardTarget.child?.name ?? 'dítě'}</strong>?
              </p>
              {isHw && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
                  <label className={styles.bonusCheck}>
                    <input type="checkbox" checked={hwOnTime} onChange={e => setHwOnTime(e.target.checked)} />
                    {' '}⏰ Včas ({hwOnTime ? t.pointValue : (t.latePointValue ?? t.pointValue)} bodů)
                  </label>
                  {t.bonusValue > 0 && (
                    <label className={styles.bonusCheck}>
                      <input type="checkbox" checked={hwSelfChecked} onChange={e => setHwSelfChecked(e.target.checked)} />
                      {' '}🔍 Sám/sama zkontroloval(a) (+{t.bonusValue})
                    </label>
                  )}
                  {t.noReminderBonus > 0 && (
                    <label className={styles.bonusCheck}>
                      <input type="checkbox" checked={hwNoReminder} onChange={e => setHwNoReminder(e.target.checked)} />
                      {' '}🏆 Bez připomínání (+{t.noReminderBonus})
                    </label>
                  )}
                </div>
              )}
              <div className={styles.awardActions}>
                <button className={styles.awardCancel} onClick={() => { setAwardTarget(null); setHwOnTime(true); setHwSelfChecked(false); setHwNoReminder(false) }} disabled={awarding}>
                  Zrušit
                </button>
                <button className={styles.awardCancel} onClick={() => { handleRejectTask(awardTarget.task); setAwardTarget(null) }} disabled={awarding}>
                  ✗ Zamítnout
                </button>
                <button className={styles.awardConfirm} onClick={handleAwardConfirm} disabled={awarding}>
                  {awarding ? 'Schvaluji…' : '✓ Schválit'}
                </button>
              </div>
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
