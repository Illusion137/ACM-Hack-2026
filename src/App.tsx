import { useState, useEffect } from 'react'
import { initialCourses, users } from './data'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import CourseDetail from './components/CourseDetail'
import Quiz, { QuizList } from './components/Quiz'
import Settings from './components/Settings'
import type { Course, Page, User } from './types'
import Profile from './components/Profile'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [user, setUser] = useState<User>(() => users[Math.floor(Math.random() * users.length)])

  useEffect(() => {
    setTimeout(() => {
      setCourses(initialCourses)
    }, 1500)

    window.history.replaceState(
      { page: 'dashboard' },
      '',
      '#dashboard'
    );

    const handlePopState = (event: PopStateEvent) => {
      console.log(event)

      if (event.state?.target) {
        setPage(event.state.target);
      } 
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [])

  const openCourse = (id: number) => {
    setSelectedId(id)
    window.history.pushState({ target: 'detail' }, '', `#detail` )
    setPage('detail')
  }

  const navigateTo = (target: Page) => {
    if (page == target) {
      return
    }
    window.history.pushState({ target }, '', `#${target}`);
    setPage(target);
  }

  
  const openQuiz = (id: number) => {
    setSelectedId(id)
    setPage('quiz')
  }

  const selected = courses.find((c) => c.id === selectedId)

  return (
    <div className="app">
      <Navbar setPage={navigateTo} user={user} />
      <main className="content">
        {page === 'dashboard' && <Dashboard courses={courses} openCourse={openCourse} user={user} />}
        {page === 'courses' && (
          <Courses courses={courses} setCourses={setCourses} openCourse={openCourse} />
        )}
        {page === 'detail' && selected && (
          <CourseDetail course={selected} courses={courses} setCourses={setCourses} setPage={navigateTo} />
        )}
        {page === 'quizzes' && <QuizList courses={courses} openQuiz={openQuiz} />}
        {page === 'quiz' && selected && <Quiz key={selected.id} course={selected} />}
        {page === 'settings' && <Settings user={user} setUser={setUser} setCourses={setCourses} />}
        {page === 'profile' && <Profile user={user} courses={courses} />}
      </main>
      <footer className="footer">© LearnHub · v0.1.0-beta-build-4482</footer>
    </div>
  )
}
