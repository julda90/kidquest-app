import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getTasksByFamily, approveTask, rejectTask, returnRoutine, approveBatch } from '../api/tasks'
import { getRewards } from '../api/rewards'
import { getFamilies, getActiveGoal, createGoal, cancelGoal } from '../api/families'
import { getRedemptionsByFamily, approveRedemption, deliverRedemption, cancelRedemption } from '../api/redemptions'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import { AVATARS, getAvatarSrc } from '../constants/avatars'
import styles from './Dashboard.module.css'

const KIND_LABEL   = { ROUTINE: 'Rutina', HOMEWORK: 'Domácí úkol', QUEST: 'Výzva', TASK: 'Úkol' }
const STATUS_CLASS = { UNASSIGNED: styles.tagGray, ASSIGNED: styles.tagBlue, PENDING_APPROVAL: styles.tagOrange, COMPLETED: styles.tagGreen, REJECTED: styles.tagRed }

function ChildAvatar({ child }) {
  const src = getAvatarSrc(child.avatar)
  if (src) return <img src={src} alt={child.name} className={styles.childAvatarImg} />
  const fallback = AVATARS[child.name.charCodeAt(0) % Math.max(AVATARS.length, 1)]
  return <span className={styles.childAvatar}>{fallback?.id ?? '👤'}</span>
}

const QUICK_NAV = [
  { href: '/tasks',    icon: '✅', label: 'Úkoly',   desc: 'Správa a přidávání úkolů' },
  { href: '/rewards',  icon: '🎁', label: 'Odměny',  desc: 'Katalog a ceny odměn'    },
  { href: '/children', icon: '👶', label: 'Děti',    desc: 'Profily a nastavení dětí' },
  { href: '/progress', icon: '🗺️', label: 'Pokrok',  desc: 'XP, úrovně, odznaky'     },
]

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

  const [awardTarget,   setAwardTarget]   = useState(null)
  const [awarding,      setAwarding]      = useState(false)
  const [hwOnTime,      setHwOnTime]      = useState(true)
  const [hwSelfChecked, setHwSelfChecked] = useState(false)
  const [hwNoReminder,  setHwNoReminder]  = useState(false)
  const [awardToast,    setAwardToast]    = useState(null)

  const [returnTaskId,  setReturnTaskId]  = useState(null)
  const [returnSteps,   setReturnSteps]   = useState([])

  const [batchConfirm,         setBatchConfirm]         = useState(false)
  const [batchApproving,       setBatchApproving]       = useState(false)
  const [pendingSelected,      setPendingSelected]      = useState(() => new Set())
  const [pendingBulkConfirm,   setPendingBulkConfirm]   = useState(false)
  const [pendingBulkApproving, setPendingBulkApproving] = useState(false)

  const familyId = user?.familyId

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setUser(me)
      setFamilies(fams)
      const activeFamilyId = me.familyId || localStorage.getItem('activeFamilyId')
      if (!activeFamilyId) {
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

  // ── Redemption handlers ────────────────────────────────────────────────────
  async function handleApproveRedemption(id) {
    try { await approveRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }
  async function handleDeliverRedemption(id) {
    try { await deliverRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }
  async function handleCancelRedemption(id) {
    try { await cancelRedemption(id); await refetchFamily(familyId) } catch { /**/ }
  }

  // ── Goal handlers ──────────────────────────────────────────────────────────
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

  // ── Approval handlers ──────────────────────────────────────────────────────
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
      if (result.levelUp)         parts.push(`🆙 Nová úroveň ${result.newLevel}!`)
      if (result.streakDays > 1)  parts.push(`🔥 Série ${result.streakDays} dní`)
      if (result.newBadges?.length) parts.push(`🏅 Nový odznak!`)
      if (result.goalReached)     parts.push(`🎯 Rodinný cíl splněn!`)
      setAwardToast(parts.join(' · '))
      setTimeout(() => setAwardToast(null), 5000)
      await refetchFamily(task.familyId)
    } catch (err) {
      alert(err.message || 'Schválení selhalo')
      setAwardTarget(null)
    } finally { setAwarding(false) }
  }

  async function handleRejectTask(task) {
    try { await rejectTask(task.taskId); await refetchFamily(task.familyId) } catch { /**/ }
  }

  async function handleReturnRoutine(taskId, fId) {
    if (!returnSteps.length) return
    try {
      await returnRoutine(taskId, returnSteps)
      setReturnTaskId(null); setReturnSteps([])
      await refetchFamily(fId)
    } catch { /**/ }
  }

  async function handleApproveBatch(routineTasks) {
    setBatchApproving(true)
    try {
      const ids = routineTasks.map(t => t.taskId)
      const results = await approveBatch(ids)
      setBatchConfirm(false)
      const total = results.reduce((s, r) => s + (r.awardedPoints ?? 0), 0)
      setAwardToast(`✅ Schváleno ${results.length} rutin · +${total} bodů`)
      setTimeout(() => setAwardToast(null), 5000)
      if (familyId) await refetchFamily(familyId)
    } catch { /**/ } finally { setBatchApproving(false) }
  }

  async function handleBulkApprovePending() {
    setPendingBulkApproving(true)
    try {
      const ids = [...pendingSelected]
      const results = await approveBatch(ids)
      setPendingSelected(new Set())
      setPendingBulkConfirm(false)
      const total = results.reduce((s, r) => s + (r.awardedPoints ?? 0), 0)
      setAwardToast(`✅ Schváleno ${results.length} úkolů · +${total} bodů`)
      setTimeout(() => setAwardToast(null), 5000)
      if (familyId) await refetchFamily(familyId)
    } catch { /**/ } finally { setPendingBulkApproving(false) }
  }

  function handleLogout() { logout(); navigate('/login') }

  // ── Derived ────────────────────────────────────────────────────────────────
  const pendingApprovals  = tasks.filter(t => t.status === 'PENDING_APPROVAL')
  const routinePending    = tasks.filter(t => t.kind === 'ROUTINE' && t.status === 'PENDING_APPROVAL')
  const pendingRedemptions = redemptions.filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED')
  const activeRewards     = rewards.filter(r => r.active)
  const completedTasks    = tasks.filter(t => t.status === 'COMPLETED')

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="dashboard" onLogout={handleLogout} />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Ahoj{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋</h1>
            <p className={styles.subGreeting}>Přehled rodinného dne.</p>
          </div>
          <div className={styles.userBadge}>
            <span className={styles.userAvatar}>👤</span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={`${styles.statCard} ${pendingApprovals.length ? styles.statCardAlert : ''}`}>
            <span className={styles.statIcon}>⏳</span>
            <div>
              <div className={styles.statValue}>{pendingApprovals.length}</div>
              <div className={styles.statLabel}>Čeká na schválení</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>👶</span>
            <div>
              <div className={styles.statValue}>{children.length}</div>
              <div className={styles.statLabel}>Děti</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>✅</span>
            <div>
              <div className={styles.statValue}>{completedTasks.length}</div>
              <div className={styles.statLabel}>Splněno celkem</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎁</span>
            <div>
              <div className={styles.statValue}>{pendingRedemptions.length}</div>
              <div className={styles.statLabel}>Žádosti o odměny</div>
            </div>
          </div>
        </section>

        {/* Quick nav */}
        <section className={styles.quickNav}>
          {QUICK_NAV.map(n => (
            <a key={n.href} href={n.href} className={styles.quickCard}>
              <span className={styles.quickIcon}>{n.icon}</span>
              <div>
                <div className={styles.quickLabel}>{n.label}</div>
                <div className={styles.quickDesc}>{n.desc}</div>
              </div>
              <span className={styles.quickArrow}>›</span>
            </a>
          ))}
        </section>

        <div className={styles.grid}>
          {/* Pending Approvals Table */}
          {pendingApprovals.length > 0 && (() => {
            const allSelected = pendingApprovals.every(t => pendingSelected.has(t.taskId))
            const selectedCount = pendingApprovals.filter(t => pendingSelected.has(t.taskId)).length
            return (
              <section className={`${styles.panel} ${styles.panelFull} ${styles.pendingPanel}`}>
                <div className={styles.panelHeader}>
                  <h2>⏳ Čekají na schválení ({pendingApprovals.length})</h2>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {selectedCount > 0 && (
                      !pendingBulkConfirm
                        ? <button className={styles.btnAdd} style={{ background: '#f97316' }}
                            onClick={() => setPendingBulkConfirm(true)}>
                            ✅ Schválit vybrané ({selectedCount})
                          </button>
                        : <>
                            <span style={{ fontSize: 12 }}>Opravdu schválit {selectedCount}?</span>
                            <button className={styles.btnAdd} style={{ background: '#16a34a' }}
                              disabled={pendingBulkApproving}
                              onClick={handleBulkApprovePending}>
                              {pendingBulkApproving ? '…' : 'Ano ✓'}
                            </button>
                            <button className={styles.btnAdd} style={{ background: '#6b7280' }}
                              onClick={() => setPendingBulkConfirm(false)}>Ne</button>
                          </>
                    )}
                  </div>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.pendingTable}>
                    <thead>
                      <tr>
                        <th className={styles.checkCell}>
                          <input type="checkbox" checked={allSelected}
                            onChange={e => setPendingSelected(
                              e.target.checked ? new Set(pendingApprovals.map(t => t.taskId)) : new Set()
                            )} />
                        </th>
                        <th>Dítě</th>
                        <th>Úkol</th>
                        <th>Typ</th>
                        <th>Body</th>
                        <th>Termín</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map(task => {
                        const child = children.find(c => c.id === task.assignedTo)
                        const isSelected = pendingSelected.has(task.taskId)
                        const kindClass = task.kind === 'ROUTINE' ? styles.tagBlue
                          : task.kind === 'HOMEWORK' ? styles.tagOrange : styles.tagGray
                        return (
                          <tr key={task.taskId}
                            className={`${styles.pendingRow} ${isSelected ? styles.pendingRowSelected : ''}`}>
                            <td className={styles.checkCell}>
                              <input type="checkbox" checked={isSelected}
                                onChange={e => {
                                  const next = new Set(pendingSelected)
                                  e.target.checked ? next.add(task.taskId) : next.delete(task.taskId)
                                  setPendingSelected(next)
                                }} />
                            </td>
                            <td className={styles.pendingChild}>{child?.name ?? '—'}</td>
                            <td className={styles.pendingTitle}>{task.title}</td>
                            <td><span className={`${styles.tag} ${kindClass}`}>{KIND_LABEL[task.kind] ?? task.kind}</span></td>
                            <td className={styles.pendingPts}>⭐ {task.pointValue}</td>
                            <td className={styles.pendingDue}>{task.dueDate ?? '—'}</td>
                            <td>
                              <button className={`${styles.tag} ${styles.tagGreen} ${styles.tagBtn}`}
                                onClick={() => {
                                  const ch = children.find(c => c.id === task.assignedTo) ?? null
                                  setAwardTarget({ task, child: ch })
                                }}>✓ Schválit</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })()}

          {/* Routine approvals */}
          {routinePending.length > 0 && (
            <section className={styles.panel} style={{ borderLeft: '3px solid #f97316' }}>
              <div className={styles.panelHeader}>
                <h2>🌅 Ranní rutiny ({routinePending.length})</h2>
                {!batchConfirm
                  ? <button className={styles.btnAdd} style={{ background: '#f97316' }}
                      onClick={() => setBatchConfirm(true)}>
                      ✅ Schválit všechny
                    </button>
                  : <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12 }}>Opravdu?</span>
                      <button className={styles.btnAdd} style={{ background: '#16a34a' }} disabled={batchApproving}
                        onClick={() => handleApproveBatch(routinePending)}>
                        {batchApproving ? '…' : 'Ano ✓'}
                      </button>
                      <button className={styles.btnAdd} style={{ background: '#6b7280' }}
                        onClick={() => setBatchConfirm(false)}>Ne</button>
                    </span>
                }
              </div>
              <ul className={styles.taskList}>
                {routinePending.map(task => {
                  const childObj = children.find(c => c.id === task.assignedTo)
                  const isReturning = returnTaskId === task.taskId
                  return (
                    <li key={task.taskId} className={styles.taskItem}>
                      <div className={styles.taskRow}>
                        <div className={styles.taskTitle}>
                          {childObj ? `${childObj.name}: ` : ''}{task.title}
                        </div>
                        <div className={styles.rowActions}>
                          <button className={`${styles.tag} ${styles.tagGreen} ${styles.tagBtn}`}
                            onClick={() => {
                              const ch = children.find(c => c.id === task.assignedTo) ?? null
                              setAwardTarget({ task, child: ch })
                            }}>⭐ Schválit</button>
                          <button className={`${styles.tag} ${styles.tagOrange} ${styles.tagBtn}`}
                            onClick={() => {
                              if (isReturning) { setReturnTaskId(null); setReturnSteps([]) }
                              else { setReturnTaskId(task.taskId); setReturnSteps([]) }
                            }}>↩ Vrátit…</button>
                        </div>
                      </div>
                      {task.steps?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                          {task.steps.map(s => (
                            <span key={s.position}
                              style={{
                                fontSize: 11, padding: '2px 6px', borderRadius: 8,
                                background: s.doneAt ? '#d1fae5' : '#fee2e2',
                                color: s.doneAt ? '#065f46' : '#991b1b',
                                cursor: isReturning ? 'pointer' : 'default',
                                outline: isReturning && returnSteps.includes(s.position) ? '2px solid #f97316' : 'none',
                              }}
                              onClick={() => {
                                if (!isReturning) return
                                setReturnSteps(prev =>
                                  prev.includes(s.position) ? prev.filter(x => x !== s.position) : [...prev, s.position]
                                )
                              }}
                            >{s.icon} {s.label}</span>
                          ))}
                        </div>
                      )}
                      {isReturning && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>Klikni na kroky k vrácení:</span>
                          <button className={`${styles.tag} ${styles.tagOrange} ${styles.tagBtn}`}
                            disabled={!returnSteps.length}
                            onClick={() => handleReturnRoutine(task.taskId, task.familyId)}>
                            Vrátit ({returnSteps.length})
                          </button>
                          <button className={`${styles.tag} ${styles.tagGray} ${styles.tagBtn}`}
                            onClick={() => { setReturnTaskId(null); setReturnSteps([]) }}>Zrušit</button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Children overview */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Děti</h2>
              <a href="/children" className={styles.btnLink}>Správa →</a>
            </div>
            {children.length === 0
              ? <p className={styles.empty}>Žádné děti.</p>
              : <div className={styles.childList}>
                  {children.map(child => {
                    const childTasks = tasks.filter(t => t.assignedTo === child.id)
                    const done       = childTasks.filter(t => t.status === 'COMPLETED').length
                    const pending    = childTasks.filter(t => t.status === 'PENDING_APPROVAL').length
                    return (
                      <div key={child.id} className={styles.childCard}>
                        <ChildAvatar child={child} />
                        <div className={styles.childInfo}>
                          <div className={styles.childName}>{child.name}</div>
                          <div className={styles.childMeta}>
                            {child.age} let · {done}/{childTasks.length} splněno
                            {pending > 0 && <span className={`${styles.tag} ${styles.tagOrange}`} style={{ marginLeft: 6 }}>⏳ {pending}</span>}
                          </div>
                          <div className={styles.childProgressWrap}>
                            <div className={styles.progressBar}
                              style={{ width: childTasks.length ? `${(done / childTasks.length) * 100}%` : '0%' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </section>

          {/* Pending Redemptions */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>🎁 Žádosti o odměny</h2>
            </div>
            {pendingRedemptions.length === 0
              ? <p className={styles.empty}>Žádné čekající žádosti.</p>
              : <div className={styles.redemptionList}>
                  {pendingRedemptions.map(r => (
                    <div key={r.id} className={styles.redemptionCard}>
                      <div className={styles.redemptionInfo}>
                        <span className={styles.redemptionIcon}>{r.rewardIcon || '🎁'}</span>
                        <div>
                          <div className={styles.redemptionName}>{r.rewardName}</div>
                          <div className={styles.redemptionMeta}>
                            {r.childName} · ⭐ {r.pointCost} ·{' '}
                            <span className={r.status === 'APPROVED' ? styles.tagGreen : styles.tagOrange}>
                              {r.status === 'APPROVED' ? 'Schváleno' : 'Čeká'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.rowActions}>
                        {r.status === 'REQUESTED' && (
                          <button className={`${styles.tag} ${styles.tagGreen} ${styles.tagBtn}`}
                            onClick={() => handleApproveRedemption(r.id)}>✓ Schválit</button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button className={`${styles.tag} ${styles.tagBlue} ${styles.tagBtn}`}
                            onClick={() => handleDeliverRedemption(r.id)}>📦 Předat</button>
                        )}
                        <button className={`${styles.tag} ${styles.tagRed} ${styles.tagBtn}`}
                          onClick={() => handleCancelRedemption(r.id)}>✗</button>
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
        </div>
      </main>

      {/* Award dialog */}
      {awardToast && <div className={styles.toast}>{awardToast}</div>}

      {awardTarget && (() => {
        const t  = awardTarget.task
        const isHw = t.kind === 'HOMEWORK'
        const base   = isHw ? (hwOnTime ? (t.pointValue ?? 20) : (t.latePointValue ?? t.pointValue ?? 10)) : (t.pointValue ?? 0)
        const bonus1 = isHw && hwSelfChecked && t.bonusValue > 0 ? t.bonusValue : 0
        const bonus2 = isHw && hwNoReminder  && t.noReminderBonus > 0 ? t.noReminderBonus : 0
        return (
          <Modal title="Schválit úkol" onClose={() => !awarding && setAwardTarget(null)}>
            <div className={styles.awardDialog}>
              <div className={styles.awardPtsBadge}>⭐ {isHw ? base + bonus1 + bonus2 : t.pointValue}</div>
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
                <button className={styles.awardCancel}
                  onClick={() => { setAwardTarget(null); setHwOnTime(true); setHwSelfChecked(false); setHwNoReminder(false) }}
                  disabled={awarding}>Zrušit</button>
                <button className={styles.awardCancel}
                  onClick={() => { handleRejectTask(awardTarget.task); setAwardTarget(null) }}
                  disabled={awarding}>✗ Zamítnout</button>
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
          <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Název cíle *</label>
              <input value={goalName} onChange={e => setGoalName(e.target.value)}
                placeholder="Výlet do ZOO" required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Cílové body *</label>
              <input type="number" min="1" value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                placeholder="500" required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setGoalModal(false)}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}>
                Zrušit
              </button>
              <button type="submit"
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                Vytvořit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
