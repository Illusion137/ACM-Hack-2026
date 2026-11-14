import { FaBook, FaClipboardList, FaCog, FaHome } from 'react-icons/fa'
import type { Page, User } from '../types'

interface NavbarProps {
  setPage: (page: Page) => void
  user: User
}

export default function Navbar({ setPage, user }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="logo no-select clickable" onClick={() => setPage('dashboard')}>LearnHub</div>
      <div className="nav-icons">
        <button className="nav-item" title="Home" aria-label="Home" onClick={() => setPage('dashboard')}><FaHome /></button>
        <button className="nav-item" title="Catalog" aria-label="Catalog" onClick={() => setPage('courses')}><FaBook /></button>
        <button className="nav-item" title="Quizzes" aria-label="Quizzes" onClick={() => setPage('quizzes')}><FaClipboardList /></button>
        <button className="nav-item" title="Settings" aria-label="Settings" onClick={() => setPage('settings')}><FaCog /></button>
      </div>
      <div className="nav-user clickable" onClick={() => setPage('profile')}>
        <img src={user.avatar} className="avatar" />
        <span>{user.name}</span>
      </div>
    </nav>
  )
}
