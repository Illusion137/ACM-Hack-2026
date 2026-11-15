import { useState, useEffect, useRef } from 'react'
import { initialCourses } from './data'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import CourseDetail from './components/CourseDetail'
import type { CourseTab } from './components/CourseDetail'
import Quiz, { QuizList } from './components/Quiz'
import Settings from './components/Settings'
import type { Course, Page } from './types'
import Profile from './components/Profile'
import TodoSidebar from './components/TodoSidebar'
import { useAuth } from "./auth";

interface Route {
  page: Page
  id?: number
  tab?: CourseTab
}

const PAGES: Page[] = ['dashboard', 'courses', 'detail', 'quizzes', 'quiz', 'settings', 'profile']
const COURSE_TABS: CourseTab[] = ['home', 'modules', 'schedule', 'grades']
const DEFAULT_ROUTE: Route = { page: 'dashboard' }

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  courses: 'Course Catalog',
  detail: 'Course',
  quizzes: 'Quizzes',
  quiz: 'Quiz',
  settings: 'Settings',
  profile: 'Profile',
}

const TAB_TITLES: Record<CourseTab, string> = {
  home: 'Home',
  modules: 'Modules',
  schedule: 'Schedule',
  grades: 'Grades',
}

function pageTitle(route: Route, course?: Course): string {
  let title = PAGE_TITLES[route.page]
  if (route.page === 'detail' && course) title = `${course.code} ${TAB_TITLES[route.tab ?? 'home']}`
  if (route.page === 'quiz' && course) title = course.quiz.title
  return `${title} · LearnHub`
}

function toHash(route: Route): string {
  const parts: string[] = [route.page]
  if (route.id !== undefined) parts.push(String(route.id))
  if (route.tab && route.tab !== 'home') parts.push(route.tab)
  return '#' + parts.join('/')
}

function parseHash(hash: string): Route {
  const [page, id, tab] = hash.replace(/^#/, '').split('/')
  if (!PAGES.includes(page as Page)) return DEFAULT_ROUTE
  const needs_id = page === 'detail' || page === 'quiz'
  if (!needs_id) return { page: page as Page }
  const course_id = Number(id)
  if (!Number.isInteger(course_id)) return DEFAULT_ROUTE
  const course_tab = COURSE_TABS.includes(tab as CourseTab) ? tab as CourseTab : undefined
  return { page: page as Page, id: course_id, tab: page === 'detail' ? course_tab : undefined }
}

export default function App() {
  const { user: currentUser } = useAuth()
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  const [courses, setCourses] = useState<Course[]>([])
  const [user, setUser] = useState(currentUser!)
  const leave_guard = useRef<(() => boolean) | null>(null)
  const current_hash = useRef(toHash(route))

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCourses(initialCourses)
    }, 1500)

    window.history.replaceState(null, '', current_hash.current)

    const handlePopState = () => {
      if (leave_guard.current && !leave_guard.current()) {
        window.history.pushState(null, '', current_hash.current)
        return
      }
      const next = parseHash(window.location.hash)
      current_hash.current = toHash(next)
      window.history.replaceState(null, '', current_hash.current)
      setRoute(next)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigate = (next: Route) => {
    const hash = toHash(next)
    if (hash === current_hash.current) return
    if (leave_guard.current && !leave_guard.current()) return
    current_hash.current = hash
    window.history.pushState(null, '', hash)
    setRoute(next)
  }

  const navigateTo = (page: Page) => navigate({ page })
  const openCourse = (id: number) => navigate({ page: 'detail', id })
  const openQuiz = (id: number) => navigate({ page: 'quiz', id })
  const openModules = (id: number) => navigate({ page: 'detail', id, tab: 'modules' })

  const [planned, setPlanned] = useState<Set<string>>(new Set())
  const togglePlanned = (key: string) => setPlanned((prev) => {
    const next = new Set(prev)
    if (!next.delete(key)) next.add(key)
    return next
  })
  const todo_props = { courses, planned, togglePlanned, openCourse: openModules, openQuiz }

  const selected = courses.find((c) => c.id === route.id)
  const page = route.page
  const loading = (page === 'detail' || page === 'quiz') && courses.length === 0

  const toggleDarkMode = (toggle: boolean) => {
    document.documentElement.setAttribute(
      "data-theme",
      toggle ? "dark" : "light"
    )
    document.documentElement.style.colorScheme =
      toggle ? "dark" : "light";
  }
  
  useEffect(() => {
    toggleDarkMode(user.darkmode)
  }, [user.darkmode])

  useEffect(() => {
    document.title = pageTitle(route, selected)
  }, [route, selected])

  const recordQuizScore = (id: number, points: number) => {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, quiz: { ...c.quiz, completed_points: points } } : c))
  }

  return (
    <div className="app">
      <Navbar setPage={navigateTo} user={user} />
      <main className="content">
        {loading && <p className="faint">Loading…</p>}
        {page === 'dashboard' && (
          <div className="todo-layout">
            <Dashboard courses={courses} openCourse={openCourse} user={user} />
            <TodoSidebar {...todo_props} />
          </div>
        )}
        {page === 'courses' && (
          <Courses courses={courses} setCourses={setCourses} openCourse={openCourse} user={user} />
        )}
        {page === 'detail' && selected && (
          <div className="todo-layout">
            <CourseDetail
              course={selected}
              courses={courses}
              setCourses={setCourses}
              openQuiz={openQuiz}
              tab={route.tab ?? 'home'}
              setTab={(tab) => navigate({ page: 'detail', id: selected.id, tab })}
            />
            <TodoSidebar {...todo_props} course={selected} />
          </div>
        )}
        {page === 'quizzes' && <QuizList courses={courses} openQuiz={openQuiz} />}
        {page === 'quiz' && selected && (
          <Quiz
            key={selected.id}
            course={selected}
            on_score={(points) => recordQuizScore(selected.id, points)}
            set_leave_guard={(guard) => { leave_guard.current = guard }}
          />
        )}
        {(page === 'detail' || page === 'quiz') && !loading && !selected && (
          <p className="faint">Course not found.</p>
        )}
        {page === 'settings' && <Settings user={user} setUser={setUser} setCourses={setCourses} setDarkMode={toggleDarkMode} />}
        {page === 'profile' && <Profile user={user} courses={courses} />}
      </main>
      <footer className="footer">© LearnHub · v0.1.0-beta-build-4482</footer>
    </div>
  )
}
