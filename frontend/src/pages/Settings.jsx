import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../api/families'
import { getRewards, createReward, updateReward, deleteReward } from '../api/rewards'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FamilyForm from '../components/FamilyForm'
import RewardForm from '../components/RewardForm'
import styles from './Settings.module.css'

const LANDSCAPE_OPTIONS = [
  { key: 'jungle',     label: 'Jungle',     icon: '🌴', colors: ['#0a2010','#287020'] },
  { key: 'desert',     label: 'Desert',     icon: '🌵', colors: ['#5ab8e8','#d4a050'] },
  { key: 'underwater', label: 'Underwater', icon: '🐠', colors: ['#0a2a5a','#020818'] },
  { key: 'moon',       label: 'Moon',       icon: '🌕', colors: ['#020410','#686868'] },
  { key: 'arctic',     label: 'Arctic',     icon: '❄️', colors: ['#080e22','#e8f4fc'] },
]

function getLandscapeKey(familyId) {
  const stored = localStorage.getItem(`landscape_${familyId}`)
  if (stored && LANDSCAPE_OPTIONS.some(o => o.key === stored)) return stored
  return null
}
function setLandscapeKey(familyId, key) {
  localStorage.setItem(`landscape_${familyId}`, key)
}

export default function Settings() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [familyId,     setFamilyId]     = useState('')
  const [landscapeKey, setLandscapeKeyState] = useState('')
  const [families,  setFamilies]  = useState([])
  const [rewards,   setRewards]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [modal,        setModal]        = useState(null) // { type: 'family'|'reward', item }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setFamilies(fams)
      const fId = me.familyId || localStorage.getItem('activeFamilyId')
      if (fId) {
        setFamilyId(fId)
        setRewards(await getRewards(fId))
        setLandscapeKeyState(getLandscapeKey(fId) ?? '')
      }
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

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

  async function handleSaveReward({ familyId: selectedFamilyId, ...data }) {
    if (modal.item) {
      await updateReward(modal.item.id, data)
    } else {
      await createReward(selectedFamilyId || familyId, data)
    }
    setModal(null)
    setRewards(await getRewards(familyId))
  }

  async function toggleRewardActive(reward) {
    await updateReward(reward.id, {
      name: reward.name, description: reward.description,
      pointCost: reward.pointCost, active: !reward.active,
    })
    setRewards(await getRewards(familyId))
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      if (deleteTarget.type === 'family') {
        await deleteFamily(deleteTarget.id)
        setFamilies(fs => fs.filter(f => f.id !== deleteTarget.id))
      } else {
        await deleteReward(deleteTarget.id)
        setRewards(await getRewards(familyId))
      }
      setDeleteTarget(null)
    } catch { setDeleteTarget(null) } finally { setDeleting(false) }
  }

  function handleLogout() { logout(); navigate('/login') }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="settings" onLogout={handleLogout} />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your families and rewards.</p>
        </header>

        {/* Families */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Families</h2>
            <button className={styles.btnAdd}
              onClick={() => setModal({ type: 'family', item: null })}>+ Add Family</button>
          </div>
          {families.length === 0
            ? <p className={styles.empty}>No families yet.</p>
            : <div className={styles.familyList}>
                {families.map(fam => (
                  <div key={fam.id} className={styles.familyCard}>
                    <span className={styles.familyIcon}>🏠</span>
                    <span className={styles.familyName}>{fam.name}</span>
                    <div className={styles.cardActions}>
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

        {/* Landscape */}
        {familyId && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Adventure Landscape</h2>
            </div>
            <p className={styles.landscapeHint}>
              Choose the world your family explores on the Rewards Progress page.
            </p>
            <div className={styles.landscapeGrid}>
              {LANDSCAPE_OPTIONS.map(opt => {
                const active = landscapeKey === opt.key
                return (
                  <button
                    key={opt.key}
                    className={`${styles.landscapeCard} ${active ? styles.landscapeActive : ''}`}
                    style={{ background: `linear-gradient(160deg, ${opt.colors[0]}, ${opt.colors[1]})` }}
                    onClick={() => {
                      setLandscapeKey(familyId, opt.key)
                      setLandscapeKeyState(opt.key)
                    }}>
                    <span className={styles.landscapeIcon}>{opt.icon}</span>
                    <span className={styles.landscapeLabel}>{opt.label}</span>
                    {active && <span className={styles.landscapeCheck}>✓</span>}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Rewards */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rewards</h2>
            <button className={styles.btnAdd}
              onClick={() => setModal({ type: 'reward', item: null })}>+ Add Reward</button>
          </div>
          {rewards.length === 0
            ? <p className={styles.empty}>No rewards yet. Add some to motivate your children!</p>
            : <div className={styles.rewardGrid}>
                {rewards.map(reward => (
                  <div key={reward.id} className={`${styles.rewardCard} ${!reward.active ? styles.rewardInactive : ''}`}>
                    <div className={styles.rewardTop}>
                      <span className={styles.rewardIcon}>🎁</span>
                      <div className={styles.rewardActions}>
                        <button className={styles.iconBtn} title="Edit"
                          onClick={() => setModal({ type: 'reward', item: reward })}>✏️</button>
                        <button className={styles.iconBtn} title="Delete"
                          onClick={() => setDeleteTarget({ type: 'reward', id: reward.id, name: reward.name })}>🗑️</button>
                      </div>
                    </div>
                    <div className={styles.rewardName}>{reward.name}</div>
                    {reward.description && <div className={styles.rewardDesc}>{reward.description}</div>}
                    <div className={styles.rewardCost}>⭐ {reward.pointCost} pts</div>
                    <button
                      className={`${styles.toggle} ${reward.active ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => toggleRewardActive(reward)}>
                      {reward.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
          }
        </section>
      </main>

      {modal?.type === 'family' && (
        <Modal title={modal.item ? 'Edit Family' : 'New Family'} onClose={() => setModal(null)}>
          <FamilyForm initial={modal.item ?? {}}
            onSubmit={handleSaveFamily} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'reward' && (
        <Modal title={modal.item ? 'Edit Reward' : 'New Reward'} onClose={() => setModal(null)}>
          <RewardForm initial={modal.item ?? {}} families={families}
            onSubmit={handleSaveReward} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting} />
      )}
    </div>
  )
}
