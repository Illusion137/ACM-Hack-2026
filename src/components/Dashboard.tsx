import { useState, useEffect } from 'react'
import { announcements } from '../data'
import type { Course, User } from '../types'

export function getProgress(course: Course): number {
  const done = course.lessons.filter((l) => l.completed).length
  return Math.round((done / (course.lessons.length)) * 100)
}

export function formatDate(ts: number): string {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const d = new Date(ts)
  return  months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

export function formatTime(time: number): string {
  return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

interface DashboardProps {
  courses: Course[]
  openCourse: (id: number) => void
  user: User
}

export default function Dashboard({ courses, openCourse, user }: DashboardProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setInterval(() => {
      setNow(new Date())
    }, 1000)
  }, [])

  const enrolled = courses.filter((c) => c.enrolled)
  const totalLessons = enrolled.reduce((sum, c) => sum + c.lessons.length, 0)
  const doneLessons = enrolled.reduce((sum, c) => sum + c.lessons.filter((l) => l.completed).length, 0)
  const minutes = enrolled.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.duration, 0),
    0
  )

  return (
    <div>
      <marquee className="announce">{announcements.join('   •   ')}</marquee>
      <h1>Welcome back, {user.name}!!!</h1>
      <p className="faint">Current server time: {formatTime(now.getTime())}</p>

      <div className="stats">
        <div className="stat"><b>{enrolled.length}</b><span>Enrolled</span></div>
        <div className="stat"><b>{totalLessons}</b><span>Lessons</span></div>
        <div className="stat"><b>{doneLessons}</b><span>Done</span></div>
        <div className="stat"><b>{minutes}</b><span>Min</span></div>
        <div className="stat"><b>{totalLessons - doneLessons}</b><span>Remaining</span></div>
        <div className="stat"><b>{courses.length}</b><span>Catalog</span></div>
        <div className="stat"><b>0</b><span>Badges</span></div>
        <div className="stat"><b>N/A</b><span>Rank</span></div>
        <div className="stat"><b>{Math.random().toFixed(2)}</b><span>Engagement idx</span></div>
      </div>

      <h2>Continue Learning</h2>
      <div className="grid">
        {enrolled.map((c) => (
          <div className="card" onClick={() => openCourse(c.id)}>
            <img src={c.image} />
            <div className="card-body">
              <h3>{c.title}</h3>
              <p className="faint">Started {formatDate(c.startDate)}</p>
              <div className="bar">
                <div className="bar-fill" style={{ width: getProgress(c) + '%' }} />
              </div>
              <small>{getProgress(c)}% complete</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
