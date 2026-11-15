import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return (
    <section className="card auth-card">
      <h1>My profile</h1>
      <dl className="profile">
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Member since</dt>
        <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
      </dl>
    </section>
  )
}
