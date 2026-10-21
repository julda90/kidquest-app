import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getFamilies } from '../api/families'
import { getChildren, getEarningRate } from '../api/children'
import { getRewards, getRewardStats, createReward, updateReward, deleteReward, archiveReward, restoreReward } from '../api/rewards'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import RewardForm from '../components/RewardForm'
import CatalogDialog from '../components/CatalogDialog'
import styles from './Rewards.module.css'

const TIER_ORDER  = ['SMALL', 'MEDIUM', 'BIG', 'MEGA']
const TIER_LABELS = { SMALL: 'Malé', MEDIUM: 'Střední', BIG: 'Velké', MEGA: 'Mega' }
const TIER_PRICES = { SMALL: 50, MEDIUM: 150, BIG: 300, MEGA: 600 }

function daysOfWork(cost, avgDaily) {
  if (!avgDaily || avgDaily <= 0) return null
  return Math.ceil(cost / avgDaily)
}

export default function Rewards() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [familyId,      setFamilyId]      = useState('')
  const [families,      setFamilies]      = useState([])
  const [children,      setChildren]      = useState([])
  const [rewards,       setRewards]       = useState([])
  const [stats,         setStats]         = useState([])          // RewardStatResponse[]
  const [earningRates,  setEarningRates]  = useState([])          // EarningRateResponse[]
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [showArchived,  setShowArchived]  = useState(false)
  const [modal,         setModal]         = useState(null)        // { type: 'form'|'catalog', item }
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [editingPrice,  setEditingPrice]  = useState(null)        // rewardId
  const [priceInput,    setPriceInput]    = useState('')
  const [savingPrice,   setSavingPrice]   = useState(false)

  const load = useCallback(async (fId) => {
    if (!fId) return
    try {
      const [rw, st, kids, er] = await Promise.all([
        getRewards(fId, { includeArchived: true }),
        getRewardStats(fId),
        getChildren(fId),
        getEarningRate(fId),
      ])
      setRewards(rw)
      setStats(st)
      setChildren(kids)
      setEarningRates(er)
    } catch (e) { setError(e.message) }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const [me, fams] = await Promise.all([getMe(), getFamilies()])
        setFamilies(fams)
        const fId = me.familyId || localStorage.getItem('activeFamilyId') || ''
        setFamilyId(fId)
        await load(fId)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    })()
  }, [load])

  const avgDailyForChild = useCallback((childId) => {
    const r = earningRates.find(e => e.childId === childId)
    return r ? r.avgDaily : null
  }, [earningRates])

  const familyAvgDaily = useCallback(() => {
    if (!earningRates.length) return null
    return earningRates.reduce((s, e) => s + e.avgDaily, 0) / earningRates.length
  }, [earningRates])

  const statFor = (rewardId) => stats.find(s => s.rewardId === rewardId)

  const visible = rewards.filter(r => showArchived ? true : !r.archivedAt)
  const byTier  = TIER_ORDER.reduce((acc, t) => {
    acc[t] = visible.filter(r => r.tier === t)
    return acc
  }, {})

  function isMispriced(reward) {
    const expected = TIER_PRICES[reward.tier]
    if (!expected) return false
    return Math.abs(reward.pointCost - expected) / expected > 0.5
  }

  async function handleSaveReward(data) {
    if (modal.item) {
      await updateReward(modal.item.id, data)
    } else {
      await createReward(familyId, data)
    }
    setModal(null)
    await load(familyId)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteReward(deleteTarget.id)
    } catch (e) {
      if (e.message?.includes('koupil') || e.status === 409) {
        alert('Odměnu už někdo koupil. Použijte Archivovat místo mazání.')
      }
    }
    setDeleteTarget(null)
    setDeleting(false)
    await load(familyId)
  }

  async function handleArchive(reward) {
    await archiveReward(reward.id)
    await load(familyId)
  }

  async function handleRestore(reward) {
    await restoreReward(reward.id)
    await load(familyId)
  }

  async function handleSavePrice(reward) {
    const cost = parseInt(priceInput, 10)
    if (!cost || cost < 1) return
    setSavingPrice(true)
    await updateReward(reward.id, {
      name: reward.name, description: reward.description,
      pointCost: cost, active: reward.active, tier: reward.tier, icon: reward.icon,
      childId: reward.childId ?? null,
    })
    setSavingPrice(false)
    setEditingPrice(null)
    await load(familyId)
  }

  function handleLogout() { logout(); navigate('/login') }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  const mispriced = rewards.filter(r => !r.archivedAt && isMispriced(r))

  return (
    <div className={styles.layout}>
      <Sidebar active="rewards" onLogout={handleLogout} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Odměny</h1>
            <p className={styles.subtitle}>Správa odměn pro rodinu.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={() => setModal({ type: 'catalog' })}>
              📦 Katalog
            </button>
            <button className={styles.btnAdd} onClick={() => setModal({ type: 'form', item: null })}>
              + Přidat odměnu
            </button>
          </div>
        </header>

        {mispriced.length > 0 && (
          <div className={styles.banner}>
            ⚠️ {mispriced.length} odměn{mispriced.length > 1 ? '' : 'a'} má cenu velmi odlišnou od doporučené pro svůj tier.
            Zkontrolujte ceny pomocí ✏️ editace.
          </div>
        )}

        <div className={styles.toolbar}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)} />
            Zobrazit archivované
          </label>
        </div>

        {TIER_ORDER.map(tier => {
          const list = byTier[tier]
          if (!list.length) return null
          return (
            <section key={tier} className={styles.tierSection}>
              <h2 className={styles.tierTitle}>
                {TIER_LABELS[tier]}
                <span className={styles.tierHint}>doporučená cena: {TIER_PRICES[tier]} bodů</span>
              </h2>
              <div className={styles.rewardGrid}>
                {list.map(reward => {
                  const stat    = statFor(reward.id)
                  const avg     = reward.childId ? avgDailyForChild(reward.childId) : familyAvgDaily()
                  const days    = daysOfWork(reward.pointCost, avg)
                  const mispric = isMispriced(reward)
                  return (
                    <div key={reward.id}
                      className={`${styles.rewardCard} ${reward.archivedAt ? styles.archived : ''} ${mispric ? styles.mispriced : ''}`}>

                      <div className={styles.cardTop}>
                        <span className={styles.rewardIcon}>{reward.icon || '🎁'}</span>
                        <div className={styles.cardActions}>
                          {!reward.archivedAt && (
                            <button className={styles.iconBtn} title="Upravit"
                              onClick={() => setModal({ type: 'form', item: reward })}>✏️</button>
                          )}
                          {!reward.archivedAt && (
                            <button className={styles.iconBtn} title="Archivovat"
                              onClick={() => handleArchive(reward)}>🗄️</button>
                          )}
                          {reward.archivedAt && (
                            <button className={styles.iconBtn} title="Obnovit"
                              onClick={() => handleRestore(reward)}>♻️</button>
                          )}
                          {!stat && (
                            <button className={styles.iconBtn} title="Smazat"
                              onClick={() => setDeleteTarget({ id: reward.id, name: reward.name })}>🗑️</button>
                          )}
                        </div>
                      </div>

                      <div className={styles.rewardName}>{reward.name}</div>
                      {reward.childName && <div className={styles.childBadge}>👤 {reward.childName}</div>}

                      {editingPrice === reward.id ? (
                        <div className={styles.priceEdit}>
                          <input type="number" min="1" value={priceInput}
                            onChange={e => setPriceInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(reward); if (e.key === 'Escape') setEditingPrice(null) }}
                            autoFocus className={styles.priceInput} />
                          <button className={styles.priceSave} disabled={savingPrice}
                            onClick={() => handleSavePrice(reward)}>✓</button>
                          <button className={styles.priceCancel} onClick={() => setEditingPrice(null)}>✕</button>
                        </div>
                      ) : (
                        <div className={styles.priceRow}>
                          <span className={`${styles.rewardCost} ${mispric ? styles.warnCost : ''}`}>
                            ⭐ {reward.pointCost} bodů
                          </span>
                          {!reward.archivedAt && (
                            <button className={styles.editPriceBtn}
                              onClick={() => { setEditingPrice(reward.id); setPriceInput(String(reward.pointCost)) }}>
                              ✏️
                            </button>
                          )}
                        </div>
                      )}

                      {days != null && (
                        <div className={styles.daysHint}>≈ {days} d. práce</div>
                      )}

                      {stat && (
                        <div className={styles.statRow}>
                          🛒 {stat.purchases}× koupeno
                        </div>
                      )}

                      {reward.archivedAt && (
                        <div className={styles.archivedBadge}>Archivováno</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {visible.length === 0 && (
          <div className={styles.empty}>
            Zatím žádné odměny. Přidejte je ručně nebo importujte z katalogu.
          </div>
        )}
      </main>

      {modal?.type === 'form' && (
        <Modal title={modal.item ? 'Upravit odměnu' : 'Nová odměna'} onClose={() => setModal(null)}>
          <RewardForm
            initial={modal.item ?? {}}
            familyId={familyId}
            children={children}
            onSubmit={handleSaveReward}
            onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'catalog' && (
        <CatalogDialog
          familyId={familyId}
          children={children}
          onClose={() => setModal(null)}
          onImported={() => load(familyId)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Smazat odměnu "${deleteTarget.name}"? Tuto akci nelze vrátit.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting} />
      )}
    </div>
  )
}
