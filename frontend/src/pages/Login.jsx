import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField, { errorsToMap } from '../components/FormField'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setFieldErrors(errorsToMap(err.errors))
      setError(err.errors?.length ? '' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card auth-card">
      <h1>Welcome back</h1>
      {location.state?.registered && (
        <p className="alert alert-success">Account created. Please log in.</p>
      )}
      <form onSubmit={onSubmit} noValidate>
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={fieldErrors.email} autoComplete="email" />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={fieldErrors.password} autoComplete="current-password" />
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="muted center">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}
