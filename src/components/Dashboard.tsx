import { useState, useEffect } from 'react'
import { announcements, distinct_colors } from '../data'
import type { Course, User } from '../types'
import { calculateGrade, isPastDue, selectImage } from '../utils'
import { FaRegCircle } from 'react-icons/fa'

const DUE_PREVIEW_COUNT = 4

function DueList(props: { course: Course }) {
  const [expanded, setExpanded] = useState(false)
  const { quiz } = props.course
  const items = [
    ...props.course.lessons.filter((l) => !l.completed).map((l) => ({ key: `lesson-${l.id}`, title: l.title, due: l.due })),
    ...(quiz.completed_points === null ? [{ key: 'quiz', title: quiz.title, due: quiz.due }] : []),
  ].sort((a, b) => a.due - b.due)
  const visible = expanded ? items : items.slice(0, DUE_PREVIEW_COUNT)
  const hidden = items.length - visible.length

  return (
    <div className="card-due">
      <h4>Due</h4>
      {items.length === 0 ? (
        <p className="faint">Nothing due</p>
      ) : (
        <ul>
          {visible.map((item) => (
            <li key={item.key}>
              <FaRegCircle className="card-due-icon" />
              <span className="card-due-title" title={item.title}>{item.title}</span>
              <span className={`card-due-date ${isPastDue(item.due) ? 'late' : ''}`}>
                {new Date(item.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {items.length > DUE_PREVIEW_COUNT && (
        <button
          className="card-due-more"
          onClick={(event) => {
            event.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </button>
      )}
    </div>
  )
}

export function getProgress(course: Course): number {
  const done = course.lessons.filter((l) => l.completed).length
  return Math.round((done / (course.lessons.length )) * 100)
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
}

export function formatTime(time: number): string {
  return new Date(time).toLocaleString("en-GB", {hour: "2-digit", minute: "2-digit", hour12:true})
}

interface DashboardProps {
  courses: Course[]
  openCourse: (id: number) => void
  user: User
}

export default function Dashboard({ courses, openCourse, user }: DashboardProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000);
    return () => clearInterval(interval);
  }, [])

  const enrolled = courses.filter((c) => c.enrolled)
  const totalLessons = enrolled.reduce((sum, c) => sum + c.lessons.length, 0)
  const doneLessons = enrolled.reduce((sum, c) => sum + c.lessons.filter((l) => l.completed).length, 0)
  const points = enrolled.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.completed_points, 0),
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
        <div className="stat"><b>{points}</b><span>Points</span></div>
        <div className="stat"><b>{totalLessons - doneLessons}</b><span>Remaining</span></div>
        <div className="stat"><b>{courses.length}</b><span>Catalog</span></div>
        <div className="stat"><b>0</b><span>Badges</span></div>
        <div className="stat"><b>N/A</b><span>Rank</span></div>
      </div>

      <h2>Continue Learning</h2>
      <div className="grid">
        {enrolled.map((c, i) => {
          const grade = calculateGrade(c)
          return (
          <div key={c.id} className="card" onClick={() => openCourse(c.id)}>
            <div className="card-image">
              <img src={selectImage(c, user)} onClick={() => openCourse(c.id)} />
              <span className={`grade-badge grade-${grade.standing}`} aria-label={`Grade ${grade.percent}%`}>
                {grade.percent}%
              </span>
            </div>
            <div className="card-body">
              <h3 style={{color: distinct_colors[i]}}>{c.title}</h3>
              <p className="faint">Started {formatDate(c.startDate)}</p>
              <div className="bar">
                <div className="bar-fill" style={{ width: getProgress(c) + '%' }} />
              </div>
              <small>{getProgress(c)}% complete</small>
              <DueList course={c} />
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
