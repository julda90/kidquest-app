import Modal from './Modal'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm" onClose={onCancel}>
      <p className={styles.msg}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>Cancel</button>
        <button className={styles.btnDanger} onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}
