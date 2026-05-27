import styles from './Sidebar.module.css'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard',        key: 'dashboard' },
  { href: '/tasks',     icon: '✅', label: 'Tasks',            key: 'tasks'     },
  { href: '/progress',  icon: '🎁', label: 'Rewards Progress', key: 'progress'  },
  { href: '/children',  icon: '👶', label: 'Children',         key: 'children'  },
  { href: '/settings',  icon: '⚙️', label: 'Settings',         key: 'settings'  },
]

export default function Sidebar({ active, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span>⭐</span><span>KidQuest</span></div>
      <nav className={styles.nav}>
        {NAV.map(link => (
          <a key={link.key} href={link.href}
            className={`${styles.navItem} ${active === link.key ? styles.navActive : ''}`}>
            <span>{link.icon}</span> {link.label}
          </a>
        ))}
      </nav>
      <button className={styles.logoutBtn} onClick={onLogout}>
        <span>🚪</span> Log out
      </button>
    </aside>
  )
}
