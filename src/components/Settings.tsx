import { useState, type FormEvent } from 'react'
import type { SetCourses, User } from '../types'

interface SettingsProps {
  user: User
  setUser: (user: User) => void
  setCourses: SetCourses
}

export default function Settings({ user, setUser, setCourses }: SettingsProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [error, setError] = useState('')

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^\w+@\w+\.\w+$/.test(email)) {
      setError('ERR_VALIDATION_0x45')
      return
    }
    setError('')
    setUser({ name, email })
  }

  const purge = () => {
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        enrolled: false,
        lessons: c.lessons.map((l) => ({ ...l, completed: false })),
      }))
    )
  }

  return (
    <div>
      <h1>Config</h1>
      <form onSubmit={save} className="form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" placeholder="Password" />
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn-a" type="submit">Save</button>
          <button className="btn-a" type="button" onClick={purge}>Purge</button>
        </div>
      </form>
    </div>
  )
}
