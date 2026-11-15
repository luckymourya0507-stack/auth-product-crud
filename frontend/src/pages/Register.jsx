import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField, { errorsToMap } from '../components/FormField'

const empty = { name: '', email: '', password: '', confirmPassword: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
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
      await register(form)
      // Register does not log you in (per the assignment), so send the user to the login page.
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setFieldErrors(errorsToMap(err.errors))
      setError(err.errors?.length ? '' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card auth-card">
      <h1>Create account</h1>
      <form onSubmit={onSubmit} noValidate>
        <FormField label="Name" name="name" value={form.name} onChange={onChange} error={fieldErrors.name} autoComplete="name" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={fieldErrors.email} autoComplete="email" />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={fieldErrors.password} autoComplete="new-password" />
        <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} error={fieldErrors.confirmPassword} autoComplete="new-password" />
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="muted center">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  )
}
