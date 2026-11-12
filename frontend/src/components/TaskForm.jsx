import { useState } from 'react'
import f from './Form.module.css'
import t from './TaskForm.module.css'

const TYPE_OPTIONS = [
  { kind: 'OTHER',     openQuest: false, icon: '📋', label: 'Úkol',        defaultPts: 10 },
  { kind: 'HOMEWORK',  openQuest: false, icon: '📚', label: 'Domácí úkol', defaultPts: 20 },
  { kind: 'OTHER',     openQuest: true,  icon: '🌟', label: 'Výzva',       defaultPts: 15 },
  { kind: 'TABLE',     openQuest: false, icon: '🍽️', label: 'Prostírání',  defaultPts: 5  },
  { kind: 'LAUNDRY',   openQuest: false, icon: '🧺', label: 'Prádlo',      defaultPts: 8  },
  { kind: 'ROOM',      openQuest: false, icon: '🛏️', label: 'Pokoj',       defaultPts: 10 },
  { kind: 'WOOD',      openQuest: false, icon: '🪵', label: 'Dřevo',       defaultPts: 8  },
  { kind: 'KINDLING',  openQuest: false, icon: '🪓', label: 'Třísky',      defaultPts: 5  },
  { kind: 'BIG_OTHER', openQuest: false, icon: '⭐', label: 'Velký úkol',  defaultPts: 30 },
]

const STATUSES    = ['UNASSIGNED', 'ASSIGNED', 'PENDING_APPROVAL', 'COMPLETED', 'REJECTED']
const STATUS_LABEL = { UNASSIGNED: 'Nepřiřazeno', ASSIGNED: 'Přiřazeno', PENDING_APPROVAL: 'Čeká na schválení', COMPLETED: 'Splněno', REJECTED: 'Zamítnuto' }

function resolveInitialTypeIdx(initial) {
  if (!initial?.kind && !initial?.openQuest) return 0
  const idx = TYPE_OPTIONS.findIndex(o =>
    o.kind === (initial.kind || 'OTHER') && o.openQuest === (initial.openQuest ?? false)
  )
  return idx >= 0 ? idx : 0
}

export default function TaskForm({ initial = {}, children = [], families = [], onSubmit, onCancel }) {
  const isEdit = Boolean(initial.taskId)

  const [typeIdx,        setTypeIdx]        = useState(() => resolveInitialTypeIdx(initial))
  const [title,          setTitle]          = useState(initial.title          ?? '')
  const [desc,           setDesc]           = useState(initial.description    ?? '')
  const [showDesc,       setShowDesc]       = useState(Boolean(initial.description))
  const [points,         setPoints]         = useState(initial.pointValue     ?? '')
  const [dueDate,        setDueDate]        = useState(initial.dueDate        ?? '')
  const [assignedTo,     setAssignedTo]     = useState(initial.assignedTo     ?? '')
  const [familyId,       setFamilyId]       = useState(initial.familyId       ?? (families[0]?.id ?? ''))
  const [status,         setStatus]         = useState(initial.status         ?? 'UNASSIGNED')
  const [dailyLimit,     setDailyLimit]     = useState(initial.dailyLimit     ?? 1)
  const [bonusValue,     setBonusValue]     = useState(initial.bonusValue     ?? '')
  const [latePointValue, setLatePointValue] = useState(initial.latePointValue ?? '')
  const [noReminderBonus,setNoReminderBonus]= useState(initial.noReminderBonus ?? '')
  const [teamEffort,     setTeamEffort]     = useState(initial.teamEffort      ?? false)
  const [errors,         setErrors]         = useState({})
  const [serverError,    setServerError]    = useState('')
  const [loading,        setLoading]        = useState(false)

  const selectedType = TYPE_OPTIONS[typeIdx]
  const isHomework   = selectedType.kind === 'HOMEWORK'
  const isQuest      = selectedType.openQuest

  function pickType(idx) {
    setTypeIdx(idx)
    if (!points) setPoints(String(TYPE_OPTIONS[idx].defaultPts))
  }

  function validate() {
    const e = {}
    if (!title.trim())                 e.title  = 'Název je povinný.'
    if (!points || Number(points) < 1) e.points = 'Minimálně 1 bod.'
    if (!familyId)                     e.family = 'Vyberte rodinu.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({
        familyId,
        title:          title.trim(),
        description:    desc.trim() || null,
        pointValue:     Number(points),
        dueDate:        dueDate || null,
        status:         isEdit ? status : 'UNASSIGNED',
        assignedToId:   assignedTo || null,
        kind:           selectedType.kind,
        openQuest:      isQuest,
        dailyLimit:     isQuest ? Number(dailyLimit) : 1,
        bonusValue:     isHomework && bonusValue     !== '' ? Number(bonusValue)     : null,
        latePointValue: isHomework && latePointValue !== '' ? Number(latePointValue) : null,
        noReminderBonus:isHomework && noReminderBonus!== '' ? Number(noReminderBonus): null,
        teamEffort:     !isQuest && teamEffort,
      })
    } catch (err) {
      setServerError(err.message || 'Uložení se nezdařilo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={t.form}>
      {serverError && <div className={f.serverError}>{serverError}</div>}

      {/* Type picker */}
      <div className={t.typeGrid}>
        {TYPE_OPTIONS.map((opt, idx) => (
          <button key={idx} type="button"
            className={`${t.typeChip} ${typeIdx === idx ? t.typeChipActive : ''}`}
            onClick={() => pickType(idx)}>
            <span className={t.typeIcon}>{opt.icon}</span>
            <span className={t.typeLabel}>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Title */}
      <div className={t.titleWrap}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Název úkolu…"
          className={`${t.titleInput} ${errors.title ? t.inputError : ''}`}
          autoFocus
        />
        {errors.title && <span className={f.fieldError}>{errors.title}</span>}
      </div>

      {/* Description toggle */}
      {!showDesc
        ? <button type="button" className={t.addDescBtn} onClick={() => setShowDesc(true)}>
            + Přidat popis
          </button>
        : <div className={f.group} style={{ marginTop: 4 }}>
            <label>Popis</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Volitelné podrobnosti…" rows={2} />
          </div>
      }

      {/* Assign to */}
      <div className={t.section}>
        <div className={t.sectionLabel}>Pro koho</div>
        <div className={t.childChips}>
          <button type="button"
            className={`${t.childChip} ${!assignedTo ? t.childChipActive : ''}`}
            onClick={() => setAssignedTo('')}>
            <span className={t.childChipIcon}>👥</span>
            <span>Kdokoliv</span>
          </button>
          {children.map(c => (
            <button key={c.id} type="button"
              className={`${t.childChip} ${assignedTo === c.id ? t.childChipActive : ''}`}
              onClick={() => setAssignedTo(c.id)}>
              <span className={t.childChipIcon}>👤</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Points + due date */}
      <div className={t.row2}>
        <div className={f.group} style={{ margin: 0 }}>
          <label>{isHomework ? 'Body včas' : 'Body'} *</label>
          <input type="number" min="1" value={points}
            onChange={e => setPoints(e.target.value)}
            className={errors.points ? f.inputError : ''}
            placeholder={String(selectedType.defaultPts)} />
          {errors.points && <span className={f.fieldError}>{errors.points}</span>}
        </div>
        <div className={f.group} style={{ margin: 0 }}>
          <label>Termín</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* Homework bonus fields */}
      {isHomework && (
        <div className={t.bonusSection}>
          <div className={t.bonusSectionTitle}>Bonusy za domácí úkol</div>
          <div className={t.row3}>
            <div className={f.group} style={{ margin: 0 }}>
              <label>Body pozdě</label>
              <input type="number" min="0" value={latePointValue}
                onChange={e => setLatePointValue(e.target.value)} placeholder="10" />
            </div>
            <div className={f.group} style={{ margin: 0 }}>
              <label>+ Detektiv chyb</label>
              <input type="number" min="0" value={bonusValue}
                onChange={e => setBonusValue(e.target.value)} placeholder="+5" />
            </div>
            <div className={f.group} style={{ margin: 0 }}>
              <label>+ Bez připomínání</label>
              <input type="number" min="0" value={noReminderBonus}
                onChange={e => setNoReminderBonus(e.target.value)} placeholder="+3" />
            </div>
          </div>
        </div>
      )}

      {/* Team effort */}
      {!isQuest && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, margin: '4px 0' }}>
          <input type="checkbox" checked={teamEffort} onChange={e => setTeamEffort(e.target.checked)} />
          🤝 Týmová práce — při schválení lze rozdělit mezi více dětí (každý účastník +{20} k základu)
        </label>
      )}

      {/* Quest daily limit */}
      {isQuest && (
        <div className={t.questSection}>
          <label className={t.sectionLabel}>Max. vzít za den</label>
          <input type="number" min="1" max="10" value={dailyLimit}
            onChange={e => setDailyLimit(e.target.value)}
            className={t.smallInput} />
        </div>
      )}

      {/* Edit-only: status + family (multi-family) */}
      {(isEdit || families.length > 1) && (
        <div className={t.row2} style={{ marginTop: 4 }}>
          {isEdit && (
            <div className={f.group} style={{ margin: 0 }}>
              <label>Stav</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
          )}
          {families.length > 1 && (
            <div className={f.group} style={{ margin: 0 }}>
              <label>Rodina *</label>
              <select value={familyId} onChange={e => setFamilyId(e.target.value)}
                className={errors.family ? f.inputError : ''}>
                <option value="">— Vyberte —</option>
                {families.map(fm => <option key={fm.id} value={fm.id}>{fm.name}</option>)}
              </select>
              {errors.family && <span className={f.fieldError}>{errors.family}</span>}
            </div>
          )}
        </div>
      )}

      <div className={f.actions}>
        <button type="button" className={f.btnCancel} onClick={onCancel}>Zrušit</button>
        <button type="submit" className={f.btnSubmit} disabled={loading}>
          {loading ? 'Ukládám…' : isEdit ? 'Uložit změny' : 'Přidat úkol'}
        </button>
      </div>
    </form>
  )
}
