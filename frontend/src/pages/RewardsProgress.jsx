import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getRewards } from '../api/rewards'
import { getTransactionsByChild } from '../api/pointTransactions'
import { getAvatarSrc } from '../constants/avatars'
import landscapeImg from '../constants/landscapes/ChatGPT Image May 5, 2026, 10_40_21 AM.png'
import chestImg     from '../constants/resources/pngtree-old-rusty-closed-treasure-chest-side-view-transparent-png-image_8864712.png'
import Sidebar from '../components/Sidebar'
import styles from './RewardsProgress.module.css'

const IMG_W   = 2172
const IMG_H   = 724
const MAX_PTS = 1000

// 0, 20, 40, … 1000  (51 nodes)
const NODES = Array.from({ length: 51 }, (_, i) => i * 20)

// xStart/xEnd: node-0 and node-50 pixel positions; y: token-row centre.
const TRACK_DEFS = {
  rebeka: { xStart: 320, xEnd: 1895, y: 190, ringColor: '#60a5fa' },
  samuel: { xStart: 320, xEnd: 1895, y: 400, ringColor: '#f87171' },
  sara:   { xStart: 320, xEnd: 1895, y: 630, ringColor: '#c084fc' },
}

const CHEST_SIZE     = 70
const CHEST_HALF     = CHEST_SIZE / 2
// Distance above track.y to chest centre.
// Needs to be > CHEST_HALF + label_height (~27) so labels clear the track row.
const CHEST_Y_OFFSET = 75

const RING_COLORS = ['#667eea','#00b4d8','#f77f00','#e040fb','#2ec4b6','#e63946','#ffbd00','#06d6a0']

function getTrackKey(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('sara'))                           return 'sara'
  if (n.includes('samuel'))                         return 'samuel'
  if (n.includes('rebek') || n.includes('rebecca')) return 'rebeka'
  return null
}

function nodeX(nodeIndex, track) {
  const i = Math.min(nodeIndex, NODES.length - 1)
  return track.xStart + (i / (NODES.length - 1)) * (track.xEnd - track.xStart)
}

function rewardX(pts, track) {
  return track.xStart + (Math.min(pts, MAX_PTS) / MAX_PTS) * (track.xEnd - track.xStart)
}

// ── Chest (PNG) ──────────────────────────────────────────────────────────────
function Chest({ x, y, reward, unlocked }) {
  const filterId = `glow-${reward.id}`
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feColorMatrix type="matrix"
            values="1 0.8 0  0 0.3
                    0.8 0.6 0  0 0.1
                    0   0   0  0 0
                    0   0   0  1 0"
            result="gold" />
          <feGaussianBlur in="gold" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Drop shadow */}
      <ellipse cx={0} cy={CHEST_HALF + 4} rx={CHEST_HALF * 0.8} ry={6}
        fill="rgba(0,0,0,0.3)" />

      {/* Chest PNG — centered; gold glow filter + pulse animation when unlocked */}
      <image
        href={chestImg}
        x={-CHEST_HALF} y={-CHEST_HALF}
        width={CHEST_SIZE} height={CHEST_SIZE}
        filter={unlocked ? `url(#${filterId})` : undefined}
        className={unlocked ? styles.chestGlow : ''}
      />

      {/* Reward name above the chest */}
      <text
        y={-CHEST_HALF - 16}
        textAnchor="middle"
        fontSize="13" fontWeight="800"
        fill={unlocked ? '#ffd700' : '#ddd'}
        stroke="rgba(0,0,0,0.9)" strokeWidth="3" paintOrder="stroke"
      >
        {reward.name.length > 14 ? reward.name.slice(0, 13) + '…' : reward.name}
      </text>

      {/* Point cost above the chest, below the name */}
      <text
        y={-CHEST_HALF - 3}
        textAnchor="middle"
        fontSize="11" fontWeight="700"
        fill={unlocked ? '#ffd700' : '#aaa'}
        stroke="rgba(0,0,0,0.8)" strokeWidth="2.5" paintOrder="stroke"
      >
        ★ {reward.pointCost} pts
      </text>
    </g>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function AvatarOnPath({ x, y, src, uid, color }) {
  const R = 22
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse rx={R + 3} ry="6" cy={R + 3} fill="rgba(0,0,0,0.25)" />
      <circle r={R + 6} fill={color} opacity="0.2" />
      <circle r={R + 3} fill="none" stroke={color} strokeWidth="3" />
      <circle r={R}     fill="#e8e8f5" />
      {src ? (
        <>
          <defs><clipPath id={`av-${uid}`}><circle r={R} /></clipPath></defs>
          <image href={src} x={-R} y={-R} width={R * 2} height={R * 2}
            clipPath={`url(#av-${uid})`} preserveAspectRatio="xMidYMid slice" />
        </>
      ) : (
        <text textAnchor="middle" dominantBaseline="central" fontSize="22">👤</text>
      )}
      <circle r={R} fill="none" stroke="#fff" strokeWidth="2.5" />
    </g>
  )
}

// ── Scene ────────────────────────────────────────────────────────────────────
function LandscapeScene({ rewards, children, points }) {
  const childTracks = children.map((child, idx) => ({
    child, idx,
    trackKey:  getTrackKey(child.name),
    pts:       points[child.id] ?? 0,
    avatarSrc: getAvatarSrc(child.avatar),
  }))

  return (
    <svg width="100%" viewBox={`0 0 ${IMG_W} ${IMG_H}`}
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>

      <image href={landscapeImg} x="0" y="0" width={IMG_W} height={IMG_H}
        preserveAspectRatio="xMidYMid meet" />

      {/* ── Reward chests — aligned horizontal line below each track ── */}
      {Object.entries(TRACK_DEFS).map(([trackKey, track]) => {
        const ct       = childTracks.find(c => c.trackKey === trackKey)
        const childPts = ct?.pts ?? 0
        const chestY   = track.y - CHEST_Y_OFFSET

        return rewards.map(r => (
          <Chest key={`${trackKey}-${r.id}`}
            x={rewardX(r.pointCost, track)}
            y={chestY}
            reward={r}
            unlocked={childPts >= r.pointCost} />
        ))
      })}

      {/* ── Avatars — one per track, snapped to image nodes ── */}
      {childTracks.map(({ child, trackKey, pts, avatarSrc }) => {
        if (!trackKey || !TRACK_DEFS[trackKey]) return null
        const track     = TRACK_DEFS[trackKey]
        const nodeIndex = Math.min(Math.floor(pts / 20), NODES.length - 1)
        return (
          <AvatarOnPath key={child.id}
            x={nodeX(nodeIndex, track)} y={track.y}
            src={avatarSrc} color={track.ringColor}
            uid={child.id} />
        )
      })}
    </svg>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RewardsProgress() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [children, setChildren] = useState([])
  const [rewards,  setRewards]  = useState([])
  const [points,   setPoints]   = useState({})
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    async function load() {
      try {
        const me  = await getMe()
        const fId = me.familyId || localStorage.getItem('activeFamilyId')
        if (!fId) {
          console.warn('[KidQuest] No familyId on user and no activeFamilyId in localStorage — rewards will not load. User id:', me.id, 'email:', me.email)
          setError('Your account is not linked to a family. Please contact support or re-create your family.')
          return
        }
        const [ch, rw] = await Promise.all([getChildren(fId), getRewards(fId)])
        setChildren(ch)
        setRewards(rw.filter(r => r.active && r.pointCost <= MAX_PTS)
                     .sort((a, b) => a.pointCost - b.pointCost))
        const txs = await Promise.all(ch.map(c => getTransactionsByChild(c.id)))
        const totals = {}
        ch.forEach((c, i) => { totals[c.id] = txs[i].reduce((s, tx) => s + tx.amount, 0) })
        setPoints(totals)
      } catch (e) { setError(e.message) }
      finally     { setLoading(false) }
    }
    load()
  }, [])

  function handleLogout() { logout(); navigate('/login') }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="progress" onLogout={handleLogout} />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Rewards Progress</h1>
          <p className={styles.subtitle}>Reach 1 000 points to claim the top reward.</p>
        </header>

        {children.length === 0
          ? <p className={styles.empty}>No children found. Add children from the dashboard first.</p>
          : <>
              <div className={styles.roster}>
                {children.map((child, idx) => {
                  const total     = points[child.id] ?? 0
                  const avatarSrc = getAvatarSrc(child.avatar)
                  const trackKey  = getTrackKey(child.name)
                  const color     = trackKey ? TRACK_DEFS[trackKey].ringColor : RING_COLORS[idx % RING_COLORS.length]
                  return (
                    <div key={child.id} className={styles.rosterCard}>
                      <span className={styles.colorDot} style={{ background: color }} />
                      <div className={styles.rosterAvatar} style={{ border: `2.5px solid ${color}` }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt={child.name} className={styles.avatarImg} />
                          : <span className={styles.avatarEmoji}>👤</span>}
                      </div>
                      <div>
                        <div className={styles.rosterName}>{child.name}</div>
                        <div className={styles.rosterPts}>{total} / {MAX_PTS} pts</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.roadWrap}>
                <LandscapeScene rewards={rewards} children={children} points={points} />
              </div>
            </>
        }
      </main>
    </div>
  )
}
