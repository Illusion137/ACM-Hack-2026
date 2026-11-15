import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Course, SetCourses, User } from '../types'
import { apiRequest, useAuth } from '../auth'
import default_avatar from '../assets/default-avatar.svg'

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
  const { logout } = useAuth();

  const uploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    const res = await fetch("/api/upload-avatar", { method: "POST", credentials: "same-origin", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? (res.status === 413 ? "Image must be under 5 MB" : "Upload failed"));
      return;
    }
    setUser({ ...user, avatar: data.url });
    setMessage("Avatar updated!");
  }

  const saveSettings = async (body: object, success: string) => {
    try {
      const data = await apiRequest<{ user: User; courses: Course[] }>("settings", body);
      setUser(data.user);
      setCourses(data.courses);
      setMessage(success);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveSettings({ name, email, password, darkmode: darkMode, imageType }, "Profile updated!");
  }


  const purge = () => saveSettings({ purge: true, password }, "Courses purged!")

  const enableDarkMode = () => {
    toggleDarkMode(!darkMode)
    setDarkMode(darkMode)
  }

  return (
    <div>
      <h1>Config</h1>
      <form onSubmit={save} className="form">
        <img src={user.avatar || default_avatar} alt="Your avatar" className="avatar" style={{ width: 96, height: 96, objectFit: "cover" }} />
        <label>
          Change avatar{" "}
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={uploadAvatar} />
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <p>Course Image Type</p>
        <select value={imageType} onChange={(e) => setImageType(e.target.value as User['imageType'])}>
          <option>Default</option>
          <option>Dogs</option>
          <option>Cats</option>
          <option>Birds</option>
          <option>Bnnuy</option>
          <option>CatnBunny</option>
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
          <button className="btn-a" type="button" onClick={logout}>Log out</button>
        </div>
      </form>
    </div>
  )
}