import { useEffect, useState } from 'react'
import { getRewardCatalog, getTaskCatalog, importCatalog } from '../api/catalog'
import styles from './CatalogDialog.module.css'

const AUDIENCE_LABEL = { ALL: 'Pro všechny', YOUNG: 'Pro malé' }

export default function CatalogDialog({ familyId, children = [], onClose, onImported }) {
  const [tab,         setTab]         = useState('rewards') // 'rewards' | 'tasks'
  const [rewards,     setRewards]     = useState([])
  const [tasks,       setTasks]       = useState([])
  const [selected,    setSelected]    = useState({ rewards: new Set(), tasks: new Set() })
  const [assignments, setAssignments] = useState({})       // catalogKey -> childId
  const [prices,      setPrices]      = useState({})       // catalogKey -> price string
  const [loading,     setLoading]     = useState(true)
  const [importing,   setImporting]   = useState(false)
  const [result,      setResult]      = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getRewardCatalog(familyId), getTaskCatalog(familyId)]).then(([rw, tk]) => {
      setRewards(rw)
      setTasks(tk)
      setLoading(false)
    })
  }, [familyId])

  function toggle(kind, key) {
    setSelected(prev => {
      const next = new Set(prev[kind])
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...prev, [kind]: next }
    })
  }

  function selectAll(kind, list) {
    setSelected(prev => ({
      ...prev,
      [kind]: new Set(list.filter(i => !i.alreadyImported).map(i => i.catalogKey)),
    }))
  }

  function clearAll(kind) {
    setSelected(prev => ({ ...prev, [kind]: new Set() }))
  }

  async function handleImport() {
    const assignMap = {}
    const pricingMap = {}
    for (const [key, cId] of Object.entries(assignments)) {
      if (cId) assignMap[key] = cId
    }
    for (const [key, val] of Object.entries(prices)) {
      const n = parseInt(val, 10)
      if (n > 0) pricingMap[key] = n
    }

    setImporting(true)
    try {
      const res = await importCatalog(familyId, {
        rewardKeys: [...selected.rewards],
        taskKeys:   [...selected.tasks],
        assignments: assignMap,
        pricingOverrides: pricingMap,
      })
      setResult(res)
      onImported()
    } catch (e) {
      alert(e.message || 'Import se nezdařil.')
    } finally {
      setImporting(false)
    }
  }

  const currentList = tab === 'rewards' ? rewards : tasks
  const currentKey  = tab === 'rewards' ? 'rewards' : 'tasks'
  const totalSelected = selected.rewards.size + selected.tasks.size

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3 className={styles.title}>📦 Katalog</h3>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        {result ? (
          <div className={styles.resultView}>
            <div className={styles.resultIcon}>🎉</div>
            <div className={styles.resultText}>
              Importováno: <strong>{result.created}</strong> nových
              {result.skipped > 0 && `, přeskočeno: ${result.skipped} (již existující)`}
            </div>
            <button className={styles.btnPrimary} onClick={onClose}>Zavřít</button>
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'rewards' ? styles.tabActive : ''}`}
                onClick={() => setTab('rewards')}>
                🎁 Odměny {selected.rewards.size > 0 && <span className={styles.badge}>{selected.rewards.size}</span>}
              </button>
              <button className={`${styles.tab} ${tab === 'tasks' ? styles.tabActive : ''}`}
                onClick={() => setTab('tasks')}>
                ✅ Úkoly {selected.tasks.size > 0 && <span className={styles.badge}>{selected.tasks.size}</span>}
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Načítám katalog…</div>
            ) : (
              <>
                <div className={styles.listActions}>
                  <button className={styles.linkBtn} onClick={() => selectAll(currentKey, currentList)}>Vybrat vše</button>
                  <button className={styles.linkBtn} onClick={() => clearAll(currentKey)}>Zrušit výběr</button>
                </div>

                <div className={styles.list}>
                  {currentList.map(item => {
                    const key       = item.catalogKey
                    const isRw      = tab === 'rewards'
                    const isSel     = selected[currentKey].has(key)
                    const isYoung   = item.audience === 'YOUNG'

                    return (
                      <div key={key}
                        className={`${styles.item} ${item.alreadyImported ? styles.imported : ''} ${isSel ? styles.selected : ''}`}
                        onClick={() => !item.alreadyImported && toggle(currentKey, key)}>
                        <div className={styles.itemLeft}>
                          <input type="checkbox" checked={isSel || item.alreadyImported}
                            readOnly disabled={item.alreadyImported} />
                          <div>
                            <div className={styles.itemName}>
                              {isRw ? item.name : item.title}
                              {isYoung && <span className={styles.young}>👶</span>}
                            </div>
                            {item.description && <div className={styles.itemDesc}>{item.description}</div>}
                            <div className={styles.itemMeta}>
                              {isRw ? `${item.pointCost} bodů · ${item.tier}` : `${item.points} b · ${item.kind}`}
                              {' · '}<span className={styles.audience}>{AUDIENCE_LABEL[item.audience]}</span>
                            </div>
                          </div>
                        </div>

                        {isSel && isRw && (
                          <div className={styles.itemOptions} onClick={e => e.stopPropagation()}>
                            <input type="number" min="1" placeholder={item.pointCost}
                              value={prices[key] ?? ''}
                              onChange={e => setPrices(p => ({ ...p, [key]: e.target.value }))}
                              className={styles.priceOverride}
                              title="Přepsat cenu" />
                          </div>
                        )}

                        {isSel && isYoung && children.length > 0 && (
                          <div className={styles.itemOptions} onClick={e => e.stopPropagation()}>
                            <select
                              value={assignments[key] ?? ''}
                              onChange={e => setAssignments(a => ({ ...a, [key]: e.target.value }))}
                              className={styles.childSelect}>
                              <option value="">— Přiřadit dítě —</option>
                              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        )}

                        {item.alreadyImported && <span className={styles.importedBadge}>✓ Importováno</span>}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div className={styles.footer}>
              <span className={styles.footerCount}>{totalSelected} vybráno</span>
              <button className={styles.btnCancel} onClick={onClose}>Zrušit</button>
              <button className={styles.btnPrimary} disabled={totalSelected === 0 || importing}
                onClick={handleImport}>
                {importing ? 'Importuji…' : 'Importovat'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
