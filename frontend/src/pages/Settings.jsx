import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getChildren } from '../api/children'
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../api/families'
import { getRoutines, createRoutine, updateRoutine, deleteRoutine } from '../api/routines'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FamilyForm from '../components/FamilyForm'
import styles from './Settings.module.css'

const DAYS = [
  { iso: 1, cz: 'Po' }, { iso: 2, cz: 'Út' }, { iso: 3, cz: 'St' },
  { iso: 4, cz: 'Čt' }, { iso: 5, cz: 'Pá' }, { iso: 6, cz: 'So' }, { iso: 7, cz: 'Ne' },
]
const DEFAULT_STEPS_SCHOOL    = [{ icon: '🌅', label: 'Vstát' }, { icon: '🪥', label: 'Zuby' }, { icon: '👕', label: 'Obléct' }, { icon: '🥣', label: 'Snídaně' }, { icon: '🎒', label: 'Batoh' }]
const DEFAULT_STEPS_PRESCHOOL = [{ icon: '🌅', label: 'Vstát' }, { icon: '🪥', label: 'Zuby' }, { icon: '👕', label: 'Obléct' }, { icon: '🥣', label: 'Snídaně' }]

function RoutineEditor({ routine, onSave, onCancel }) {
  const isNew = !routine?.id
  const defaultSteps = routine?.steps?.length
    ? routine.steps.map((s, i) => ({ position: i, icon: s.icon, label: s.label }))
    : (routine?._child?.age < 5 ? DEFAULT_STEPS_PRESCHOOL : DEFAULT_STEPS_SCHOOL)
        .map((s, i) => ({ ...s, position: i }))

  const [name,       setName]       = useState(routine?.name       ?? 'Ranní rutina')
  const [deadline,   setDeadline]   = useState(routine?.deadline   ?? '07:30')
  const [days,       setDays]       = useState(
    (routine?.daysOfWeek ?? '1,2,3,4,5').split(',').map(Number)
  )
  const [pointValue, setPointValue] = useState(routine?.pointValue ?? 10)
  const [active,     setActive]     = useState(routine?.active     ?? true)
  const [steps,      setSteps]      = useState(defaultSteps)
  const [saving,     setSaving]     = useState(false)

  function toggleDay(iso) {
    setDays(prev => prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso].sort())
  }
  function moveStep(i, dir) {
    setSteps(prev => {
      const next = [...prev]
      const swap = i + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next.map((s, idx) => ({ ...s, position: idx }))
    })
  }
  function removeStep(i) { setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, position: idx }))) }
  function addStep() {
    if (steps.length >= 8) return
    setSteps(prev => [...prev, { icon: '✅', label: 'Nový krok', position: prev.length }])
  }

  async function handleSave() {
    setSaving(true)
    try {
      const data = {
        name, deadline, daysOfWeek: days.join(','), pointValue: Number(pointValue), active,
        childId: routine?.childId ?? routine?._child?.id,
        steps: steps.map((s, i) => ({ position: i, icon: s.icon, label: s.label })),
      }
      await onSave(data)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 13 }}>Název
        <input style={{ display: 'block', width: '100%', marginTop: 4, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
          value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label style={{ fontSize: 13 }}>Deadline
        <input type="time" style={{ display: 'block', marginTop: 4, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
          value={deadline} onChange={e => setDeadline(e.target.value)} />
      </label>
      <div style={{ fontSize: 13 }}>Dny v týdnu
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {DAYS.map(d => (
            <button key={d.iso} type="button"
              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #e5e7eb',
                background: days.includes(d.iso) ? '#3b82f6' : '#f3f4f6', color: days.includes(d.iso) ? '#fff' : '#374151' }}
              onClick={() => toggleDay(d.iso)}>{d.cz}</button>
          ))}
        </div>
      </div>
      <label style={{ fontSize: 13 }}>Body za rutinu
        <input type="number" min={1} max={50} style={{ display: 'block', width: 80, marginTop: 4, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
          value={pointValue} onChange={e => setPointValue(e.target.value)} />
      </label>
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
        Aktivní
      </label>
      <div style={{ fontSize: 13 }}>Kroky ({steps.length}/8)
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input style={{ width: 36, padding: '4px', borderRadius: 4, border: '1px solid #e5e7eb', textAlign: 'center' }}
                value={s.icon} onChange={e => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))} />
              <input style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}
                value={s.label} maxLength={40}
                onChange={e => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
              <button type="button" style={{ padding: '2px 6px', fontSize: 12 }} onClick={() => moveStep(i, -1)} disabled={i === 0}>▲</button>
              <button type="button" style={{ padding: '2px 6px', fontSize: 12 }} onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}>▼</button>
              <button type="button" style={{ padding: '2px 6px', fontSize: 12, color: '#ef4444' }} onClick={() => removeStep(i)}>✕</button>
            </div>
          ))}
          {steps.length < 8 && (
            <button type="button" style={{ alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', fontSize: 12 }}
              onClick={addStep}>+ Přidat krok</button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" style={{ padding: '8px 16px', borderRadius: 6, background: '#f3f4f6', fontSize: 13 }} onClick={onCancel}>Zrušit</button>
        <button type="button" style={{ padding: '8px 16px', borderRadius: 6, background: '#3b82f6', color: '#fff', fontSize: 13 }} onClick={handleSave} disabled={saving}>
          {saving ? '…' : isNew ? 'Vytvořit' : 'Uložit'}
        </button>
      </div>
    </div>
  )
}

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

  const [familyId,     setFamilyId]         = useState('')
  const [landscapeKey, setLandscapeKeyState] = useState('')
  const [families,     setFamilies]          = useState([])
  const [children,     setChildren]          = useState([])
  const [routines,     setRoutines]          = useState([])
  const [loading,      setLoading]           = useState(true)
  const [error,        setError]             = useState('')
  const [modal,        setModal]             = useState(null)
  const [deleteTarget, setDeleteTarget]      = useState(null)
  const [deleting,     setDeleting]          = useState(false)
  const [routineModal, setRoutineModal]      = useState(null) // null | { item: routine|null, child }
  const [routineDeleteId, setRoutineDeleteId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setFamilies(fams)
      const fId = me.familyId || localStorage.getItem('activeFamilyId')
      if (fId) {
        setFamilyId(fId)
        setLandscapeKeyState(getLandscapeKey(fId) ?? '')
        const [ch, rts] = await Promise.all([getChildren(fId), getRoutines(fId)])
        setChildren(ch)
        setRoutines(rts)
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

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteFamily(deleteTarget.id)
      setFamilies(fs => fs.filter(f => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { setDeleteTarget(null) } finally { setDeleting(false) }
  }

  async function handleSaveRoutine(data) {
    if (routineModal.item?.id) {
      const updated = await updateRoutine(routineModal.item.id, data)
      setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r))
    } else {
      const created = await createRoutine(familyId, data)
      setRoutines(prev => [...prev, created])
    }
    setRoutineModal(null)
  }

  async function handleDeleteRoutine() {
    try {
      await deleteRoutine(routineDeleteId)
      setRoutines(prev => prev.filter(r => r.id !== routineDeleteId))
      setRoutineDeleteId(null)
    } catch (e) { alert(e.message ?? 'Nelze smazat rutinu') }
  }

  function handleLogout() { logout(); navigate('/login') }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>{error}</p></div>

  return (
    <div className={styles.layout}>
      <Sidebar active="settings" onLogout={handleLogout} />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Nastavení</h1>
          <p className={styles.subtitle}>Správa rodiny a prostředí.</p>
        </header>

        {/* Families */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rodiny</h2>
            <button className={styles.btnAdd}
              onClick={() => setModal({ type: 'family', item: null })}>+ Přidat rodinu</button>
          </div>
          {families.length === 0
            ? <p className={styles.empty}>Zatím žádné rodiny.</p>
            : <div className={styles.familyList}>
                {families.map(fam => (
                  <div key={fam.id} className={styles.familyCard}>
                    <span className={styles.familyIcon}>🏠</span>
                    <span className={styles.familyName}>{fam.name}</span>
                    <div className={styles.cardActions}>
                      <button className={styles.iconBtn} title="Upravit"
                        onClick={() => setModal({ type: 'family', item: fam })}>✏️</button>
                      <button className={styles.iconBtn} title="Smazat"
                        onClick={() => setDeleteTarget({ id: fam.id, name: fam.name })}>🗑️</button>
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
              <h2 className={styles.sectionTitle}>Prostředí dobrodružství</h2>
            </div>
            <p className={styles.landscapeHint}>
              Vyberte svět, který vaše rodina prozkoumává na stránce Pokroku.
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

        {/* Ranní rutiny */}
        {familyId && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🌅 Ranní rutiny</h2>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              Každé dítě může mít jednu aktivní rutinu. Dítě si kroky odškrtá ráno samo a odešle ke schválení.
            </p>
            {children.map(child => {
              const childRoutine = routines.find(r => r.childId === child.id)
              return (
                <div key={child.id} style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{child.name}</span>
                    {childRoutine
                      ? <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: '#3b82f6', color: '#fff' }}
                            onClick={() => setRoutineModal({ item: { ...childRoutine, _child: child }, child })}>✏️ Upravit</button>
                          <button style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: '#fee2e2', color: '#dc2626' }}
                            onClick={() => setRoutineDeleteId(childRoutine.id)}>🗑️</button>
                        </div>
                      : <button style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: '#22c55e', color: '#fff' }}
                          onClick={() => setRoutineModal({ item: { childId: child.id, _child: child }, child })}>+ Přidat rutinu</button>
                    }
                  </div>
                  {childRoutine && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
                      <span style={{ marginRight: 12 }}>⏰ {childRoutine.deadline}</span>
                      <span style={{ marginRight: 12 }}>⭐ {childRoutine.pointValue} bodů</span>
                      <span style={{ marginRight: 12 }}>
                        {childRoutine.daysOfWeek.split(',').map(d => DAYS.find(x => x.iso === Number(d))?.cz).join(' ')}
                      </span>
                      <span style={{ color: childRoutine.active ? '#16a34a' : '#9ca3af' }}>
                        {childRoutine.active ? '● Aktivní' : '○ Neaktivní'}
                      </span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                        {childRoutine.steps?.map(s => (
                          <span key={s.position} style={{ padding: '2px 8px', background: '#e0f2fe', borderRadius: 20, fontSize: 11 }}>
                            {s.icon} {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {/* Rewards link */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Odměny</h2>
            <a href="/rewards" className={styles.btnAdd}>Přejít na správu odměn →</a>
          </div>
          <p className={styles.empty} style={{ marginTop: 0 }}>
            Správa odměn byla přesunuta na samostatnou stránku s katalogovým importem, archivací a statistikami.
          </p>
        </section>
      </main>

      {modal?.type === 'family' && (
        <Modal title={modal.item ? 'Upravit rodinu' : 'Nová rodina'} onClose={() => setModal(null)}>
          <FamilyForm initial={modal.item ?? {}}
            onSubmit={handleSaveFamily} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Smazat rodinu "${deleteTarget.name}"? Tuto akci nelze vrátit.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting} />
      )}

      {routineModal && (
        <Modal
          title={routineModal.item?.id ? `Upravit rutinu – ${routineModal.child?.name}` : `Nová rutina – ${routineModal.child?.name}`}
          onClose={() => setRoutineModal(null)}>
          <RoutineEditor
            routine={routineModal.item}
            onSave={handleSaveRoutine}
            onCancel={() => setRoutineModal(null)} />
        </Modal>
      )}

      {routineDeleteId && (
        <ConfirmDialog
          message="Smazat tuto rutinu? Tuto akci nelze vrátit."
          onConfirm={handleDeleteRoutine}
          onCancel={() => setRoutineDeleteId(null)} />
      )}
    </div>
  )
}
