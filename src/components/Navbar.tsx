import type { Page, User } from '../types'

interface NavbarProps {
  setPage: (page: Page) => void
  user: User
}

export default function Navbar({ setPage, user }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="logo">LearnHub</div>
      <div className="nav-icons">
        <span className="nav-item" title="Home" onClick={() => setPage('dashboard')}>🏠</span>
        <span className="nav-item" title="Catalog" onClick={() => setPage('courses')}>📚</span>
        <span className="nav-item" title="Assessment" onClick={() => setPage('quizzes')}>📝</span>
        <span className="nav-item" title="Config" onClick={() => setPage('settings')}>⚙️</span>
      </div>
      <div className="nav-user">
        <img src={user.avatar} className="avatar" />
        <span>{user.name}</span>
      </div>
    </nav>
  )
}
