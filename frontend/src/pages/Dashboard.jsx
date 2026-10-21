import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren, createChild, updateChild, deleteChild } from '../api/children'
import { getTasksByFamily, createTask, updateTask, deleteTask, approveTask, rejectTask } from '../api/tasks'
import { getRewards, createReward, updateReward, deleteReward } from '../api/rewards'
import { getFamilies, createFamily, updateFamily, deleteFamily, getActiveGoal, createGoal, cancelGoal } from '../api/families'
import { getRedemptionsByFamily, approveRedemption, deliverRedemption, cancelRedemption } from '../api/redemptions'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import TaskForm from '../components/TaskForm'
import ChildForm from '../components/ChildForm'
import RewardForm from '../components/RewardForm'
import FamilyForm from '../components/FamilyForm'
import { AVATARS, getAvatarSrc } from '../constants/avatars'
import styles from './Dashboard.module.css'

const STATUS_CYCLE = { UNASSIGNED: 'ASSIGNED', ASSIGNED: 'PENDING_APPROVAL', COMPLETED: 'UNASSIGNED', REJECTED: 'ASSIGNED' }
const STATUS_LABEL = { UNASSIGNED: 'Unassigned', ASSIGNED: 'Assigned', PENDING_APPROVAL: 'Pending Approval', COMPLETED: 'Completed', REJECTED: 'Rejected' }
const STATUS_CLASS = { UNASSIGNED: styles.tagGray, ASSIGNED: styles.tagBlue, PENDING_APPROVAL: styles.tagOrange, COMPLETED: styles.tagGreen, REJECTED: styles.tagRed }

function ChildAvatar({ child }) {
  const src = getAvatarSrc(child.avatar)
  if (src) return <img src={src} alt={child.name} className={styles.childAvatarImg} />
  const fallback = AVATARS[child.name.charCodeAt(0) % Math.max(AVATARS.length, 1)]
  return <span className={styles.childAvatar}>{fallback?.id ?? '👤'}</span>
}

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [user,        setUser]        = useState(null)
  const [children,    setChildren]    = useState([])
  const [tasks,       setTasks]       = useState([])
  const [rewards,     setRewards]     = useState([])
  const [families,    setFamilies]    = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [familyGoal,  setFamilyGoal]  = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [goalModal,   setGoalModal]   = useState(false)
  const [goalName,    setGoalName]    = useState('')
  const [goalTarget,  setGoalTarget]  = useState('')

  // modal state: { type: 'task'|'child'|'reward', item: null|object }
  const [modal,         setModal]         = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null) // { type, id, name, familyId }
  const [deleting,      setDeleting]      = useState(false)
  const [awardTarget,   setAwardTarget]   = useState(null) // { task, child }
  const [awarding,      setAwarding]      = useState(false)
  const [hwOnTime,      setHwOnTime]      = useState(true)
  const [hwSelfChecked, setHwSelfChecked] = useState(false)
  const [hwNoReminder,  setHwNoReminder]  = useState(false)
  const [awardToast,    setAwardToast]    = useState(null)

  const familyId = user?.familyId

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setUser(me)
      setFamilies(fams)
      const activeFamilyId = me.familyId || localStorage.getItem('activeFamilyId')
      if (!activeFamilyId) {
        console.warn('[KidQuest] No familyId on user and no activeFamilyId in localStorage — data will not load. User id:', me.id, 'email:', me.email)
        setError('Your account is not linked to a family. Please contact support or re-create your family.')
        return
      }
      const [ch, tk, rw, redArr, goal] = await Promise.all([
        getChildren(activeFamilyId),
        getTasksByFamily(activeFamilyId),
        getRewards(activeFamilyId),
        getRedemptionsByFamily(activeFamilyId),
        getActiveGoal(activeFamilyId).catch(() => null),
      ])
      setChildren(ch)
      setTasks(tk)
      setRewards(rw)
      setRedemptions(redArr)
      setFamilyGoal(goal)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function refetchFamily(fId) {
    localStorage.setItem('activeFamilyId', fId)
    const [ch, tk, rw, redArr, goal] = await Promise.all([
      getChildren(fId),
      getTasksByFamily(fId),
      getRewards(fId),
      getRedemptionsByFamily(fId),
      getActiveGoal(fId).catch(() => null),
    ])
    setChildren(ch)
    setTasks(tk)
    setRewards(rw)
    setRedemptions(redArr)
    setFamilyGoal(goal)
  }

  async function handleApproveRedemption(id) {
    try { await approveRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }
  async function handleDeliverRedemption(id) {
    try { await deliverRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }
  async function handleCancelRedemption(id) {
    try { await cancelRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }

  async function handleCreateGoal(e) {
    e.preventDefault()
    if (!goalName.trim() || !goalTarget) return
    try {
      await createGoal(familyId, { name: goalName.trim(), targetPoints: Number(goalTarget) })
      setGoalModal(false); setGoalName(''); setGoalTarget('')
      await refetchFamily(familyId)
    } catch { /**/ }
  }

  async function handleCancelGoal() {
    if (!familyGoal) return
    try { await cancelGoal(familyId, familyGoal.id); await refetchFamily(familyId) } catch { /**/ }
  }

  // ── Task handlers ──────────────────────────────────────────────────────────
  async function handleSaveTask({ familyId: selectedFamilyId, ...taskData }) {
    if (modal.item) {
      await updateTask(modal.item.taskId, taskData)
    } else {
      await createTask(selectedFamilyId, taskData)
    }
    setModal(null)
    await refetchFamily(selectedFamilyId)
  }

  async function applyTaskStatus(task, nextStatus) {
    await updateTask(task.taskId, {
      title: task.title, description: task.description,
      pointValue: task.pointValue, dueDate: task.dueDate,
      status: nextStatus, assignedToId: task.assignedTo ?? null,
    })
    await refetchFamily(task.familyId)
  }

  function cycleTaskStatus(task) {
    const next = STATUS_CYCLE[task.status]
    if (next === 'COMPLETED' && task.assignedTo) {
      const child = children.find(c => c.id === task.assignedTo) ?? null
      setAwardTarget({ task, child })
    } else {
      applyTaskStatus(task, next)
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
      await refetchFamily(task.familyId)
    } catch { setAwardTarget(null) }
    finally { setAwarding(false) }
  }

  async function handleRejectTask(task) {
    try {
      await rejectTask(task.taskId)
      await refetchFamily(task.familyId)
    } catch { /* ignore */ }
  }

  // ── Child handlers ─────────────────────────────────────────────────────────
  async function handleSaveChild({ familyId: selectedFamilyId, ...childData }) {
    if (modal.item) {
      await updateChild(modal.item.id, childData)
      await refetchFamily(modal.item.familyId)
    } else {
      await createChild(selectedFamilyId, childData)
      await refetchFamily(selectedFamilyId)
    }
    setModal(null)
  }

  // ── Reward handlers ────────────────────────────────────────────────────────
  async function handleSaveReward({ familyId: selectedFamilyId, ...data }) {
    if (modal.item) {
      await updateReward(modal.item.id, data)
    } else {
      await createReward(selectedFamilyId || familyId, data)
    }
    setModal(null)
    await refetchFamily(selectedFamilyId || familyId)
  }

  async function toggleRewardActive(reward) {
    await updateReward(reward.id, {
      name: reward.name, description: reward.description,
      pointCost: reward.pointCost, active: !reward.active,
    })
    await refetchFamily(reward.familyId)
  }

  // ── Family handlers ────────────────────────────────────────────────────────
  async function handleSaveFamily(data) {
    if (modal.item) {
      const updated = await updateFamily(modal.item.id, data)
      setFamilies(fs => fs.map(f => f.id === updated.id ? updated : f))
    } else {
      const created = await createFamily(data)
      setFamilies(fs => [...fs, created])
    }
    setModal(null)
  }

  // ── Delete handler ─────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    setDeleting(true)
    const { type, id, familyId: itemFamilyId } = deleteTarget
    try {
      if (type === 'task')          await deleteTask(id)
      else if (type === 'child')    await deleteChild(id)
      else if (type === 'reward')   await deleteReward(id)
      else if (type === 'family') {
        await deleteFamily(id)
        setFamilies(fs => fs.filter(f => f.id !== id))
      }
      setDeleteTarget(null)
      if (type !== 'family') await (itemFamilyId ? refetchFamily(itemFamilyId) : load())
    } catch {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  function handleLogout() { logout(); navigate('/login') }

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeTasks    = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
  const activeRewards  = rewards.filter(r => r.active)

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="dashboard" onLogout={handleLogout} />

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Hello{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋</h1>
            <p className={styles.subGreeting}>Here's what's happening in your family today.</p>
          </div>
          <div className={styles.userBadge}>
            <span className={styles.userAvatar}>👤</span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={styles.statCard}><span className={styles.statIcon}>👶</span><div><div className={styles.statValue}>{children.length}</div><div className={styles.statLabel}>Children</div></div></div>
          <div className={styles.statCard}><span className={styles.statIcon}>📋</span><div><div className={styles.statValue}>{activeTasks.length}</div><div className={styles.statLabel}>Active Tasks</div></div></div>
          <div className={styles.statCard}><span className={styles.statIcon}>✅</span><div><div className={styles.statValue}>{completedTasks.length}</div><div className={styles.statLabel}>Completed</div></div></div>
          <div className={styles.statCard}><span className={styles.statIcon}>🎁</span><div><div className={styles.statValue}>{activeRewards.length}</div><div className={styles.statLabel}>Rewards</div></div></div>
        </section>

        <div className={styles.grid}>
          {/* Children */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Children</h2>
              <button className={styles.btnAdd} onClick={() => setModal({ type: 'child', item: null })}>+ Add</button>
            </div>
            {children.length === 0
              ? <p className={styles.empty}>No children added yet.</p>
              : <div className={styles.childList}>
                  {children.map(child => {
                    const childTasks = tasks.filter(t => t.assignedTo === child.id)
                    const done = childTasks.filter(t => t.status === 'COMPLETED').length
                    return (
                      <div key={child.id} className={styles.childCard}>
                        <ChildAvatar child={child} />
                        <div className={styles.childInfo}>
                          <div className={styles.childName}>{child.name}</div>
                          <div className={styles.childMeta}>Age {child.age} · {done}/{childTasks.length} tasks done</div>
                          <div className={styles.childProgressWrap}>
                            <div className={styles.progressBar}
                              style={{ width: childTasks.length ? `${(done / childTasks.length) * 100}%` : '0%' }} />
                          </div>
                        </div>
                        <div className={styles.rowActions}>
                          <button className={styles.iconBtn} title="Edit"
                            onClick={() => setModal({ type: 'child', item: child })}>✏️</button>
                          <button className={styles.iconBtn} title="Delete"
                            onClick={() => setDeleteTarget({ type: 'child', id: child.id, name: child.name, familyId: child.familyId })}>🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </section>

          {/* Tasks */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Tasks</h2>
              <button className={styles.btnAdd} onClick={() => setModal({ type: 'task', item: null })}>+ Add</button>
            </div>
            {tasks.length === 0
              ? <p className={styles.empty}>No tasks yet.</p>
              : <ul className={styles.taskList}>
                  {tasks.map(task => (
                    <li key={task.taskId} className={styles.taskItem}>
                      <div className={styles.taskRow}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.rowActions}>
                          <button className={styles.iconBtn} title="Edit"
                            onClick={() => setModal({ type: 'task', item: task })}>✏️</button>
                          <button className={styles.iconBtn} title="Delete"
                            onClick={() => setDeleteTarget({ type: 'task', id: task.taskId, name: task.title, familyId: task.familyId })}>🗑️</button>
                        </div>
                      </div>
                      <div className={styles.taskMeta}>
                        <span className={styles.taskPoints}>⭐ {task.pointValue}pts</span>
                        {task.dueDate && <span className={styles.taskDue}>📅 {task.dueDate}</span>}
                        <button
                          className={`${styles.tag} ${STATUS_CLASS[task.status]} ${styles.tagBtn}`}
                          title="Click to advance status"
                          onClick={() => cycleTaskStatus(task)}>
                          {STATUS_LABEL[task.status]}
                        </button>
                        {task.status === 'PENDING_APPROVAL' && task.assignedTo && (
                          <button
                            className={`${styles.tag} ${styles.tagGreen} ${styles.tagBtn}`}
                            onClick={() => {
                              const child = children.find(c => c.id === task.assignedTo) ?? null
                              setAwardTarget({ task, child })
                            }}>
                            ⭐ Award
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
            }
          </section>

          {/* Rewards */}
          <section className={`${styles.panel} ${styles.panelFull}`}>
            <div className={styles.panelHeader}>
              <h2>Rewards</h2>
              <button className={styles.btnAdd} onClick={() => setModal({ type: 'reward', item: null })}>+ Add</button>
            </div>
            {rewards.length === 0
              ? <p className={styles.empty}>No rewards added yet.</p>
              : <div className={styles.rewardGrid}>
                  {rewards.map(reward => (
                    <div key={reward.id} className={`${styles.rewardCard} ${!reward.active ? styles.rewardInactive : ''}`}>
                      <div className={styles.rewardCardActions}>
                        <button className={styles.iconBtn} title="Edit"
                          onClick={() => setModal({ type: 'reward', item: reward })}>✏️</button>
                        <button className={styles.iconBtn} title="Delete"
                          onClick={() => setDeleteTarget({ type: 'reward', id: reward.id, name: reward.name, familyId: reward.familyId })}>🗑️</button>
                      </div>
                      <div className={styles.rewardIcon}>🎁</div>
                      <div className={styles.rewardName}>{reward.name}</div>
                      {reward.description && <div className={styles.rewardDesc}>{reward.description}</div>}
                      <div className={styles.rewardCost}>⭐ {reward.pointCost} pts</div>
                      <button
                        className={`${styles.tag} ${reward.active ? styles.tagGreen : styles.tagGray} ${styles.tagBtn}`}
                        style={{ marginTop: 8 }}
                        onClick={() => toggleRewardActive(reward)}>
                        {reward.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
            }
          </section>

          {/* Pending Redemptions */}
          <section className={`${styles.panel} ${styles.panelFull}`}>
            <div className={styles.panelHeader}>
              <h2>🎁 Žádosti o odměny</h2>
            </div>
            {redemptions.filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED').length === 0
              ? <p className={styles.emptyState}>Žádné čekající žádosti o odměny.</p>
              : <div className={styles.redemptionList}>
                  {redemptions
                    .filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED')
                    .map(r => (
                      <div key={r.id} className={styles.redemptionCard}>
                        <div className={styles.redemptionInfo}>
                          <span className={styles.redemptionIcon}>{r.rewardIcon || '🎁'}</span>
                          <div>
                            <div className={styles.redemptionName}>{r.rewardName}</div>
                            <div className={styles.redemptionMeta}>
                              {r.childName} · ⭐ {r.pointCost} bodů ·{' '}
                              <span className={r.status === 'APPROVED' ? styles.tagGreen : styles.tagOrange}>
                                {r.status === 'APPROVED' ? 'Schváleno' : 'Čeká'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.rowActions}>
                          {r.status === 'REQUESTED' && (
                            <button className={`${styles.tag} ${styles.tagGreen} ${styles.tagBtn}`}
                              onClick={() => handleApproveRedemption(r.id)}>
                              ✓ Schválit
                            </button>
                          )}
                          {r.status === 'APPROVED' && (
                            <button className={`${styles.tag} ${styles.tagBlue} ${styles.tagBtn}`}
                              onClick={() => handleDeliverRedemption(r.id)}>
                              📦 Předat
                            </button>
                          )}
                          <button className={`${styles.tag} ${styles.tagRed} ${styles.tagBtn}`}
                            onClick={() => handleCancelRedemption(r.id)}>
                            ✗ Zrušit
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
            }
          </section>

          {/* Family Goal */}
          <section className={`${styles.panel} ${styles.panelFull}`}>
            <div className={styles.panelHeader}>
              <h2>🎯 Rodinný cíl</h2>
              {!familyGoal && (
                <button className={styles.btnAdd} onClick={() => setGoalModal(true)}>+ Vytvořit cíl</button>
              )}
            </div>
            {familyGoal ? (
              <div className={styles.goalCard}>
                <div className={styles.goalName}>{familyGoal.name}</div>
                <div className={styles.goalProgress}>
                  <div className={styles.goalBar}>
                    <div className={styles.goalFill} style={{ width: `${familyGoal.progressPct}%` }} />
                  </div>
                  <span className={styles.goalLabel}>
                    ⭐ {familyGoal.currentProgress} / {familyGoal.targetPoints}
                    {familyGoal.reachedAt && ' · 🎉 Splněno!'}
                  </span>
                </div>
                {!familyGoal.reachedAt && (
                  <button className={`${styles.tag} ${styles.tagRed} ${styles.tagBtn}`}
                    style={{ marginTop: 8 }} onClick={handleCancelGoal}>
                    Zrušit cíl
                  </button>
                )}
              </div>
            ) : (
              <p className={styles.empty}>Žádný aktivní cíl. Vytvořte rodinný cíl pro společnou motivaci.</p>
            )}
          </section>

          {/* Families */}
          <section className={`${styles.panel} ${styles.panelFull}`}>
            <div className={styles.panelHeader}>
              <h2>Families</h2>
              <button className={styles.btnAdd} onClick={() => setModal({ type: 'family', item: null })}>+ Add</button>
            </div>
            {families.length === 0
              ? <p className={styles.empty}>No families yet.</p>
              : <div className={styles.familyGrid}>
                  {families.map(fam => (
                    <div key={fam.id} className={styles.familyCard}>
                      <span className={styles.familyIcon}>🏠</span>
                      <div className={styles.familyInfo}>
                        <div className={styles.familyName}>{fam.name}</div>
                        <div className={styles.familyMeta}>
                          {children.filter(c => c.familyId === fam.id).length} children ·{' '}
                          {tasks.filter(t => t.familyId === fam.id).length} tasks
                        </div>
                      </div>
                      <div className={styles.rowActions}>
                        <button className={styles.iconBtn} title="Edit"
                          onClick={() => setModal({ type: 'family', item: fam })}>✏️</button>
                        <button className={styles.iconBtn} title="Delete"
                          onClick={() => setDeleteTarget({ type: 'family', id: fam.id, name: fam.name })}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </section>
        </div>
      </main>

      {/* Modals */}
      {modal?.type === 'task' && (
        <Modal title={modal.item ? 'Edit Task' : 'New Task'} onClose={() => setModal(null)}>
          <TaskForm initial={modal.item ?? {}} children={children} families={families}
            onSubmit={handleSaveTask} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'child' && (
        <Modal title={modal.item ? 'Edit Child' : 'New Child'} onClose={() => setModal(null)}>
          <ChildForm initial={modal.item ?? {}} families={families}
            onSubmit={handleSaveChild} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'reward' && (
        <Modal title={modal.item ? 'Edit Reward' : 'New Reward'} onClose={() => setModal(null)}>
          <RewardForm initial={modal.item ?? {}} families={families}
            onSubmit={handleSaveReward} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'family' && (
        <Modal title={modal.item ? 'Edit Family' : 'New Family'} onClose={() => setModal(null)}>
          <FamilyForm initial={modal.item ?? {}}
            onSubmit={handleSaveFamily} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {awardToast && (
        <div className={styles.toast}>{awardToast}</div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting} />
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

      {goalModal && (
        <Modal title="Nový rodinný cíl" onClose={() => setGoalModal(false)}>
          <form onSubmit={handleCreateGoal} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', marginBottom:4, fontWeight:600, fontSize:14 }}>Název cíle *</label>
              <input value={goalName} onChange={e => setGoalName(e.target.value)}
                placeholder="Výlet do ZOO" required style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }} />
            </div>
            <div>
              <label style={{ display:'block', marginBottom:4, fontWeight:600, fontSize:14 }}>Cílové body *</label>
              <input type="number" min="1" value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                placeholder="500" required style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:14 }} />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setGoalModal(false)}
                style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #ddd', background:'#f5f5f5', cursor:'pointer' }}>
                Zrušit
              </button>
              <button type="submit"
                style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#667eea', color:'#fff', cursor:'pointer', fontWeight:700 }}>
                Vytvořit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
