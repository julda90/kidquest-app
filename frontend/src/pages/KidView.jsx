import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getTasksByChild } from '../api/tasks'
import { getRewards } from '../api/rewards'
import { getTransactionsByChild } from '../api/pointTransactions'
import { updateTask } from '../api/tasks'
import styles from './KidView.module.css'

// ── Theme mapping from Child.avatar value ─────────────────────────────────────
const THEME_MAP = {
  elsa:       'frozen',
  unicorn:    'unicorn',
  hotwheels:  'minecraft',
  minecraft:  'minecraft',
}

const THEME_AVATAR = { frozen: '❄️', unicorn: '🦄', minecraft: '⛏️' }
const THEME_POINT_ICON = { frozen: '❄️', unicorn: '✨', minecraft: '💎' }

const THEME_NAV = {
  frozen:    [{ i: '⚔️', l: 'Výzvy' }, { i: '🏰', l: 'Mapa' }, { i: '🎁', l: 'Odměny' }, { i: '👑', l: 'Trofeje' }, { i: '👤', l: 'Já' }],
  unicorn:   [{ i: '🦄', l: 'Výzvy' }, { i: '🌈', l: 'Mapa' }, { i: '🎁', l: 'Odměny' }, { i: '⭐', l: 'Hvězdy' }, { i: '👤', l: 'Já' }],
  minecraft: [{ i: '⛏️', l: 'Výzvy' }, { i: '🗺️', l: 'Mapa' }, { i: '💎', l: 'Odměny' }, { i: '🏆', l: 'Trofeje' }, { i: '👤', l: 'Já' }],
}

const MORNING_TITLE = {
  frozen:    '❄️ Ranní kouzlo',
  unicorn:   '🌈 Ranní magie',
  minecraft: '⛏️ Ranní výzva',
}

const MORNING_STEPS = {
  frozen:    [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }, { i: '🎒', l: 'Batoh' }],
  unicorn:   [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zoubky' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaňka' }],
  minecraft: [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👕', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }, { i: '🎒', l: 'Batoh' }],
}

const TASKS_HEADING = { frozen: '⚔️ Dnešní výzvy', unicorn: '🦄 Dnešní kouzla', minecraft: '⛏️ Dnešní výzvy' }
const REWARDS_HEADING = { frozen: '🎁 Moje odměny', unicorn: '🌈 Moje odměny', minecraft: '💎 Odměny' }

// ── CSS variable sets per theme ───────────────────────────────────────────────
const THEME_VARS = {
  frozen: {
    '--kbg':    'linear-gradient(170deg,#061a35 0%,#0e3a6e 45%,#1a6eaa 80%,#4eb8e8 100%)',
    '--kcard':  'rgba(100,200,255,0.10)',
    '--kcardb': 'rgba(180,230,255,0.18)',
    '--kr':     '16px',
    '--ksb':    'rgba(4,14,36,0.35)',
    '--ksbdiv': 'rgba(100,200,255,0.10)',
    '--kbdg':   'linear-gradient(135deg,#c8ecff,#80d0f8)',
    '--kbdgf':  '#04213a',
    '--kglow':  'rgba(100,200,255,0.45)',
    '--kpts':   '#a8dcff',
    '--kdim':   'rgba(255,255,255,0.40)',
    '--ksh':    'rgba(180,230,255,0.85)',
    '--kbtng':  'linear-gradient(135deg,#4eb8e8,#1a85c4)',
    '--kbtnw':  'linear-gradient(135deg,#c8ecff,#80d0f8)',
    '--kbtnwf': '#04213a',
    '--kdone':  'rgba(100,200,255,0.18)',
    '--kcur':   'linear-gradient(135deg,#c8ecff,#80d0f8)',
    '--kcurf':  '#04213a',
  },
  unicorn: {
    '--kbg':    'linear-gradient(170deg,#1a052e 0%,#5b1280 45%,#b5198f 80%,#f472b6 100%)',
    '--kcard':  'rgba(240,100,200,0.11)',
    '--kcardb': 'rgba(255,180,240,0.20)',
    '--kr':     '20px',
    '--ksb':    'rgba(20,4,40,0.30)',
    '--ksbdiv': 'rgba(240,100,200,0.10)',
    '--kbdg':   'linear-gradient(135deg,#f9a8d4,#e879f9)',
    '--kbdgf':  '#2d0050',
    '--kglow':  'rgba(232,121,249,0.45)',
    '--kpts':   '#f9a8d4',
    '--kdim':   'rgba(255,255,255,0.38)',
    '--ksh':    'rgba(249,168,212,0.90)',
    '--kbtng':  'linear-gradient(135deg,#e879f9,#a21caf)',
    '--kbtnw':  'linear-gradient(135deg,#f9a8d4,#e879f9)',
    '--kbtnwf': '#2d0050',
    '--kdone':  'rgba(200,50,200,0.18)',
    '--kcur':   'linear-gradient(135deg,#f9a8d4,#e879f9)',
    '--kcurf':  '#2d0050',
  },
  minecraft: {
    '--kbg':    'linear-gradient(180deg,#71b5d4 0%,#71b5d4 55%,#5a8c3c 55%,#5a8c3c 67%,#7a4f1e 67%,#7a4f1e 100%)',
    '--kcard':  'rgba(0,0,0,0.58)',
    '--kcardb': 'rgba(140,140,140,0.32)',
    '--kr':     '3px',
    '--ksb':    'rgba(0,0,0,0.38)',
    '--ksbdiv': 'rgba(120,120,120,0.20)',
    '--kbdg':   'linear-gradient(135deg,#00e5ff,#0098c4)',
    '--kbdgf':  '#001820',
    '--kglow':  'rgba(0,200,255,0.45)',
    '--kpts':   '#00e5ff',
    '--kdim':   'rgba(255,255,255,0.40)',
    '--ksh':    'rgba(200,240,200,0.90)',
    '--kbtng':  'linear-gradient(135deg,#5ac05a,#2e8b2e)',
    '--kbtnw':  'linear-gradient(135deg,#00e5ff,#0098c4)',
    '--kbtnwf': '#001820',
    '--kdone':  'rgba(0,180,0,0.20)',
    '--kcur':   'linear-gradient(135deg,#00e5ff,#0098c4)',
    '--kcurf':  '#001820',
  },
}

// ── Canvas particle helpers ───────────────────────────────────────────────────
function buildParticles(theme, W, H) {
  if (theme === 'snow') {
    return Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.4, a: Math.random() * 0.7 + 0.25,
      vx: (Math.random() - 0.5) * 0.12, vy: Math.random() * 0.16 + 0.06,
      d: Math.random() * Math.PI * 2,
    }))
  }
  if (theme === 'sparkle') {
    const cols = ['#f9a8d4', '#e879f9', '#c084fc', '#facc15', '#67e8f9', '#fb923c']
    return Array.from({ length: 65 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.8 + 0.2,
      c: cols[i % cols.length], d: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.04 + 0.015,
    }))
  }
  // pixel
  const cols = ['#5a8c3c', '#7a4f1e', '#888', '#71b5d4', '#8b6914']
  return Array.from({ length: 32 }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    sz: (Math.floor(Math.random() * 3) + 1) * 2,
    c: cols[i % cols.length], vy: Math.random() * 0.35 + 0.1,
    a: Math.random() * 0.5 + 0.25,
  }))
}

function drawParticles(ctx, parts, theme, t, W, H) {
  ctx.clearRect(0, 0, W, H)
  parts.forEach(p => {
    if (theme === 'snow') {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,230,255,${p.a * (0.6 + 0.4 * Math.sin(t * 0.8 + p.d))})`
      ctx.fill()
      p.x += p.vx; p.y += p.vy
      if (p.y > H) { p.y = -4; p.x = Math.random() * W }
      if (p.x < 0) p.x = W
      if (p.x > W) p.x = 0
    } else if (theme === 'sparkle') {
      const al = p.a * (0.5 + 0.5 * Math.sin(t * 60 * p.sp + p.d))
      ctx.globalAlpha = al
      ctx.fillStyle = p.c
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
      p.d += p.sp
    } else {
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t * 0.4 + p.x * 0.02))
      ctx.fillStyle = p.c
      ctx.fillRect(p.x, p.y, p.sz, p.sz)
      ctx.globalAlpha = 1
      p.y += p.vy
      if (p.y > H) { p.y = -p.sz; p.x = Math.random() * W }
    }
  })
}

// ── Czech date helper ─────────────────────────────────────────────────────────
const DAYS_CZ = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
const MONTHS_CZ = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.']
function czDate() {
  const d = new Date()
  return `${DAYS_CZ[d.getDay()]}, ${d.getDate()}. ${MONTHS_CZ[d.getMonth()]}`
}
function todayKey() { return new Date().toISOString().slice(0, 10) }

// ── Morning steps storage ─────────────────────────────────────────────────────
function loadMorning(childId, count) {
  try {
    const raw = localStorage.getItem(`morning_${childId}_${todayKey()}`)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length === count) return arr
    }
  } catch { /* ignore */ }
  return Array(count).fill(false)
}

function saveMorning(childId, state) {
  try { localStorage.setItem(`morning_${childId}_${todayKey()}`, JSON.stringify(state)) } catch { /* ignore */ }
}

function loadStreak(childId) {
  try { return parseInt(localStorage.getItem(`streak_${childId}`) || '0', 10) } catch { return 0 }
}

// ── ChildPicker — shown when no child is selected yet ────────────────────────
function ChildPicker({ children, onPick }) {
  return (
    <div className={styles.picker}>
      <div className={styles.pickerTitle}>Kdo tu dnes bude? 👋</div>
      <div className={styles.pickerCards}>
        {children.map(child => {
          const theme = THEME_MAP[child.avatar] || 'frozen'
          return (
            <button key={child.id} className={styles.pickerCard} onClick={() => onPick(child.id)}>
              <span className={styles.pickerAva}>{THEME_AVATAR[theme]}</span>
              <span className={styles.pickerName}>{child.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main KidView page ─────────────────────────────────────────────────────────
export default function KidView() {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const canvasRef  = useRef(null)
  const rafRef     = useRef(null)
  const partsRef   = useRef([])
  const t0Ref      = useRef(performance.now())

  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [familyId,   setFamilyId]   = useState('')
  const [allChildren, setAllChildren] = useState([])
  const [child,      setChild]      = useState(null)
  const [tasks,      setTasks]      = useState([])
  const [rewards,    setRewards]    = useState([])
  const [totalPts,   setTotalPts]   = useState(0)
  const [morningDone, setMorningDone] = useState([])
  const [activeNav,  setActiveNav]  = useState(0)
  const [submitting, setSubmitting] = useState(null) // taskId being submitted

  const theme = child ? (THEME_MAP[child.avatar] || 'frozen') : 'frozen'
  const particleType = theme === 'frozen' ? 'snow' : theme === 'unicorn' ? 'sparkle' : 'pixel'
  const steps = child ? MORNING_STEPS[theme] : []
  const streak = child ? loadStreak(child.id) : 0

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        const fId = me.familyId
        if (!fId) { setError('Tvůj účet není propojen s rodinou.'); return }
        setFamilyId(fId)
        const ch = await getChildren(fId)
        setAllChildren(ch)

        // Try to restore previously selected child
        const storedId = localStorage.getItem('kid_selectedChildId')
        const stored   = storedId ? ch.find(c => c.id === storedId) : null
        if (stored) await selectChild(stored, fId)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load child-specific data ────────────────────────────────────────────────
  async function selectChild(c, fId) {
    try {
      const fIdToUse = fId || familyId
      localStorage.setItem('kid_selectedChildId', c.id)
      const [tkArr, rwArr, txArr] = await Promise.all([
        getTasksByChild(c.id),
        getRewards(fIdToUse),
        getTransactionsByChild(c.id),
      ])
      const t = THEME_MAP[c.avatar] || 'frozen'
      const stepCount = MORNING_STEPS[t].length
      setChild(c)
      setTasks(tkArr.filter(t => t.status === 'ASSIGNED' || t.status === 'PENDING_APPROVAL'))
      setRewards(rwArr.filter(r => r.active).sort((a, b) => a.pointCost - b.pointCost))
      setTotalPts(txArr.reduce((s, tx) => s + tx.amount, 0))
      setMorningDone(loadMorning(c.id, stepCount))
    } catch (e) { setError(e.message) }
  }

  // ── Submit task for parent approval ────────────────────────────────────────
  async function handleSubmitTask(task) {
    if (task.status !== 'ASSIGNED') return
    setSubmitting(task.taskId)
    try {
      await updateTask(task.taskId, {
        title: task.title,
        description: task.description,
        pointValue: task.pointValue,
        dueDate: task.dueDate,
        status: 'PENDING_APPROVAL',
        assignedToId: task.assignedTo ?? null,
      })
      setTasks(prev => prev.map(t => t.taskId === task.taskId ? { ...t, status: 'PENDING_APPROVAL' } : t))
    } catch { /* keep as-is */ } finally { setSubmitting(null) }
  }

  // ── Toggle morning step ─────────────────────────────────────────────────────
  function toggleStep(idx) {
    if (!child) return
    setMorningDone(prev => {
      const next = [...prev]
      next[idx] = !next[idx]
      saveMorning(child.id, next)
      return next
    })
  }

  // ── Particle canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      partsRef.current = buildParticles(particleType, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    t0Ref.current = performance.now()
    function loop(ts) {
      const t = (ts - t0Ref.current) / 1000
      drawParticles(ctx, partsRef.current, particleType, t, canvas.width, canvas.height)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [particleType])

  // ── Computed morning progress ───────────────────────────────────────────────
  const doneCnt = morningDone.filter(Boolean).length
  const morningTitleFull = child
    ? `${MORNING_TITLE[theme]} — Dnes: ${doneCnt}/${steps.length}`
    : ''

  function handleLogout() { logout(); navigate('/login') }

  // ── Render states ───────────────────────────────────────────────────────────
  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  if (!child) {
    return (
      <>
        <canvas ref={canvasRef} className={styles.canvas} />
        <ChildPicker children={allChildren} onPick={id => {
          const c = allChildren.find(x => x.id === id)
          if (c) selectChild(c, familyId)
        }} />
      </>
    )
  }

  const vars = THEME_VARS[theme]
  const ptIcon = THEME_POINT_ICON[theme]
  const nav = THEME_NAV[theme]
  const greeting = `Ahoj, ${child.name}! 👋`

  return (
    <div className={styles.kidApp} style={vars}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{THEME_AVATAR[theme]}</div>
        {nav.map((n, i) => (
          <button
            key={i}
            className={`${styles.navItem} ${activeNav === i ? styles.navActive : ''}`}
            onClick={() => setActiveNav(i)}
          >
            <span className={styles.navEmoji}>{n.i}</span>
            <span className={styles.navLabel}>{n.l}</span>
          </button>
        ))}
        <div className={styles.navSpacer} />
        <div className={styles.pointsBadge}>
          <span className={styles.badgeNum}>{totalPts}</span>
          <span className={styles.badgeIcon}>{ptIcon}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.topbar}>
          <span className={styles.greeting}>{greeting}</span>
          <span className={styles.dateLabel}>{czDate()}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Odejít</button>
        </div>

        <div className={styles.scrollArea}>

          {/* Morning routine */}
          <div className={styles.morningBand}>
            <div className={styles.morningHeader}>
              <span className={styles.morningTitle}>{morningTitleFull}</span>
              {streak > 0 && <span className={styles.streakBadge}>🔥 {streak} {streak === 1 ? 'den' : streak < 5 ? 'dny' : 'dní'} v řadě!</span>}
            </div>
            <div className={styles.morningSteps}>
              {steps.map((s, i) => {
                const done = morningDone[i] ?? false
                const isCur = !done && morningDone.slice(0, i).every(Boolean)
                return (
                  <div key={i} className={styles.step}>
                    {i > 0 && <span className={styles.stepArrow}>›</span>}
                    <div
                      className={[
                        styles.stepIco,
                        done ? styles.stepDone : '',
                        isCur ? `${styles.stepCur} ${styles.stepCurAnim}` : '',
                      ].join(' ')}
                      onClick={() => toggleStep(i)}
                      title={s.l}
                    >
                      {s.i}
                    </div>
                    <span className={styles.stepLabel}>{s.l}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tasks */}
          <div className={styles.sectionHead}>{TASKS_HEADING[theme]}</div>
          {tasks.length === 0
            ? <p className={styles.emptyTasks}>Žádné úkoly na dnes. Skvělá práce! 🎉</p>
            : <div className={styles.tasksGrid}>
                {tasks.map(task => {
                  const isPending = task.status === 'PENDING_APPROVAL'
                  const isSubmitting = submitting === task.taskId
                  return (
                    <div key={task.taskId} className={styles.taskCard}>
                      <span className={styles.taskIco}>📋</span>
                      <span className={styles.taskName}>{task.title}</span>
                      <div className={styles.taskBot}>
                        <span className={styles.taskPts}>{ptIcon} {task.pointValue}</span>
                        <button
                          className={`${styles.taskBtn} ${isPending ? styles.btnWait : styles.btnGo}`}
                          onClick={() => handleSubmitTask(task)}
                          disabled={isPending || isSubmitting}
                        >
                          {isSubmitting ? '…' : isPending ? 'Čeká…' : 'Splněno!'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
          }

          {/* Rewards */}
          <div className={styles.sectionHead}>{REWARDS_HEADING[theme]}</div>
          <div className={styles.rewardsRow}>
            {rewards.map(r => {
              const unlocked = totalPts >= r.pointCost
              return (
                <div key={r.id} className={`${styles.rewardChip} ${unlocked ? styles.rewardLit : ''}`}>
                  <div className={styles.rewardIco}>🎁</div>
                  <div className={styles.rewardName}>{r.name}</div>
                  <div className={styles.rewardPts}>
                    {unlocked ? `${ptIcon} SPLNĚNO!` : `${ptIcon} ${r.pointCost}`}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  )
}
