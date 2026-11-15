import { useEffect, useState } from 'react'
import { FaCheckCircle, FaClipboardList, FaPlay, FaRegCircle, FaRedo } from 'react-icons/fa'
import { getProgress } from './Dashboard'
import { calculateGrade, isPastDue } from '../utils'
import { apiRequest } from '../auth'
import Snake from './minigames/Snake'
import Minesweeper from './minigames/Minesweeper'
import type { Course, Lesson, SetCourses, TentativeSchedule } from '../types'

export type CourseTab = 'home' | 'modules' | 'schedule' | 'grades'
type Tab = CourseTab

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'modules', label: 'Modules' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'grades', label: 'Grades' },
]

interface CourseDetailProps {
  course: Course
  courses: Course[]
  setCourses: SetCourses
  openQuiz: (id: number) => void
  tab: Tab
  setTab: (tab: Tab) => void
}

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function buildSchedule(course: Course): TentativeSchedule {
  const schedule: TentativeSchedule = {}
  course.lessons.forEach((l) => {
    schedule[new Date(l.due).toISOString()] = String(l.id)
  })
  return schedule
}

function LessonStatus(props: { lesson: Lesson }) {
  return props.lesson.completed
    ? <FaCheckCircle className="course-status done" aria-label="Completed" />
    : <FaRegCircle className="course-status" aria-label="Not completed" />
}

function PlayButton(props: { lesson: Lesson; on_play: (lesson: Lesson) => void }) {
  return (
    <button className="course-play" onClick={() => props.on_play(props.lesson)}>
      {props.lesson.completed ? <><FaRedo /> Replay</> : <><FaPlay /> Start</>}
    </button>
  )
}

function Tasks(props: { course: Course; on_play: (lesson: Lesson) => void; openQuiz: (id: number) => void }) {
  const upcoming = props.course.lessons.filter((l) => !l.completed).slice(0, 3)

  return (
    <section>
      <h2 className="course-heading">To Do</h2>
      <ul className="course-list">
        {upcoming.map((l) => (
          <li key={l.id}>
            <LessonStatus lesson={l} />
            <span className="course-list-title">{l.title}</span>
            <span className="course-meta">{l.points} pts</span>
            <PlayButton lesson={l} on_play={props.on_play} />
          </li>
        ))}
        <li>
          <FaClipboardList className="course-status" />
          <span className="course-list-title">{props.course.quiz.title}</span>
          <span className="course-meta">
            {props.course.quiz.completed_points === null
              ? `Due ${formatDay(new Date(props.course.quiz.due))}`
              : `Best score ${props.course.quiz.completed_points} / ${props.course.quiz.questions.reduce((sum, q) => sum + q.points, 0)}`}
          </span>
          <button className="course-play" onClick={() => props.openQuiz(props.course.id)}>
            {props.course.quiz.completed_points === null ? 'Take quiz' : 'Retake quiz'}
          </button>
        </li>
      </ul>
      {upcoming.length === 0 && <p className="course-meta">All lessons complete. Nice work!</p>}
    </section>
  )
}

function Modules(props: { course: Course; on_play: (lesson: Lesson) => void }) {
  const [hide_done, setHideDone] = useState(false)
  const visible = hide_done ? props.course.lessons.filter((l) => !l.completed) : props.course.lessons

  return (
    <section>
      <div className="course-heading-row">
        <h2 className="course-heading">Modules</h2>
        <label className="course-meta">
          <input type="checkbox" checked={hide_done} onChange={() => setHideDone(!hide_done)} /> Hide completed
        </label>
      </div>
      <ul className="course-list">
        {visible.map((l) => (
          <li key={l.id}>
            <LessonStatus lesson={l} />
            <span className={`course-list-title ${l.completed ? 'done' : ''}`}>
              {l.id}. {l.title}
            </span>
            <span className="course-meta">{l.completed ? l.completed_points : 0} / {l.points} pts</span>
            <PlayButton lesson={l} on_play={props.on_play} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TentativeScheduleView(props: { course: Course }) {
  const schedule = buildSchedule(props.course)

  return (
    <section>
      <h2 className="course-heading">Tentative Schedule</h2>
      <table className="course-table">
        <thead>
          <tr><th>Week</th><th>Date</th><th>Lesson</th><th>Status</th></tr>
        </thead>
        <tbody>
          {Object.entries(schedule).map(([iso, lesson_id], i) => {
            const l = props.course.lessons.find((x) => String(x.id) === lesson_id)!
            return (
              <tr key={iso}>
                <td>{i + 1}</td>
                <td>{formatDay(new Date(iso))}</td>
                <td>{l.title}</td>
                <td><LessonStatus lesson={l} /></td>
              </tr>
            )
          })}
          <tr>
            <td />
            <td>{formatDay(new Date(props.course.quiz.due))}</td>
            <td>{props.course.quiz.title}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </section>
  )
}

function Grades(props: { course: Course }) {
  const { quiz } = props.course
  const { percent, earned, possible, quiz_points, quiz_taken } = calculateGrade(props.course)

  return (
    <section>
      <h2 className="course-heading">Grades</h2>
      <table className="course-table">
        <thead>
          <tr><th>Assignment</th><th>Status</th><th>Score</th></tr>
        </thead>
        <tbody>
          {props.course.lessons.map((l) => {
            const missing = !l.completed && isPastDue(l.due)
            return (
              <tr key={l.id} className={missing ? 'missing' : ''}>
                <td>{l.title}</td>
                <td>{l.completed ? 'Completed' : missing ? 'Missing' : 'Incomplete'}</td>
                <td>{l.completed || missing ? l.completed_points : '–'} / {l.points}</td>
              </tr>
            )
          })}
          <tr className={!quiz_taken && isPastDue(quiz.due) ? 'missing' : ''}>
            <td>{quiz.title}</td>
            <td>{quiz_taken ? 'Submitted' : isPastDue(quiz.due) ? 'Missing' : 'Incomplete'}</td>
            <td>{quiz_taken ? quiz.completed_points : isPastDue(quiz.due) ? 0 : '–'} / {quiz_points}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Total (completed and past due)</td>
            <td>{percent}%</td>
            <td>{earned} / {possible}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}

function Sidebar(props: { course: Course; tab: Tab; setTab: (tab: Tab) => void }) {
  const progress = props.course.lessons.length ? getProgress(props.course) : 0

  return (
    <aside className="course-sidebar">
      <nav aria-label="Course">
        <ul>
          {TABS.map((t) => (
            <li key={t.id}>
              <button className={props.tab === t.id ? 'active' : ''} onClick={() => props.setTab(t.id)}>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="course-sidebar-info">
        <p className="course-meta">Instructor</p>
        <p>{props.course.instructor}</p>
        <p className="course-meta">Progress</p>
        <div className="bar"><div className="bar-fill" style={{ width: progress + '%' }} /></div>
        <p className="course-meta">{progress}% complete</p>
      </div>
    </aside>
  )
}

function LessonGame(props: { lesson: Lesson; on_win: () => void; on_close: () => void }) {
  const [won, setWon] = useState(false)

  useEffect(() => {
    const on_key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.on_close()
    }
    window.addEventListener('keydown', on_key)
    return () => window.removeEventListener('keydown', on_key)
  }, [props.on_close])

  const win = () => {
    setWon(true)
    props.on_win()
  }

  return (
    <div className="game-overlay" onClick={props.on_close}>
      <div className="game-modal" role="dialog" aria-label={props.lesson.title} onClick={(e) => e.stopPropagation()}>
        <div className="game-modal-header">
          <h2>{props.lesson.title}</h2>
          <button className="game-close" aria-label="Close" onClick={props.on_close}>×</button>
        </div>
        {won ? (
          <div className="game-won">
            <FaCheckCircle />
            <p>Lesson complete! +{props.lesson.points} pts</p>
            <button className="quiz-btn" onClick={props.on_close}>Back to course</button>
          </div>
        ) : props.lesson.minigame === 'snake' ? (
          <Snake on_win={win} />
        ) : (
          <Minesweeper on_win={win} />
        )}
      </div>
    </div>
  )
}

export default function CourseDetail({ course, setCourses, openQuiz, tab, setTab }: CourseDetailProps) {
  const [playing, setPlaying] = useState<Lesson | null>(null)

  const completeLesson = (lesson_id: number) => {
    apiRequest<{ course: Course }>('lesson', { course: course.id, lesson: lesson_id })
      .then(({ course: updated }) => setCourses((prev) => prev.map((c) => c.id === updated.id ? updated : c)))
      .catch((err) => alert(err.message))
  }

  return (
    <div className="course-page">
      <header className="course-header">
        <p className="course-meta">{course.code} · {course.category}</p>
        <h1>{course.title}</h1>
      </header>
      <div className="course-layout">
        <Sidebar course={course} tab={tab} setTab={setTab} />
        <main className="course-main">
          {tab === 'home' && <Tasks course={course} on_play={setPlaying} openQuiz={openQuiz} />}
          {tab === 'modules' && <Modules course={course} on_play={setPlaying} />}
          {tab === 'schedule' && <TentativeScheduleView course={course} />}
          {tab === 'grades' && <Grades course={course} />}
        </main>
      </div>
      {playing && (
        <LessonGame
          lesson={playing}
          on_win={() => completeLesson(playing.id)}
          on_close={() => setPlaying(null)}
        />
      )}
    </div>
  )
}
