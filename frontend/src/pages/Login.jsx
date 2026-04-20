import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      const data = await login(email, password)
      saveToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⭐</span>
          <h1>KidQuest</h1>
          <p>Complete quests, earn rewards!</p>
        </div>

        {serverError && <div className={styles.alert}>{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.group}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.group}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? styles.inputError : ''}
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.forgot}>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <><span className={styles.spinner} /> Logging in…</> : 'Log In'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <Link to="/register">
          <button className={styles.btnOutline}>Create an account</button>
        </Link>
      </div>
    </div>
  )
}
