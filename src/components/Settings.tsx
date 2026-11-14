import { useState, type FormEvent } from 'react'
import type { SetCourses, User } from '../types'

interface SettingsProps {
  user: User
  setUser: (user: User) => void
  setCourses: SetCourses
  setDarkMode: (toggle: boolean) => void
}

export default function Settings({ user, setUser, setCourses, setDarkMode}: SettingsProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState('')
  const [darkMode, toggleDarkMode] = useState(user.darkmode);



  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password == user.password)
    {
      setUser({ name: name, email: email, avatar: user.avatar, password: user.password, darkmode: darkMode });
      setMessage("Profile updated!");
    }
    else
    {
      setMessage("Incorrect password!");
    }
  }


  const purge = () => {
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        enrolled: false,
        lessons: c.lessons.map((l) => ({ ...l, completed: false })),
      }))
    )
    setMessage("Courses purged!");
  }


  const enableDarkMode = () => {
    toggleDarkMode(!darkMode)
    setDarkMode(darkMode)
  }

  return (
    <div>
      <h1>Config</h1>
      <form onSubmit={save} className="form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input  onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {message && <p className="error">{message}</p>}
        <div className="row">
          <button className="btn-a" type="button" onClick={() => enableDarkMode()}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
        <div className="row">
          <button className="btn-a" type="submit">Save</button>
          <button className="btn-a" type="button" onClick={purge}>Purge</button>
        </div>
      </form>
    </div>
  )
}