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
        <span className="nav-item" title="Home" onClick={() => setPage('dashboard')}>🏠</span>
        <span className="nav-item" title="Catalog" onClick={() => setPage('courses')}>📚</span>
        <span className="nav-item" title="Assessment" onClick={() => setPage('quiz')}>📝</span>
        <span className="nav-item" title="Config" onClick={() => setPage('settings')}>⚙️</span>
        <a className="nav-item" href="#">❓</a>
      </div>
      <div className="nav-user">
        <img src="https://i.pravatar.cc/40?img=12" className="avatar" />
        <span>{user.name}</span>
      </div>
    </nav>
  )
}
