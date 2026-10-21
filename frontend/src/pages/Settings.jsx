import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../api/families'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FamilyForm from '../components/FamilyForm'
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

  const [familyId,     setFamilyId]         = useState('')
  const [landscapeKey, setLandscapeKeyState] = useState('')
  const [families,     setFamilies]          = useState([])
  const [loading,      setLoading]           = useState(true)
  const [error,        setError]             = useState('')
  const [modal,        setModal]             = useState(null)
  const [deleteTarget, setDeleteTarget]      = useState(null)
  const [deleting,     setDeleting]          = useState(false)

  const load = useCallback(async () => {
    try {
      const [me, fams] = await Promise.all([getMe(), getFamilies()])
      setFamilies(fams)
      const fId = me.familyId || localStorage.getItem('activeFamilyId')
      if (fId) {
        setFamilyId(fId)
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

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteFamily(deleteTarget.id)
      setFamilies(fs => fs.filter(f => f.id !== deleteTarget.id))
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
    </div>
  )
}
