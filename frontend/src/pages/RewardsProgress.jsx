import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getRewards } from '../api/rewards'
import { getTransactionsByChild } from '../api/pointTransactions'
import { getAvatarSrc } from '../constants/avatars'
import Chest, { chestTier } from '../components/Chest'
import styles from './RewardsProgress.module.css'

const TIER_LABEL = { small: 'Bronze', medium: 'Silver', large: 'Gold' }

export default function RewardsProgress() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [children,  setChildren]  = useState([])
  const [rewards,   setRewards]   = useState([])
  const [points,    setPoints]    = useState({}) // { childId: totalPoints }
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        const familyId = me.familyId || localStorage.getItem('activeFamilyId')
        if (!familyId) { setLoading(false); return }

        const [ch, rw] = await Promise.all([getChildren(familyId), getRewards(familyId)])
        setChildren(ch)
        setRewards(rw.filter(r => r.active))

        const txResults = await Promise.all(ch.map(c => getTransactionsByChild(c.id)))
        const totals = {}
        ch.forEach((c, i) => {
          totals[c.id] = txResults[i].reduce((sum, tx) => sum + tx.amount, 0)
        })
        setPoints(totals)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleLogout() { logout(); navigate('/login') }

  const activeRewards = rewards.filter(r => r.active !== false)

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}><span>⭐</span><span>KidQuest</span></div>
        <nav className={styles.nav}>
          <a className={styles.navItem} href="/dashboard"><span>🏠</span> Dashboard</a>
          <a className={`${styles.navItem} ${styles.navActive}`} href="#"><span>🎁</span> Rewards Progress</a>
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}><span>🚪</span> Log out</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Rewards Progress</h1>
            <p className={styles.subtitle}>See how close each child is to unlocking their rewards.</p>
          </div>
        </header>

        {children.length === 0 && (
          <p className={styles.empty}>No children found. Add children from the dashboard first.</p>
        )}

        {children.map(child => {
          const total   = points[child.id] ?? 0
          const avatarSrc = getAvatarSrc(child.avatar)

          return (
            <div key={child.id} className={styles.childSection}>
              {/* Child header */}
              <div className={styles.childHeader}>
                <div className={styles.childAvatar}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt={child.name} className={styles.avatarImg} />
                    : <span className={styles.avatarEmoji}>👤</span>
                  }
                </div>
                <div>
                  <div className={styles.childName}>{child.name}</div>
                  <div className={styles.childAge}>Age {child.age}</div>
                </div>
                <div className={styles.pointsBadge}>
                  <span className={styles.pointsValue}>{total}</span>
                  <span className={styles.pointsLabel}>pts</span>
                </div>
              </div>

              {/* Rewards grid */}
              {activeRewards.length === 0
                ? <p className={styles.empty}>No active rewards yet.</p>
                : <div className={styles.rewardsRow}>
                    {activeRewards.map(reward => {
                      const unlocked = total >= reward.pointCost
                      const progress = Math.min(total / reward.pointCost, 1)
                      const tier     = chestTier(reward.pointCost)

                      return (
                        <div key={reward.id}
                          className={`${styles.rewardCard} ${unlocked ? styles.rewardUnlocked : ''}`}>
                          <div className={styles.chestWrap}>
                            <Chest pointCost={reward.pointCost} progress={progress} unlocked={unlocked} size={90} />
                            {unlocked && <div className={styles.unlockedBadge}>✓ Unlocked!</div>}
                          </div>
                          <div className={styles.rewardName}>{reward.name}</div>
                          <div className={styles.tierBadge} data-tier={tier}>{TIER_LABEL[tier]}</div>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
                          </div>
                          <div className={styles.progressLabel}>
                            {Math.min(total, reward.pointCost)} / {reward.pointCost} pts
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
          )
        })}
      </main>
    </div>
  )
}
