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
  const [imageType, setImageType] = useState(user.imageType)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState('')
  const [darkMode, toggleDarkMode] = useState(user.darkmode);



  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password == user.password)
    {
      setUser({ name: name, email: email, avatar: user.avatar, password: user.password, darkmode: darkMode, imageType: imageType });
      setMessage("Profile updated!");
    }
    else
    {
      setMessage("Incorrect password!");
    }
  }


  const purge = () => {
    if (password == user.password)
    {
      setCourses((prev) =>
        prev.map((c) => ({
          ...c,
          enrolled: false,
          lessons: c.lessons.map((l) => ({ ...l, completed: false, completed_points: 0 })),
          quiz: { ...c.quiz, completed_points: null },
        }))
      )
      setMessage("Courses purged!");
    }
    else
    {
      setMessage("Incorrect password!");
    }
  }


  const enableDarkMode = () => {
    toggleDarkMode(!darkMode)
    setDarkMode(darkMode)
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
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <p>Course Image Type</p>
        <select value={imageType} onChange={(e) => setImageType(e.target.value)}>
          <option>Default</option>
          <option>Dogs</option>
          <option>Cats</option>
          <option>Birds</option>
        </select>
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