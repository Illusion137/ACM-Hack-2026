import { useEffect, useRef, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FaCheck, FaCheckCircle, FaRegCircle, FaRegClock, FaRegHourglass, FaTimes } from 'react-icons/fa'
import type { Course } from '../types'

const UNANSWERED = -1

function notBetweenWithBuffer(stamp: number, left: number, right: number, buffer = 0) {
  const failed_left = stamp <= left + buffer;
  const failed_right = stamp >= right - buffer;
  return failed_left || failed_right;
}

type CheatReason = 'left_monitor' | 'mouse_away' | 'window_blur' | 'tab_hidden'

interface CheatEvent {
  reason: CheatReason
  at: Date
}

const CHEAT_DESCRIPTIONS: Record<CheatReason, string> = {
  left_monitor: 'Mouse moved to another screen',
  mouse_away: 'Mouse left the quiz page',
  window_blur: 'Quiz window lost focus',
  tab_hidden: 'Switched to another tab or minimized the window',
}

const MOUSE_AWAY_LIMIT_MS = 500
const CONFIRM_GRACE_MS = 1000

type ScreenWithOffset = Screen & { availLeft?: number; availTop?: number }

function checkMouseOutOfBounds(event: MouseEvent): boolean {
  const screen = window.screen as ScreenWithOffset
  const left = screen.availLeft ?? 0
  const top = screen.availTop ?? 0
  const buffer = 5
  return notBetweenWithBuffer(event.screenX, left, left + screen.availWidth, buffer)
    || notBetweenWithBuffer(event.screenY, top, top + screen.availHeight, buffer)
}

function registerCheatDetection(on_cheat: (reason: CheatReason) => void) {
  let away_timer: ReturnType<typeof setTimeout> | undefined
  const cancel_away = () => clearTimeout(away_timer)

  const on_mouse_leave = (event: MouseEvent) => {
    cancel_away()
    if (checkMouseOutOfBounds(event)) on_cheat('left_monitor')
    else away_timer = setTimeout(() => on_cheat('mouse_away'), MOUSE_AWAY_LIMIT_MS)
  }
  const on_blur = () => on_cheat('window_blur')
  const on_visibility_change = () => {
    if (document.visibilityState === 'hidden') on_cheat('tab_hidden')
  }

  document.addEventListener('mouseleave', on_mouse_leave)
  document.addEventListener('mouseover', cancel_away)
  window.addEventListener('blur', on_blur)
  window.addEventListener('focus', cancel_away)
  document.addEventListener('visibilitychange', on_visibility_change)

  return () => {
    cancel_away()
    document.removeEventListener('mouseleave', on_mouse_leave)
    document.removeEventListener('mouseover', cancel_away)
    window.removeEventListener('blur', on_blur)
    window.removeEventListener('focus', cancel_away)
    document.removeEventListener('visibilitychange', on_visibility_change)
  }
}

const JUMPSCARE_SRC = '/baldi.png'
const JUMPSCARE_FADE_MS = 3000
const JUMPSCARE_LINGER_MS = 5_000

function Jumpscare() {
  return (
    <div className="quiz-jumpscare" role="alertdialog" aria-label="Cheating detected">
      <img src={JUMPSCARE_SRC} alt="" style={{ animationDuration: `${JUMPSCARE_FADE_MS}ms` }} />
    </div>
  )
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (num: number) => String(num).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

function formatDateTime(d: Date): string {
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

interface BaseQuestionProps {
  index: number
  question: string
  answers: string[]
  answer_index: number
  points: number
  selected_answer_index: number
  on_question_answer: (selected_answer_index: number) => void
  disabled?: boolean
}

function QuestionBase(props: BaseQuestionProps & { show_results: boolean }) {
  const { index, question, answers, answer_index, points, selected_answer_index, show_results } = props
  const unanswered = selected_answer_index === UNANSWERED
  const correct = selected_answer_index === answer_index

  return (
    <section id={`question-${index + 1}`} className={`quiz-question ${show_results ? 'results' : ''}`}>
      {show_results ? (
        <div className="quiz-question-header results">
          <h3 className="quiz-question-number" aria-label={`Question ${index + 1}`}>{index + 1}</h3>
          <span className="quiz-points">{correct ? points : 0} / {points} points</span>
          {unanswered && <span className="quiz-unanswered">Unanswered</span>}
        </div>
      ) : (
        <div className="quiz-question-header">
          <h3>Question {index + 1}</h3>
          <span className="quiz-points">{points} pts</span>
        </div>
      )}
      <div className="quiz-question-body">
        <p id={`question-${index + 1}-text`} className="quiz-question-text">{question}</p>
        <div role="radiogroup" aria-labelledby={`question-${index + 1}-text`} className="quiz-answers">
          {answers.map((answer, i) => {
            const is_selected = i === selected_answer_index
            const is_answer = i === answer_index
            const is_correct = is_selected && is_answer
            const is_wrong = is_selected && !is_answer
            const is_missed = !is_selected && is_answer
            let tag: string | null = null
            if (show_results && is_selected) tag = is_answer ? 'Correct!' : 'You Answered'
            else if (show_results && is_answer) tag = 'Correct Answer'

            const classes = ['quiz-answer']
            if (is_selected) classes.push('selected')
            if (show_results && is_correct) classes.push('is-correct')
            if (show_results && is_wrong) classes.push('is-wrong')
            if (show_results && is_missed) classes.push('is-missed')

            return (
              <label key={i} className={classes.join(' ')}>
                {show_results && (is_correct || is_wrong) && (
                  <span className="quiz-answer-mark" aria-hidden="true">
                    {is_correct ? <FaCheck /> : <FaTimes />}
                  </span>
                )}
                <input
                  type="radio"
                  name={`question-${index + 1}`}
                  checked={is_selected}
                  disabled={show_results || props.disabled}
                  onChange={() => props.on_question_answer(i)}
                />
                <span className="quiz-answer-text">{answer}</span>
                {tag && <span className={is_missed ? 'quiz-answer-label' : 'sr-only'}>{tag}</span>}
              </label>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function QuestionAnswerable(props: BaseQuestionProps) {
  return <QuestionBase {...props} show_results={false} />
}

function QuestionResults(props: Omit<BaseQuestionProps, 'on_question_answer'>) {
  return <QuestionBase {...props} on_question_answer={() => {}} show_results />
}

interface InfoSidebarProps {
  answered_questions: boolean[]
  due: Date
  started_at: Date
  submitted_at: Date | null
  time_limit_ms?: number
}

function InfoSidebar(props: InfoSidebarProps) {
  const [now, setNow] = useState(() => new Date())
  const answered = props.answered_questions.filter(Boolean).length
  const end = props.submitted_at ?? now
  const elapsed_ms = end.getTime() - props.started_at.getTime()
  const remaining_ms = props.time_limit_ms === undefined ? null : props.time_limit_ms - elapsed_ms

  useEffect(() => {
    if (props.submitted_at) return
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [props.submitted_at])

  const jump = (index: number) => {
    document.getElementById(`question-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="quiz-sidebar">
      <h3><FaRegClock /> Time Elapsed</h3>
      <p className="quiz-sidebar-meta quiz-timer">
        {formatDuration(elapsed_ms)}
        {props.submitted_at && ' (submitted)'}
      </p>
      {remaining_ms !== null && (
        <>
          <h3><FaRegHourglass /> Time Remaining</h3>
          <p
            className={`quiz-sidebar-meta quiz-timer ${!props.submitted_at && remaining_ms < 60_000 ? 'warning' : ''}`}
            role="timer"
          >
            {formatDuration(remaining_ms)}
          </p>
        </>
      )}
      <h3>Questions</h3>
      <p className="quiz-sidebar-meta">{answered} of {props.answered_questions.length} answered</p>
      <ul className="quiz-question-nav">
        {props.answered_questions.map((is_answered, i) => (
          <li key={i}>
            <button className={is_answered ? 'answered' : ''} onClick={() => jump(i)}>
              {is_answered ? <FaCheckCircle aria-label="answered" /> : <FaRegCircle aria-label="unanswered" />}
              Question {i + 1}
            </button>
          </li>
        ))}
      </ul>
      <h3>Due</h3>
      <p className="quiz-sidebar-meta">{formatDateTime(props.due)}</p>
    </aside>
  )
}

function Header(props: { title: string; instructions: string; time_limit?: number }) {
  const start_time = useRef(new Date())

  return (
    <header className="quiz-header">
      <h1>{props.title}</h1>
      <div className="quiz-header-meta">
        <span><b>Started:</b> {formatDateTime(start_time.current)}</span>
        {props.time_limit !== undefined && <span><b>Time limit:</b> {props.time_limit} minutes</span>}
      </div>
      <h2>Quiz Instructions</h2>
      <p>{props.instructions}</p>
    </header>
  )
}

interface PostQuizResultsHeaderProps {
  title: string
  score: number
  total: number
  time_taken_ms: number
  submitted_at: Date
  timed_out: boolean
  cheat_reason: string | null
  on_retake: () => void
}

function PostQuizResultsHeader(props: PostQuizResultsHeaderProps) {
  const percent = props.total ? Math.round((props.score / props.total) * 100) : 0
  const color = percent >= 70 ? '#0b874b' : percent >= 50 ? '#c66b00' : '#c62828'

  return (
    <>
    {props.cheat_reason && <p className="quiz-cheat-banner" role="alert">No cheating allowed: {props.cheat_reason}</p>}
    <header className="quiz-header quiz-results-header">
      <div className="quiz-score-ring">
        <CircularProgressbar
          value={percent}
          text={`${percent}%`}
          styles={buildStyles({ pathColor: color, textColor: color, trailColor: '#e6e9eb' })}
        />
      </div>
      <div>
        <h1>{props.title}</h1>
        <p className="quiz-score-line">
          Score for this attempt: <b>{props.score}</b> out of {props.total}
        </p>
        <p className="quiz-header-meta">
          Submitted {formatDateTime(props.submitted_at)} · This attempt took {formatDuration(props.time_taken_ms)}
        </p>
        {props.timed_out && <p className="quiz-timed-out">Time limit reached. Your quiz was submitted automatically.</p>}
        <button className="quiz-btn" onClick={props.on_retake}>Take the Quiz Again</button>
      </div>
    </header>
    </>
  )
}

interface QuizListProps {
  courses: Course[]
  openQuiz: (id: number) => void
}

export function QuizList({ courses, openQuiz }: QuizListProps) {
  const enrolled = courses.filter((c) => c.enrolled)

  return (
    <div className="quiz-page quiz-list-page">
      <div className="quiz-main">
        <header className="quiz-header">
          <h1>Quizzes</h1>
          <p className="quiz-header-meta">Quizzes for the courses you are enrolled in.</p>
        </header>
        {enrolled.length === 0 && <p className="quiz-sidebar-meta">No quizzes yet.</p>}
        <ul className="quiz-list">
          {enrolled.map((c) => (
            <li key={c.id}>
              <button onClick={() => openQuiz(c.id)}>
                <span className="quiz-list-title">{c.quiz.title}</span>
                <span className="quiz-header-meta">
                  <span>{c.title}</span>
                  <span><b>Due</b> {formatDateTime(new Date(c.quiz.due))}</span>
                  <span>{c.quiz.questions.length} questions</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

interface QuizProps {
  course: Course
  on_score: (points: number) => void
  set_leave_guard: (guard: (() => boolean) | null) => void
}

export default function Quiz({ course, on_score, set_leave_guard }: QuizProps) {
  const { quiz } = course
  const emptyAnswers = () => quiz.questions.map(() => UNANSWERED)
  const [selected, setSelected] = useState<number[]>(emptyAnswers)
  const [started_at, setStartedAt] = useState(() => new Date())
  const [submitted_at, setSubmittedAt] = useState<Date | null>(null)
  const [caught, setCaught] = useState<CheatEvent | null>(null)
  const [showing_jumpscare, setShowingJumpscare] = useState(false)
  const suppress_cheat_until = useRef(0)

  const answered_questions = selected.map((s) => s !== UNANSWERED)
  const answered = answered_questions.filter(Boolean).length
  const score = quiz.questions.reduce((sum, q, i) => sum + (selected[i] === q.answer ? q.points : 0), 0)
  const total_points = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  const time_limit_ms = quiz.time_limit === undefined ? undefined : quiz.time_limit * 60_000
  const deadline = time_limit_ms === undefined ? null : started_at.getTime() + time_limit_ms
  const timed_out = deadline !== null && submitted_at !== null && submitted_at.getTime() >= deadline

  // if passed deadline, just submit
  useEffect(() => {
    if (deadline === null || submitted_at || caught) return
    const id = setTimeout(() => {
      setSubmittedAt((prev) => prev ?? new Date(deadline))
      window.scrollTo({ top: 0 })
    }, deadline - Date.now())
    return () => clearTimeout(id)
  }, [deadline, submitted_at, caught])

  useEffect(() => {
    if (submitted_at || caught) return
    return registerCheatDetection((reason) => {
      if (Date.now() < suppress_cheat_until.current) return
      setCaught((prev) => prev ?? { reason, at: new Date() })
    })
  }, [submitted_at, caught])

  useEffect(() => {
    if (!caught || submitted_at) return
    let timeout: ReturnType<typeof setTimeout> | undefined
    const start = () => {
      if (timeout || document.visibilityState === 'hidden' || !document.hasFocus()) return
      setShowingJumpscare(true)
      timeout = setTimeout(() => {
        setShowingJumpscare(false)
        setSelected(quiz.questions.map((q) => (q.answer === 0 ? 1 : 0)))
        setSubmittedAt(caught.at)
        window.scrollTo({ top: 0 })
      }, JUMPSCARE_FADE_MS + JUMPSCARE_LINGER_MS)
    }
    start()
    document.addEventListener('visibilitychange', start)
    window.addEventListener('focus', start)
    return () => {
      document.removeEventListener('visibilitychange', start)
      window.removeEventListener('focus', start)
      clearTimeout(timeout)
    }
  }, [caught, submitted_at, quiz.questions])

  useEffect(() => {
    if (submitted_at) on_score(score)
  }, [submitted_at])

  useEffect(() => {
    if (submitted_at) return
    const on_before_unload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', on_before_unload)
    set_leave_guard(() => {
      suppress_cheat_until.current = Infinity
      const leave = window.confirm('Leaving now will fail this quiz. Leave anyway?')
      suppress_cheat_until.current = Date.now() + CONFIRM_GRACE_MS
      if (leave) on_score(0)
      return leave
    })
    return () => {
      window.removeEventListener('beforeunload', on_before_unload)
      set_leave_guard(null)
    }
  }, [submitted_at])

  const answer = (question_index: number, selected_answer_index: number) => {
    setSelected((prev) => prev.map((s, i) => (i === question_index ? selected_answer_index : s)))
  }

  const submit = () => {
    const unanswered = quiz.questions.length - answered
    if (unanswered > 0) {
      suppress_cheat_until.current = Infinity
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Submit anyway?`
      )
      suppress_cheat_until.current = Date.now() + CONFIRM_GRACE_MS
      if (!confirmed) return
    }
    setSubmittedAt((prev) => prev ?? new Date())
    window.scrollTo({ top: 0 })
  }

  const retake = () => {
    setSelected(emptyAnswers())
    setStartedAt(new Date())
    setSubmittedAt(null)
    setCaught(null)
    setShowingJumpscare(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="quiz-page">
      <div className="quiz-main">
        {submitted_at ? (
          <PostQuizResultsHeader
            title={quiz.title}
            score={score}
            total={total_points}
            time_taken_ms={submitted_at.getTime() - started_at.getTime()}
            submitted_at={submitted_at}
            timed_out={timed_out}
            cheat_reason={caught ? CHEAT_DESCRIPTIONS[caught.reason] : null}
            on_retake={retake}
          />
        ) : (
          <Header title={quiz.title} instructions={quiz.instructions} time_limit={quiz.time_limit} />
        )}


        {quiz.questions.map((q, i) =>
          submitted_at ? (
            <QuestionResults
              key={i}
              index={i}
              question={q.q}
              answers={q.options}
              answer_index={q.answer}
              points={q.points}
              selected_answer_index={selected[i]}
            />
          ) : (
            <QuestionAnswerable
              key={i}
              index={i}
              question={q.q}
              answers={q.options}
              answer_index={q.answer}
              points={q.points}
              selected_answer_index={selected[i]}
              on_question_answer={(choice) => answer(i, choice)}
              disabled={caught !== null}
            />
          )
        )}

        {!submitted_at && (
          <div className="quiz-submit-bar">
            <span className="quiz-sidebar-meta">{answered} of {quiz.questions.length} answered</span>
            <button className="quiz-btn" onClick={submit} disabled={caught !== null}>Submit Quiz</button>
          </div>
        )}
      </div>

      <InfoSidebar
        answered_questions={answered_questions}
        due={new Date(quiz.due)}
        started_at={started_at}
        submitted_at={submitted_at}
        time_limit_ms={time_limit_ms}
      />

      {showing_jumpscare && <Jumpscare />}
    </div>
  )
}
