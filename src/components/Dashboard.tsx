import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
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

  return (
    <div>
      <marquee className="announce">{announcements.join('   •   ')}</marquee>
      <h1>Welcome back, {user.name}!!!</h1>

      <h2>Continue Learning</h2>
      <div className="grid">
        {enrolled.map((c, i) => {
          const grade = calculateGrade(c)
          return (
          <div key={c.id} className="card" onClick={() => openCourse(c.id)}>
            <div className="card-image">
              <img src={selectImage(c, user)} alt="" />
              <span className={`grade-badge grade-${grade.standing}`} aria-label={`Grade ${grade.percent}%`}>
                {grade.percent}%
              </span>
            </div>
            <div className="card-body">
              <h3 className="course-color" style={{ '--course': distinct_colors[i] } as CSSProperties}>{c.title}</h3>
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
