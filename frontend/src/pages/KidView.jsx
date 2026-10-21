import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren, getProgress, openChest, updateAppearance } from '../api/children'
import { submitTask, getOpenQuests, claimQuest, getTodayTasks, toggleStep as apiToggleStep, submitRoutine } from '../api/tasks'
import { getRewards } from '../api/rewards'
import { getTransactionsByChild } from '../api/pointTransactions'
import { redeemReward, getRedemptionsByChild, cancelRedemption } from '../api/redemptions'
import { getLevelName } from '../constants/levels'
import styles from './KidView.module.css'

// ── Theme mapping ─────────────────────────────────────────────────────────────
const THEME_MAP = { elsa: 'frozen', unicorn: 'unicorn', hotwheels: 'minecraft', minecraft: 'minecraft' }
const THEME_AVATAR   = { frozen: '❄️', unicorn: '🦄', minecraft: '⛏️' }
const THEME_PT_ICON  = { frozen: '❄️', unicorn: '✨', minecraft: '💎' }

const THEME_NAV = {
  frozen:    [{ i: '⚔️', l: 'Výzvy' }, { i: '🏰', l: 'Mapa' }, { i: '🎁', l: 'Odměny' }, { i: '👑', l: 'Trofeje' }, { i: '👤', l: 'Já' }],
  unicorn:   [{ i: '🦄', l: 'Výzvy' }, { i: '🌈', l: 'Mapa' }, { i: '🎁', l: 'Odměny' }, { i: '⭐', l: 'Trofeje' }, { i: '👤', l: 'Já' }],
  minecraft: [{ i: '⛏️', l: 'Výzvy' }, { i: '🗺️', l: 'Mapa' }, { i: '💎', l: 'Odměny' }, { i: '🏆', l: 'Trofeje' }, { i: '👤', l: 'Já' }],
}

const MORNING_TITLE = { frozen: '❄️ Ranní kouzlo', unicorn: '🌈 Ranní magie', minecraft: '⛏️ Ranní výzva' }
const MORNING_STEPS = {
  frozen: {
    school:    [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }, { i: '🎒', l: 'Batoh' }],
    preschool: [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }],
  },
  unicorn: {
    school:    [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zoubky' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaňka' }, { i: '🎒', l: 'Batoh' }],
    preschool: [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zoubky' }, { i: '👗', l: 'Obléct' }, { i: '🥣', l: 'Snídaňka' }],
  },
  minecraft: {
    school:    [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👕', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }, { i: '🎒', l: 'Batoh' }],
    preschool: [{ i: '🌅', l: 'Vstát' }, { i: '🪥', l: 'Zuby' }, { i: '👕', l: 'Obléct' }, { i: '🥣', l: 'Snídaně' }],
  },
}

const TASK_HEADING   = { frozen: '⚔️ Dnešní výzvy', unicorn: '🦄 Dnešní kouzla', minecraft: '⛏️ Dnešní výzvy' }
const REWARD_HEADING = { frozen: '🎁 Moje odměny',  unicorn: '🌈 Moje odměny',  minecraft: '💎 Odměny' }
const TROPHY_HEADING = { frozen: '👑 Trofeje',       unicorn: '⭐ Hvězdičky',    minecraft: '🏆 Trofeje' }

// ── CSS variable sets ─────────────────────────────────────────────────────────
const THEME_VARS = {
  frozen: {
    '--kbg': 'linear-gradient(170deg,#061a35 0%,#0e3a6e 45%,#1a6eaa 80%,#4eb8e8 100%)',
    '--kcard': 'rgba(100,200,255,0.10)', '--kcardb': 'rgba(180,230,255,0.18)', '--kr': '16px',
    '--ksb': 'rgba(4,14,36,0.35)', '--ksbdiv': 'rgba(100,200,255,0.10)',
    '--kbdg': 'linear-gradient(135deg,#c8ecff,#80d0f8)', '--kbdgf': '#04213a',
    '--kglow': 'rgba(100,200,255,0.45)', '--kpts': '#a8dcff', '--kdim': 'rgba(255,255,255,0.40)',
    '--ksh': 'rgba(180,230,255,0.85)', '--kbtng': 'linear-gradient(135deg,#4eb8e8,#1a85c4)',
    '--kbtnw': 'linear-gradient(135deg,#c8ecff,#80d0f8)', '--kbtnwf': '#04213a',
    '--kdone': 'rgba(100,200,255,0.18)', '--kcur': 'linear-gradient(135deg,#c8ecff,#80d0f8)', '--kcurf': '#04213a',
    '--ktrack': 'rgba(100,200,255,0.20)', '--kfill': 'linear-gradient(90deg,#4eb8e8,#c8ecff)',
    '--kacc': '#4eb8e8',
  },
  unicorn: {
    '--kbg': 'linear-gradient(170deg,#1a052e 0%,#5b1280 45%,#b5198f 80%,#f472b6 100%)',
    '--kcard': 'rgba(240,100,200,0.11)', '--kcardb': 'rgba(255,180,240,0.20)', '--kr': '20px',
    '--ksb': 'rgba(20,4,40,0.30)', '--ksbdiv': 'rgba(240,100,200,0.10)',
    '--kbdg': 'linear-gradient(135deg,#f9a8d4,#e879f9)', '--kbdgf': '#2d0050',
    '--kglow': 'rgba(232,121,249,0.45)', '--kpts': '#f9a8d4', '--kdim': 'rgba(255,255,255,0.38)',
    '--ksh': 'rgba(249,168,212,0.90)', '--kbtng': 'linear-gradient(135deg,#e879f9,#a21caf)',
    '--kbtnw': 'linear-gradient(135deg,#f9a8d4,#e879f9)', '--kbtnwf': '#2d0050',
    '--kdone': 'rgba(200,50,200,0.18)', '--kcur': 'linear-gradient(135deg,#f9a8d4,#e879f9)', '--kcurf': '#2d0050',
    '--ktrack': 'rgba(240,100,200,0.20)', '--kfill': 'linear-gradient(90deg,#e879f9,#f9a8d4)',
    '--kacc': '#e879f9',
  },
  minecraft: {
    '--kbg': 'linear-gradient(180deg,#71b5d4 0%,#71b5d4 55%,#5a8c3c 55%,#5a8c3c 67%,#7a4f1e 67%,#7a4f1e 100%)',
    '--kcard': 'rgba(0,0,0,0.58)', '--kcardb': 'rgba(140,140,140,0.32)', '--kr': '3px',
    '--ksb': 'rgba(0,0,0,0.38)', '--ksbdiv': 'rgba(120,120,120,0.20)',
    '--kbdg': 'linear-gradient(135deg,#00e5ff,#0098c4)', '--kbdgf': '#001820',
    '--kglow': 'rgba(0,200,255,0.45)', '--kpts': '#00e5ff', '--kdim': 'rgba(255,255,255,0.40)',
    '--ksh': 'rgba(200,240,200,0.90)', '--kbtng': 'linear-gradient(135deg,#5ac05a,#2e8b2e)',
    '--kbtnw': 'linear-gradient(135deg,#00e5ff,#0098c4)', '--kbtnwf': '#001820',
    '--kdone': 'rgba(0,180,0,0.20)', '--kcur': 'linear-gradient(135deg,#00e5ff,#0098c4)', '--kcurf': '#001820',
    '--ktrack': 'rgba(0,200,255,0.20)', '--kfill': 'linear-gradient(90deg,#5ac05a,#00e5ff)',
    '--kacc': '#5ac05a',
  },
}

// ── Canvas particles ──────────────────────────────────────────────────────────
function buildParticles(type, W, H) {
  if (type === 'snow') {
    return Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.4, a: Math.random() * 0.7 + 0.25,
      vx: (Math.random() - 0.5) * 0.12, vy: Math.random() * 0.16 + 0.06,
      d: Math.random() * Math.PI * 2,
    }))
  }
  if (type === 'sparkle') {
    const cols = ['#f9a8d4', '#e879f9', '#c084fc', '#facc15', '#67e8f9', '#fb923c']
    return Array.from({ length: 65 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.8 + 0.2,
      c: cols[i % cols.length], d: Math.random() * Math.PI * 2, sp: Math.random() * 0.04 + 0.015,
    }))
  }
  const cols = ['#5a8c3c', '#7a4f1e', '#888', '#71b5d4', '#8b6914']
  return Array.from({ length: 32 }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    sz: (Math.floor(Math.random() * 3) + 1) * 2,
    c: cols[i % cols.length], vy: Math.random() * 0.35 + 0.1, a: Math.random() * 0.5 + 0.25,
  }))
}

function drawParticles(ctx, parts, type, t, W, H) {
  ctx.clearRect(0, 0, W, H)
  parts.forEach(p => {
    if (type === 'snow') {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,230,255,${p.a * (0.6 + 0.4 * Math.sin(t * 0.8 + p.d))})`
      ctx.fill(); p.x += p.vx; p.y += p.vy
      if (p.y > H) { p.y = -4; p.x = Math.random() * W }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
    } else if (type === 'sparkle') {
      const al = p.a * (0.5 + 0.5 * Math.sin(t * 60 * p.sp + p.d))
      ctx.globalAlpha = al; ctx.fillStyle = p.c
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1; p.d += p.sp
    } else {
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t * 0.4 + p.x * 0.02))
      ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.sz, p.sz)
      ctx.globalAlpha = 1; p.y += p.vy
      if (p.y > H) { p.y = -p.sz; p.x = Math.random() * W }
    }
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS_CZ   = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
const MONTHS_CZ = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.']
function czDate() {
  const d = new Date()
  return `${DAYS_CZ[d.getDay()]}, ${d.getDate()}. ${MONTHS_CZ[d.getMonth()]}`
}
function todayKey() { return new Date().toISOString().slice(0, 10) }

function loadMorning(childId, count) {
  try {
    const raw = localStorage.getItem(`morning_${childId}_${todayKey()}`)
    if (raw) { const a = JSON.parse(raw); if (Array.isArray(a) && a.length === count) return a }
  } catch { /**/ }
  return Array(count).fill(false)
}
function saveMorning(childId, state) {
  try { localStorage.setItem(`morning_${childId}_${todayKey()}`, JSON.stringify(state)) } catch { /**/ }
}
const LEGACY_REASON_MAP = {
  'Points added manually':    'Body od rodičů',
  'Points deducted manually': 'Oprava bodů',
}

function txLabel(tx) {
  if ((tx.type === 'TASK' || tx.type === 'BONUS') && tx.taskTitle) return tx.taskTitle
  if (tx.reason && LEGACY_REASON_MAP[tx.reason]) return LEGACY_REASON_MAP[tx.reason]
  if (!tx.reason) return '—'
  const m = tx.reason.match(/^Completed task:\s*(.+)$/i)
  return m ? m[1] : tx.reason
}
function czShortDate(isoStr) {
  try {
    const d = new Date(isoStr)
    return `${d.getDate()}. ${MONTHS_CZ[d.getMonth()]} ${d.getFullYear()}`
  } catch { return '' }
}

// ── Child picker ──────────────────────────────────────────────────────────────
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

const TAB_SEGS = ['today', 'map', 'shop', 'trophies', 'me']

const MAP_STAGES = {
  frozen: [
    'Vesnice', 'Ledové jezero', 'Ledový les', 'Horský průsmyk',
    'Ledový hrad', 'Sněžná bouře', 'Ledová jeskyně', 'Polární noc',
    'Severní hvězda', 'Věčný led', 'Koruna hor', 'Trůnní sál',
  ],
  unicorn: [
    'Louka', 'Duhový most', 'Oblaka', 'Hvězdné pole',
    'Měsíční krajina', 'Duhový les', 'Krystalová jeskyně', 'Vílí rybník',
    'Oblačný hrad', 'Hvězdná brána', 'Hvězdný palác', 'Duhový hrad',
  ],
  minecraft: [
    'Les', 'Jeskyně', 'Železný důl', 'Zlatý důl',
    'Diamantová hloubka', 'Nether', 'Pevnost Netheru', 'Ohnivé bažiny',
    'Basaltové delta', 'End ostrov', 'End City', 'Drakova aréna',
  ],
}
const MAP_STAGE_ICO = {
  frozen: ['🏘️', '🧊', '🌲', '🏔️', '🏰', '🌨️', '🗻', '🌑', '⭐', '❄️', '👑', '💎'],
  unicorn: ['🌸', '🌈', '☁️', '⭐', '🌙', '🦋', '💎', '🏊', '🏰', '🌠', '🌟', '🦄'],
  minecraft: ['🌲', '🕳️', '⛏️', '💰', '💎', '🔥', '🏯', '🌋', '🪨', '🌌', '🏙️', '🐉'],
}

const BADGE_META = {
  LUMBERJACK:   { i: '🪵', n: 'Dřevorubec' },
  SHERLOCK:     { i: '🔍', n: 'Detektiv chyb' },
  SELF_STARTER: { i: '🚀', n: 'Samostatný' },
  HEAD_WAITER:  { i: '🍽️', n: 'Vrchní číšník' },
  TIDY:        { i: '🧹', n: 'Uklízeč' },
  LAUNDRY_PRO: { i: '🧺', n: 'Prací mistr' },
  STREAK_7:    { i: '🔥', n: '7 dní v řadě' },
  STREAK_30:   { i: '💥', n: '30 dní v řadě' },
  EARLY_BIRD:  { i: '🐦', n: 'Pilný včelek (10 úkolů)' },
  FIRST_REWARD:{ i: '🎁', n: 'První odměna' },
  TEAM_PLAYER: { i: '👥', n: 'Týmový hráč (50 úkolů)' },
}

const SKINS = [
  { id: 'elsa',      emoji: '❄️',  name: 'Elsa',       minLevel: 1 },
  { id: 'unicorn',   emoji: '🦄',  name: 'Jednorožec', minLevel: 1 },
  { id: 'hotwheels', emoji: '🏎️', name: 'Hot Wheels', minLevel: 2 },
  { id: 'minecraft', emoji: '⛏️', name: 'Minecraft',  minLevel: 2 },
  { id: 'dragon',    emoji: '🐉',  name: 'Drak',       minLevel: 3 },
  { id: 'robot',     emoji: '🤖',  name: 'Robot',      minLevel: 3 },
  { id: 'wizard',    emoji: '🧙',  name: 'Kouzelník',  minLevel: 4 },
  { id: 'ninja',     emoji: '🥷',  name: 'Ninja',      minLevel: 4 },
  { id: 'astronaut', emoji: '🧑‍🚀', name: 'Astronaut', minLevel: 5 },
  { id: 'fairy',     emoji: '🧚',  name: 'Víla',       minLevel: 5 },
]

const TX_ICONS = { TASK: '📝', BONUS: '🔍', STREAK: '🔥', CHEST: '🧰', REDEEM: '🎁', MANUAL: '✋' }

// ── Main KidView page ─────────────────────────────────────────────────────────
export default function KidView() {
  const { logout }  = useAuth()
  const navigate    = useNavigate()
  const canvasRef   = useRef(null)
  const rafRef      = useRef(null)
  const partsRef    = useRef([])
  const t0Ref       = useRef(performance.now())
  const prevLevelRef = useRef(null)

  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [familyId,     setFamilyId]     = useState('')
  const [allChildren,  setAllChildren]  = useState([])
  const [child,        setChild]        = useState(null)
  const [tasks,        setTasks]        = useState([])
  const [rewards,      setRewards]      = useState([])
  const [transactions, setTransactions] = useState([])
  const [progress,     setProgress]     = useState(null)
  const [redemptions,  setRedemptions]  = useState([])
  const [openQuestTemplates, setOpenQuestTemplates] = useState([])
  const [claiming,     setClaiming]     = useState(null)
  const [routineData,  setRoutineData]  = useState(null)
  const [togglingStep, setTogglingStep] = useState(null)
  const [submittingRoutine, setSubmittingRoutine] = useState(false)
  const [submitting,      setSubmitting]      = useState(null)
  const [confirmRedeemId, setConfirmRedeemId] = useState(null)
  const [showFreshStart,  setShowFreshStart]  = useState(false)

  const { tab }   = useParams()
  const activeNav = TAB_SEGS.includes(tab) ? TAB_SEGS.indexOf(tab) : 0
  const [redeeming,    setRedeeming]    = useState(null)
  const [chestToast,   setChestToast]   = useState(null)
  const [levelUpAnim,  setLevelUpAnim]  = useState(false)

  const totalPts = progress?.balance ?? 0
  const streak   = progress?.streakDays ?? 0

  const theme        = child ? (THEME_MAP[child.avatar] || 'frozen') : 'frozen'
  const particleType = theme === 'frozen' ? 'snow' : theme === 'unicorn' ? 'sparkle' : 'pixel'
  const ageGroup     = (child?.age != null && child.age < 5) ? 'preschool' : 'school'
  const steps        = child ? MORNING_STEPS[theme][ageGroup] : []
  const ptIcon       = THEME_PT_ICON[theme]
  const nav          = THEME_NAV[theme]

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        const fId = me.familyId
        if (!fId) { setError('Tvůj účet není propojen s rodinou.'); return }
        setFamilyId(fId)
        const ch = await getChildren(fId)
        setAllChildren(ch)
        const storedId = localStorage.getItem('kid_selectedChildId')
        const stored   = storedId ? ch.find(c => c.id === storedId) : null
        if (stored) await selectChild(stored, fId)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load child data ───────────────────────────────────────────────────────
  async function selectChild(c, fId) {
    try {
      const fIdToUse = fId || familyId
      localStorage.setItem('kid_selectedChildId', c.id)
      const t = THEME_MAP[c.avatar] || 'frozen'
      const ag = (c.age != null && c.age < 5) ? 'preschool' : 'school'
      const stepCount = MORNING_STEPS[t][ag].length
      const [todayRes, rwArr, txArr, prog, redArr, oqArr] = await Promise.all([
        getTodayTasks(c.id),
        getRewards(fIdToUse),
        getTransactionsByChild(c.id),
        getProgress(c.id),
        getRedemptionsByChild(c.id),
        getOpenQuests(fIdToUse),
      ])
      setChild(c)
      setRoutineData(todayRes.routine ?? null)
      setTasks(todayRes.tasks ?? [])
      setRewards(rwArr
        .filter(r => r.active && !r.archivedAt && (!r.childId || r.childId === c.id))
        .sort((a, b) => a.pointCost - b.pointCost))
      setTransactions([...txArr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setProgress(prog)
      setRedemptions(redArr)
      setOpenQuestTemplates(oqArr)

      // Level-up fix: seed prevLevelRef from localStorage to avoid false animation after reset
      try {
        const saved = JSON.parse(localStorage.getItem('kq.prevLevel') || 'null')
        if (saved && saved.childId === c.id) {
          if (saved.level > prog.level) {
            prevLevelRef.current = prog.level
          }
          // if saved.level <= prog.level, leave prevLevelRef as-is so renderMapa can detect a real level-up
        } else {
          prevLevelRef.current = prog.level
        }
      } catch { prevLevelRef.current = prog.level }

      // Fresh-start welcome screen
      try {
        const seenKey = `kq.freshStartSeen.${c.id}`
        if (!localStorage.getItem(seenKey) && prog.xp === 0 && prog.balance === 0) {
          setShowFreshStart(true)
        }
      } catch { /**/ }
    } catch (e) { setError(e.message) }
  }

  // ── Back to picker (no logout) ────────────────────────────────────────────
  function backToPicker() {
    try { localStorage.removeItem('kid_selectedChildId') } catch { /**/ }
    setChild(null); setTasks([]); setRewards([]); setTransactions([])
    setProgress(null); setRedemptions([]); setOpenQuestTemplates([]); setRoutineData(null)
    navigate('/kid', { replace: true })
  }

  // ── Submit task ───────────────────────────────────────────────────────────
  async function handleSubmitTask(task) {
    if (task.status !== 'ASSIGNED') return
    setSubmitting(task.taskId)
    try {
      await submitTask(task.taskId)
      setTasks(prev => prev.map(t => t.taskId === task.taskId ? { ...t, status: 'PENDING_APPROVAL' } : t))
    } catch { /**/ } finally { setSubmitting(null) }
  }

  // ── Claim open quest ──────────────────────────────────────────────────────
  async function handleClaimQuest(template) {
    if (!child) return
    setClaiming(template.taskId)
    try {
      const claimed = await claimQuest(template.taskId, child.id)
      setTasks(prev => [...prev, claimed])
    } catch { /**/ } finally { setClaiming(null) }
  }

  // ── Toggle routine step (live API) ────────────────────────────────────────
  async function handleToggleStep(position) {
    if (!routineData || togglingStep !== null) return
    setTogglingStep(position)
    try {
      const updated = await apiToggleStep(routineData.taskId, position)
      setRoutineData(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.position === position ? { ...s, doneAt: updated.doneAt, returned: false } : s),
      }))
    } catch { /**/ } finally { setTogglingStep(null) }
  }

  async function handleSubmitRoutine() {
    if (!routineData || submittingRoutine) return
    setSubmittingRoutine(true)
    try {
      await submitRoutine(routineData.taskId)
      setRoutineData(prev => ({ ...prev, status: 'PENDING_APPROVAL', submittedAt: new Date().toISOString() }))
    } catch (e) { alert(e.message ?? 'Chyba při odesílání rutiny') } finally { setSubmittingRoutine(false) }
  }

  // ── Canvas ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    function resize() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight
      partsRef.current = buildParticles(particleType, canvas.width, canvas.height)
    }
    resize(); window.addEventListener('resize', resize)
    t0Ref.current = performance.now()
    function loop(ts) {
      const t = (ts - t0Ref.current) / 1000
      drawParticles(ctx, partsRef.current, particleType, t, canvas.width, canvas.height)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current) }
  }, [particleType])

  // Redirect bare /kid → /kid/today when a child is active
  useEffect(() => {
    if (child && !tab) navigate('/kid/today', { replace: true })
  }, [child, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist current level to localStorage so next session can detect resets
  useEffect(() => {
    if (child && progress) {
      try {
        localStorage.setItem('kq.prevLevel', JSON.stringify({ childId: child.id, level: progress.level }))
      } catch { /**/ }
    }
  }, [child?.id, progress?.level]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Section: Výzvy ───────────────────────────────────────────────────────
  function renderVyzvy() {
    const rd = routineData
    return (
      <>
        {/* Dynamic routine band */}
        {rd && (() => {
          const allDone = rd.steps.length > 0 && rd.steps.every(s => s.doneAt)
          const isApproved = rd.status === 'APPROVED'
          const isPending  = rd.status === 'PENDING_APPROVAL'
          const isLocked   = rd.locked
          const canAct     = !isPending && !isApproved && (!isLocked || rd.onTimeEligible)
          const doneCnt    = rd.steps.filter(s => s.doneAt).length
          const mTtl       = `${MORNING_TITLE[theme]} — Dnes: ${doneCnt}/${rd.steps.length}`
          return (
            <div className={styles.morningBand}>
              <div className={styles.morningHeader}>
                <span className={styles.morningTitle}>{mTtl}</span>
                {streak > 0 && (
                  <span className={styles.streakBadge}>
                    🔥 {streak} {streak === 1 ? 'den' : streak < 5 ? 'dny' : 'dní'} v řadě!
                  </span>
                )}
                <span className={styles.routineDeadline}>⏰ do {rd.deadline}</span>
              </div>

              {isApproved && <div className={styles.routineApproved}>✅ Schváleno! Skvělá práce!</div>}
              {isPending  && <div className={styles.routinePending}>🎉 Odesláno – čeká na rodiče…</div>}
              {isLocked && !rd.onTimeEligible && <div className={styles.routineLocked}>⏰ Termín vypršel</div>}

              <div className={styles.morningSteps}>
                {rd.steps.map((s, i) => {
                  const done       = !!s.doneAt
                  const returned   = s.returned
                  const isCur      = !done && rd.steps.slice(0, i).every(x => x.doneAt)
                  const isToggling = togglingStep === s.position
                  return (
                    <div key={s.id} className={styles.step}>
                      {i > 0 && <span className={styles.stepArrow}>›</span>}
                      <div
                        className={[
                          styles.stepIco,
                          done ? styles.stepDone : '',
                          isCur && canAct ? `${styles.stepCur} ${styles.stepCurAnim}` : '',
                          returned ? styles.stepReturned : '',
                        ].join(' ')}
                        onClick={() => canAct && !isToggling && handleToggleStep(s.position)}
                        style={{ cursor: canAct ? 'pointer' : 'default', opacity: isToggling ? 0.5 : 1 }}
                      >{s.icon}</div>
                      <span className={styles.stepLabel}>{s.label}</span>
                      {returned && <span style={{ fontSize: 10, color: '#f97316' }}>!</span>}
                    </div>
                  )
                })}
              </div>

              {canAct && allDone && !isPending && !isApproved && (
                <button
                  className={styles.routineSubmitBtn}
                  onClick={handleSubmitRoutine}
                  disabled={submittingRoutine}
                >
                  {submittingRoutine ? '…' : '🚀 Odeslat rodičům!'}
                </button>
              )}
            </div>
          )
        })()}


        {/* Tasks */}
        <div className={styles.sectionHead}>{TASK_HEADING[theme]}</div>
        {tasks.length === 0
          ? <p className={styles.emptyTasks}>Žádné úkoly na dnes. Skvělá práce! 🎉</p>
          : <div className={styles.tasksGrid}>
              {tasks.map(task => {
                const isPending    = task.status === 'PENDING_APPROVAL'
                const isSubmitting = submitting === task.taskId
                return (
                  <div key={task.taskId} className={styles.taskCard}>
                    <span className={styles.taskIco}>📋</span>
                    <span className={styles.taskName}>{task.title}</span>
                    {task.kind === 'HOMEWORK' && (
                      <span className={styles.taskHint}>Udělej ho včas, zkontroluj a oprav sám.</span>
                    )}
                    <div className={styles.taskBot}>
                      <span className={styles.taskPts}>
                        {task.kind === 'HOMEWORK'
                          ? `${ptIcon} ${task.pointValue}${task.bonusValue > 0 ? ` + 🔍${task.bonusValue}` : ''}${task.noReminderBonus > 0 ? ` + ${task.noReminderBonus}` : ''}`
                          : `${ptIcon} ${task.pointValue}`}
                      </span>
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

        {/* Rewards strip */}
        <div className={styles.sectionHead}>{REWARD_HEADING[theme]}</div>
        <div className={styles.rewardsRow}>
          {rewards.map(r => (
            <div key={r.id} className={`${styles.rewardChip} ${totalPts >= r.pointCost ? styles.rewardLit : ''}`}>
              <div className={styles.rewardIco}>🎁</div>
              <div className={styles.rewardName}>{r.name}</div>
              <div className={styles.rewardPts}>
                {totalPts >= r.pointCost ? `${ptIcon} Můžeš si ji vzít!` : `${ptIcon} ${r.pointCost}`}
              </div>
            </div>
          ))}
        </div>

        {/* Open quests */}
        {openQuestTemplates.length > 0 && (
          <>
            <div className={styles.sectionHead}>
              {theme === 'frozen' ? '🌟 Vedlejší výzvy' : theme === 'unicorn' ? '🌟 Speciální kouzla' : '🌟 Vedlejší questy'}
            </div>
            <div className={styles.tasksGrid}>
              {openQuestTemplates.map(qt => {
                const alreadyClaimed = tasks.some(t => t.templateId === qt.taskId)
                const isClaiming = claiming === qt.taskId
                return (
                  <div key={qt.taskId} className={styles.taskCard}>
                    <span className={styles.taskIco}>🌟</span>
                    <span className={styles.taskName}>{qt.title}</span>
                    {qt.description && <span style={{ fontSize: '10px', color: 'var(--kdim)', lineHeight: 1.3 }}>{qt.description}</span>}
                    <div className={styles.taskBot}>
                      <span className={styles.taskPts}>{ptIcon} {qt.pointValue}</span>
                      <button
                        className={`${styles.taskBtn} ${alreadyClaimed ? styles.btnWait : styles.btnGo}`}
                        onClick={() => !alreadyClaimed && handleClaimQuest(qt)}
                        disabled={alreadyClaimed || isClaiming}
                      >
                        {isClaiming ? '…' : alreadyClaimed ? 'Vzato ✓' : 'Vzít quest!'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </>
    )
  }

  // ── Section: Mapa ────────────────────────────────────────────────────────
  function renderMapa() {
    const level         = progress?.level ?? 1
    const xpPct         = progress?.progressPct ?? 0
    const xp            = progress?.xp ?? 0
    const maxLevel      = progress?.maxLevel ?? 12
    const prestigeStars = progress?.prestigeStars ?? 0
    const stages        = MAP_STAGES[theme] ?? MAP_STAGES.frozen
    const stageIco      = MAP_STAGE_ICO[theme] ?? MAP_STAGE_ICO.frozen
    const lvlWidth      = 100 / maxLevel

    const avatarPct = Math.min(((level - 1) + (xpPct / 100)) * lvlWidth, 98)
    const isMaxLevel = level >= maxLevel && prestigeStars > 0

    // Fire level-up overlay when level increases
    if (prevLevelRef.current !== null && prevLevelRef.current < level) {
      setLevelUpAnim(true)
      setTimeout(() => setLevelUpAnim(false), 4000)
    }
    prevLevelRef.current = level

    return (
      <>
        {/* Level title + prestige */}
        <div className={styles.xpMapHeader}>
          <span className={styles.xpMapLvl}>
            Úroveň {level}: {progress?.levelName ?? ''}
            {prestigeStars > 0 && <span className={styles.prestigeStars}>{' '}{'⭐'.repeat(Math.min(prestigeStars, 5))}</span>}
          </span>
          <span className={styles.xpMapXp}>{ptIcon} {xp} XP</span>
        </div>

        {/* Scrollable stage track */}
        <div className={styles.xpMapScroll}>
          <div className={styles.xpMapTrack} style={{ width: `${maxLevel * 120}px` }}>
            <div className={styles.xpMapFill} style={{ width: `${avatarPct}%` }} />

            {stages.slice(0, maxLevel).map((name, i) => {
              const posX = (i / maxLevel * 100).toFixed(1)
              const done = i < level - 1 || (i === level - 1 && xpPct >= 100)
              const locked = i >= level
              return (
                <div key={i} className={styles.xpMapNode} style={{ left: `${posX}%` }}>
                  <div className={[
                    styles.xpMapNodeDot,
                    done ? styles.xpMapNodeDone : i === level - 1 ? styles.xpMapNodeCur : '',
                    locked ? styles.xpMapNodeLocked : '',
                  ].join(' ')}>
                    {locked ? '🔒' : stageIco[i]}
                  </div>
                  <div className={styles.xpMapNodeLabel}>{name}</div>
                </div>
              )
            })}

            <div className={styles.xpMapAvatar} style={{ left: `${avatarPct}%` }}>
              {THEME_AVATAR[theme]}
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div className={styles.xpProgressRow}>
          <div className={styles.xpProgressBar}>
            <div className={styles.xpProgressFill} style={{ width: `${xpPct}%` }} />
          </div>
          <span className={styles.xpProgressLabel}>
            {isMaxLevel
              ? `⭐ Prestiž ${prestigeStars} — ${Math.round(xpPct)}% k další hvězdě`
              : `${progress?.currentThreshold} → ${progress?.nextThreshold} XP (${Math.round(xpPct)}%)`}
          </span>
        </div>
        {isMaxLevel && prestigeStars >= 1 && (
          <div className={styles.xpMaxLabel}>⚡ Maximální úroveň! Prestiž {'⭐'.repeat(prestigeStars)}</div>
        )}
      </>
    )
  }

  async function handleRedeem(reward) {
    if (!child) return
    setRedeeming(reward.id)
    try {
      const r = await redeemReward(child.id, reward.id)
      setRedemptions(prev => [...prev, r])
    } catch { /**/ } finally { setRedeeming(null) }
  }

  async function handleCancelRedemption(redemptionId) {
    try {
      const r = await cancelRedemption(redemptionId)
      setRedemptions(prev => prev.map(x => x.id === redemptionId ? r : x))
    } catch { /**/ }
  }

  // ── Section: Odměny ───────────────────────────────────────────────────────
  const REDEMPTION_STATUS_CZ = {
    REQUESTED: 'Čeká na schválení',
    APPROVED:  'Schváleno ✓',
    DELIVERED: 'Hotovo! 🎉',
    CANCELLED: 'Zrušeno',
  }

  function renderOdmeny() {
    const activeByRewardId = Object.fromEntries(
      redemptions
        .filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED')
        .map(r => [r.rewardId, r])
    )

    // Weekly limit: ISO week Monday at midnight
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - dayOfWeek); weekStart.setHours(0,0,0,0)
    function weeklyUsed(rewardId) {
      return redemptions.filter(r =>
        r.rewardId === rewardId &&
        ['REQUESTED','APPROVED','DELIVERED'].includes(r.status) &&
        new Date(r.createdAt) >= weekStart
      ).length
    }
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentRedemptions = [...redemptions]
      .filter(r => new Date(r.createdAt) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
      <>
        <div className={styles.odmenyHeader}>
          <span className={styles.odmenyTotal}>{ptIcon} {totalPts}</span>
          <span className={styles.odmenyTotalLbl}>bodů celkem</span>
        </div>
        <div className={styles.odmenyGrid}>
          {rewards.map(r => {
            const canAfford     = totalPts >= r.pointCost
            const barPct        = Math.min(totalPts / r.pointCost * 100, 100)
            const need          = Math.max(r.pointCost - totalPts, 0)
            const existing      = activeByRewardId[r.id]
            const isLoading     = redeeming === r.id
            const confirming    = confirmRedeemId === r.id
            const weeklyAtLimit = r.weeklyLimit != null && weeklyUsed(r.id) >= r.weeklyLimit
            return (
              <div key={r.id} className={`${styles.odmenyCard} ${canAfford && !weeklyAtLimit ? styles.odmenyDone : ''}`}>
                {weeklyAtLimit && <div className={styles.odmenyPendingBadge}>Znovu od pondělí 🔄</div>}
                {!weeklyAtLimit && existing?.status === 'APPROVED' && <div className={styles.odmenyDoneBadge}>SCHVÁLENO!</div>}
                {!weeklyAtLimit && existing?.status === 'REQUESTED' && <div className={styles.odmenyPendingBadge}>Čeká na rodiče…</div>}
                <div className={styles.odmenyIco}>{r.icon || '🎁'}</div>
                <div className={styles.odmenyName}>{r.name}</div>
                {r.description && <div className={styles.odmenyDesc}>{r.description}</div>}
                <div className={styles.odmenyBar}>
                  <div className={styles.odmenyFill} style={{ width: `${barPct}%` }} />
                </div>
                <div className={styles.odmenyInfo}>
                  <span>{ptIcon} {Math.min(totalPts, r.pointCost)} / {r.pointCost}</span>
                  {!canAfford && <span className={styles.odmenyNeed}>ještě {need} {ptIcon}</span>}
                </div>
                {canAfford && !existing && !confirming && !weeklyAtLimit && (
                  <button className={styles.redeemBtn}
                    onClick={() => setConfirmRedeemId(r.id)}>
                    🎁 Chci tuhle odměnu!
                  </button>
                )}
                {canAfford && !existing && confirming && !weeklyAtLimit && (
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmText}>Opravdu chceš?</span>
                    <button className={styles.confirmYes} disabled={isLoading}
                      onClick={() => { handleRedeem(r); setConfirmRedeemId(null) }}>
                      {isLoading ? '…' : 'Ano! 🎁'}
                    </button>
                    <button className={styles.confirmNo}
                      onClick={() => setConfirmRedeemId(null)}>
                      Ne
                    </button>
                  </div>
                )}
                {existing?.status === 'REQUESTED' && (
                  <button className={styles.cancelRedeemBtn}
                    onClick={() => handleCancelRedemption(existing.id)}>
                    Zrušit žádost
                  </button>
                )}
              </div>
            )
          })}
          {rewards.length === 0 && <p className={styles.emptyTasks}>Žádné odměny zatím nevytvořil rodič.</p>}
        </div>

        {recentRedemptions.length > 0 && (
          <>
            <div className={styles.sectionHead} style={{ marginTop: 24 }}>📋 Moje žádosti (30 dní)</div>
            <div className={styles.zadostiList}>
              {recentRedemptions.map(red => (
                <div key={red.id} className={styles.zadostiItem}>
                  <span className={styles.zadostiIco}>{red.rewardIcon || '🎁'}</span>
                  <div className={styles.zadostiInfo}>
                    <div className={styles.zadostiName}>{red.rewardName}</div>
                    <div className={styles.zadostiDate}>{czShortDate(red.createdAt)}</div>
                  </div>
                  <span className={`${styles.zadostiStatus} ${styles['zadosti_' + red.status]}`}>
                    {REDEMPTION_STATUS_CZ[red.status] ?? red.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    )
  }

  // ── Section: Trofeje ─────────────────────────────────────────────────────
  function renderTrofeje() {
    const badgeInfo = progress?.badgeInfo ?? []
    const sortedBadges = [...badgeInfo].sort((a, b) => {
      if (a.earned && !b.earned) return -1
      if (!a.earned && b.earned) return 1
      if (a.target && b.target) {
        const pctA = (a.current ?? 0) / a.target
        const pctB = (b.current ?? 0) / b.target
        return pctB - pctA
      }
      return 0
    })
    return (
      <>
        {/* 3 record cards */}
        <div className={styles.trophyStats}>
          <div className={styles.trophyStat}>
            <span className={styles.trophyStatN}>{progress?.recordTotalTasks ?? 0}</span>
            <span className={styles.trophyStatL}>📋 úkolů celkem</span>
          </div>
          <div className={styles.trophyStat}>
            <span className={styles.trophyStatN}>{progress?.recordLongestStreak ?? 0}</span>
            <span className={styles.trophyStatL}>🔥 nejdelší série</span>
          </div>
          <div className={styles.trophyStat}>
            <span className={styles.trophyStatN}>{progress?.recordBestDayTasks ?? 0}</span>
            <span className={styles.trophyStatL}>⭐ nejlepší den</span>
          </div>
        </div>

        <div className={styles.sectionHead}>{TROPHY_HEADING[theme]}</div>

        {sortedBadges.length === 0
          ? <p className={styles.emptyTasks}>Zatím žádné odznaky. Splň úkoly a získej je! 💪</p>
          : <div className={styles.badgeGrid}>
              {sortedBadges.map(b => {
                const meta = BADGE_META[b.badge] ?? { i: '🏅', n: b.badge }
                const pct  = b.target ? Math.min((b.current ?? 0) / b.target * 100, 100) : 0
                return (
                  <div key={b.badge} className={`${styles.badgeCard} ${b.earned ? styles.badgeEarned : ''}`}>
                    <div className={styles.badgeIco}>{meta.i}</div>
                    <div className={styles.badgeName}>{meta.n}</div>
                    {b.earned
                      ? <div className={styles.badgeDone}>Získáno ✓</div>
                      : b.target && (
                          <div className={styles.badgeProgress}>
                            <div className={styles.badgeBar}>
                              <div className={styles.badgeFill} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={styles.badgeCount}>{b.current ?? 0}/{b.target}</span>
                          </div>
                        )
                    }
                  </div>
                )
              })}
            </div>
        }
      </>
    )
  }

  // ── Section: Já ──────────────────────────────────────────────────────────
  function renderJa() {
    const level   = progress?.level ?? 1
    const xp      = progress?.xp ?? 0
    const xpPct   = progress?.progressPct ?? 0
    const xpNext  = progress?.nextThreshold ?? null

    const selectedAvatarLevel    = progress?.selectedAvatarLevel ?? level
    const selectedLandscapeLevel = progress?.selectedLandscapeLevel ?? level

    // Diary: last 50 transactions grouped by day
    const diary = transactions.slice(0, 50)
    const byDay = []
    diary.forEach(tx => {
      const day = tx.createdAt ? tx.createdAt.slice(0, 10) : 'unknown'
      const last = byDay[byDay.length - 1]
      if (!last || last.day !== day) byDay.push({ day, items: [tx] })
      else last.items.push(tx)
    })

    return (
      <div className={styles.meLayout}>
        {/* Left column */}
        <div className={styles.meLeft}>
          <div className={styles.meAvaBlock}>
            <div className={styles.meAvaEmoji}>{THEME_AVATAR[theme]}</div>
            <div className={styles.meName}>{child.name}</div>
            {child.age && <div className={styles.meAge}>{child.age} let</div>}
          </div>

          <div className={styles.meLevelCard}>
            <div className={styles.meLvlRow}>
              <span className={styles.meLvlNum}>Úroveň {level}</span>
              <span className={styles.meLvlName}>{getLevelName(child.avatar, level)}</span>
            </div>
            <div className={styles.meXpTrack}>
              <div className={styles.meXpFill} style={{ width: `${xpPct}%` }} />
            </div>
            <div className={styles.meXpLabel}>{xp} XP {xpNext ? `→ ${xpNext}` : '(max)'}</div>
          </div>

          <div className={styles.meStatsRow}>
            <div className={styles.meStat}>
              <span className={styles.meStatN}>{totalPts}</span>
              <span className={styles.meStatL}>{ptIcon} Mince</span>
            </div>
            <div className={styles.meStat}>
              <span className={styles.meStatN}>{progress?.recordTotalTasks ?? 0}</span>
              <span className={styles.meStatL}>📝 Úkoly</span>
            </div>
            <div className={styles.meStat}>
              <span className={styles.meStatN}>{streak}</span>
              <span className={styles.meStatL}>🔥 Série</span>
            </div>
          </div>

          {/* Wardrobe — avatar level picker */}
          <div className={styles.sectionHead}>🎨 Šatník — Postavička</div>
          <div className={styles.skinGrid}>
            {Array.from({ length: progress?.maxLevel ?? 12 }, (_, i) => i + 1).map(lvlNum => {
              const unlocked = lvlNum <= level
              const active   = selectedAvatarLevel === lvlNum
              return (
                <button
                  key={lvlNum}
                  className={`${styles.skinCard} ${active ? styles.skinActive : ''} ${!unlocked ? styles.skinLocked : ''}`}
                  disabled={!unlocked}
                  onClick={async () => {
                    if (!unlocked) return
                    try {
                      await updateAppearance(child.id, { avatarLevel: lvlNum })
                      setProgress(prev => ({ ...prev, selectedAvatarLevel: lvlNum }))
                    } catch { /**/ }
                  }}
                >
                  <span className={styles.skinEmoji}>{!unlocked ? '🔒' : THEME_AVATAR[theme]}</span>
                  <span className={styles.skinName}>{getLevelName(child.avatar, lvlNum)}</span>
                  {!unlocked && <span className={styles.skinLock}>Lv{lvlNum}</span>}
                </button>
              )
            })}
          </div>

          {/* Wardrobe — landscape level picker */}
          <div className={styles.sectionHead}>🗺️ Šatník — Krajina</div>
          <div className={styles.skinGrid}>
            {Array.from({ length: progress?.maxLevel ?? 12 }, (_, i) => i + 1).map(lvlNum => {
              const stages   = MAP_STAGES[theme] ?? MAP_STAGES.frozen
              const stageIco = MAP_STAGE_ICO[theme] ?? MAP_STAGE_ICO.frozen
              const unlocked = lvlNum <= level
              const active   = selectedLandscapeLevel === lvlNum
              return (
                <button
                  key={lvlNum}
                  className={`${styles.skinCard} ${active ? styles.skinActive : ''} ${!unlocked ? styles.skinLocked : ''}`}
                  disabled={!unlocked}
                  onClick={async () => {
                    if (!unlocked) return
                    try {
                      await updateAppearance(child.id, { landscapeLevel: lvlNum })
                      setProgress(prev => ({ ...prev, selectedLandscapeLevel: lvlNum }))
                    } catch { /**/ }
                  }}
                >
                  <span className={styles.skinEmoji}>{!unlocked ? '🔒' : (stageIco[lvlNum - 1] ?? '🌍')}</span>
                  <span className={styles.skinName}>{stages[lvlNum - 1] ?? `Krajina ${lvlNum}`}</span>
                  {!unlocked && <span className={styles.skinLock}>Lv{lvlNum}</span>}
                </button>
              )
            })}
          </div>

          {progress?.chestAvailable && (
            <button className={styles.chestBtn} onClick={async () => {
              try {
                const res = await openChest(child.id)
                const prog = await getProgress(child.id)
                setProgress(prog)
                setChestToast(`🎁 Pokladnice! +${res.awardedPoints} bodů`)
                setTimeout(() => setChestToast(null), 4000)
              } catch { /**/ }
            }}>
              🎁 Otevřít pokladnici!
            </button>
          )}

          <button className={styles.switchBtn} onClick={backToPicker}>👥 Změnit hráče</button>
          <button className={styles.logoutLink} onClick={() => { logout(); navigate('/login') }}>
            Odhlásit se
          </button>
        </div>

        {/* Right column — Diary */}
        <div className={styles.meRight}>
          <div className={styles.sectionHead}>📓 Deník</div>
          {byDay.length === 0 && <div className={styles.emptyState}>Zatím žádné záznamy.</div>}
          {byDay.map(group => (
            <div key={group.day} className={styles.diaryDay}>
              <div className={styles.diaryDayLabel}>{czShortDate(group.day + 'T00:00:00')}</div>
              {group.items.map(tx => (
                <div key={tx.id} className={styles.diaryEntry}>
                  <span className={styles.diaryIco}>{TX_ICONS[tx.type] ?? '📋'}</span>
                  <span className={styles.diaryText}>{tx.reason ?? tx.type}</span>
                  <span className={`${styles.diaryPts} ${tx.amount < 0 ? styles.diaryNeg : ''}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} {ptIcon}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Render states ─────────────────────────────────────────────────────────
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

  const vars = { ...THEME_VARS[theme] }

  return (
    <div className={styles.kidApp} style={vars}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.avatar} onClick={backToPicker} title="Zpět na výběr hráče">
          {THEME_AVATAR[theme]}
        </button>
        {nav.map((n, i) => (
          <button key={i}
            className={`${styles.navItem} ${activeNav === i ? styles.navActive : ''}`}
            onClick={() => navigate(`/kid/${TAB_SEGS[i]}`)}
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

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topbar}>
          <span className={styles.greeting}>Ahoj, {child.name}! 👋</span>
          <button className={styles.topXpBtn} onClick={() => navigate('/kid/map')} title="Mapa úrovní">
            <span className={styles.topXpPts}>{ptIcon} {totalPts}</span>
            <div className={styles.topXpTrack}>
              <div className={styles.topXpFill} style={{ width: `${progress?.progressPct ?? 0}%` }} />
            </div>
            <span className={styles.topXpLvl}>
              Lv{progress?.level ?? 1}
              {(progress?.prestigeStars ?? 0) > 0 && <span className={styles.topPrestige}>{' '}{'⭐'.repeat(Math.min(progress.prestigeStars, 3))}</span>}
            </span>
          </button>
          <button className={styles.switchTopBtn} onClick={backToPicker} title="Změnit hráče">
            👥
          </button>
        </div>

        <div className={styles.scrollArea}>
          {activeNav === 0 && renderVyzvy()}
          {activeNav === 1 && renderMapa()}
          {activeNav === 2 && renderOdmeny()}
          {activeNav === 3 && renderTrofeje()}
          {activeNav === 4 && renderJa()}
        </div>
      </main>
      {chestToast && <div className={styles.chestToast}>{chestToast}</div>}

      {levelUpAnim && (
        <div className={styles.levelUpOverlay} onClick={() => setLevelUpAnim(false)}>
          <div className={styles.levelUpCard}>
            <div className={styles.levelUpIcon}>🎉</div>
            <div className={styles.levelUpTitle}>Nová úroveň!</div>
            <div className={styles.levelUpName}>{progress?.levelName ?? ''}</div>
            <div className={styles.levelUpLevel}>Úroveň {progress?.level ?? ''}</div>
            <div className={styles.levelUpHint}>Klepni pro zavření</div>
          </div>
        </div>
      )}

      {showFreshStart && (
        <div className={styles.freshStartOverlay}>
          <div className={styles.freshStartCard}>
            <div className={styles.freshStartIcon}>🌅</div>
            <h2 className={styles.freshStartTitle}>Nový začátek!</h2>
            <p className={styles.freshStartText}>
              Všichni začínáme od nuly.<br />
              Nové úkoly, nové odměny, nové odznaky.<br />
              Kdo získá první odznak?
            </p>
            <button className={styles.freshStartBtn} onClick={() => {
              try { localStorage.setItem(`kq.freshStartSeen.${child.id}`, '1') } catch { /**/ }
              setShowFreshStart(false)
            }}>
              Jdu na to! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
