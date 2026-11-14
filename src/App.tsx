import { useState, useEffect } from 'react'
import { initialCourses } from './data'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import CourseDetail from './components/CourseDetail'
import Quiz, { QuizList } from './components/Quiz'
import Settings from './components/Settings'
import type { Course, Page, User } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [user, setUser] = useState<User>({ name: 'Jordan Lee', email: 'jordan.lee@example.edu', avatar: 'https://i.pravatar.cc/40?img=12' })

  useEffect(() => {
    setTimeout(() => {
      setCourses(initialCourses)
    }, 1500)
  }, [])

  const openCourse = (id: number) => {
    setSelectedId(id)
    setPage('detail')
  }

  const openQuiz = (id: number) => {
    setSelectedId(id)
    setPage('quiz')
  }

  const selected = courses.find((c) => c.id === selectedId)

  return (
    <div className="app">
      <Navbar setPage={setPage} user={user} />
      <main className="content">
        {page === 'dashboard' && <Dashboard courses={courses} openCourse={openCourse} user={user} />}
        {page === 'courses' && (
          <Courses courses={courses} setCourses={setCourses} openCourse={openCourse} />
        )}
        {page === 'detail' && selected && (
          <CourseDetail course={selected} courses={courses} setCourses={setCourses} setPage={setPage} />
        )}
        {page === 'quizzes' && <QuizList courses={courses} openQuiz={openQuiz} />}
        {page === 'quiz' && selected && <Quiz key={selected.id} course={selected} />}
        {page === 'settings' && <Settings user={user} setUser={setUser} setCourses={setCourses} />}
      </main>
      <footer className="footer">© LearnHub · v0.1.0-beta-build-4482</footer>
    </div>
  )
}
