import styles from './Sidebar.module.css'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard',  key: 'dashboard' },
  { href: '/tasks',     icon: '✅', label: 'Úkoly',      key: 'tasks'     },
  { href: '/rewards',   icon: '🎁', label: 'Odměny',     key: 'rewards'   },
  { href: '/progress',  icon: '🗺️', label: 'Pokrok',     key: 'progress'  },
  { href: '/children',  icon: '👶', label: 'Děti',       key: 'children'  },
  { href: '/settings',  icon: '⚙️', label: 'Nastavení',  key: 'settings'  },
]

export default function Sidebar({ active, onLogout }) {
  return (
    <>
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

      {/* Bottom navigation bar — visible only on tablet / phone */}
      <nav className={styles.mobileNav} aria-label="Mobilní navigace">
        {NAV.map(link => (
          <a key={link.key} href={link.href}
            className={`${styles.mobileNavItem} ${active === link.key ? styles.mobileNavActive : ''}`}>
            <span className={styles.mobileNavIcon}>{link.icon}</span>
            <span className={styles.mobileNavLabel}>{link.label}</span>
          </a>
        ))}
        <button className={`${styles.mobileNavItem} ${styles.mobileNavBtn}`} onClick={onLogout}>
          <span className={styles.mobileNavIcon}>🚪</span>
          <span className={styles.mobileNavLabel}>Odhlásit</span>
        </button>
      </nav>
    </>
  )
}
