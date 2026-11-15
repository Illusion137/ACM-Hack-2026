import { FaBook, FaClipboardList, FaCog, FaHome } from 'react-icons/fa'
import default_avatar from '../assets/default-avatar.svg'
import type { Page, User } from '../types'
interface NavbarProps {
  setPage: (page: Page) => void
  user: User
}

export default function Navbar({ setPage, user }: NavbarProps) {
  return (
    <nav className="navbar">
      <span className="nav-item" title="Home" onClick={() => setPage('dashboard')}><div className="logo">LearnHub</div></span>
      <div className="nav-icons">
        <button className="nav-item" title="Home" aria-label="Home" onClick={() => setPage('dashboard')}><FaHome /></button>
        <button className="nav-item" title="Catalog" aria-label="Catalog" onClick={() => setPage('courses')}><FaBook /></button>
        <button className="nav-item" title="Quizzes" aria-label="Quizzes" onClick={() => setPage('quizzes')}><FaClipboardList /></button>
        <button className="nav-item" title="Settings" aria-label="Settings" onClick={() => setPage('settings')}><FaCog /></button>
      </div>
      <div className="nav-user clickable" onClick={() => setPage('profile')}>
        <img src={user.avatar || default_avatar} className="avatar" />
        <span>{user.name}</span>
      </div>
    </nav>
  )
}
