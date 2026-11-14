import { useEffect, useRef, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FaCheck, FaCheckCircle, FaRegCircle, FaRegClock, FaRegHourglass, FaTimes } from 'react-icons/fa'
import type { Course } from '../types'

const UNANSWERED = -1

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
        </div>
      ) : (
        <div className="quiz-question-header">
          <h3>Question {index + 1}</h3>
          <span className="quiz-points">{points} pts</span>
        </div>
      )}
      <div className="quiz-question-body">
        <p id={`question-${index + 1}-text`} className="quiz-question-text">{question}</p>
        {show_results && unanswered && <p className="quiz-unanswered">Unanswered</p>}
        <div role="radiogroup" aria-labelledby={`question-${index + 1}-text`} className="quiz-answers">
          {answers.map((answer, i) => {
            const is_selected = i === selected_answer_index
            const is_answer = i === answer_index
            const is_wrong = is_selected && !is_answer
            let tag: string | null = null
            if (show_results && is_selected) tag = is_answer ? 'Correct!' : 'You Answered'
            else if (show_results && is_answer) tag = 'Correct Answer'

            const classes = ['quiz-answer']
            if (is_selected) classes.push('selected')
            if (show_results && is_answer) classes.push('is-answer')
            if (show_results && is_wrong) classes.push('is-wrong')

            return (
              <label key={i} className={classes.join(' ')}>
                {show_results && (is_answer || is_wrong) && (
                  <span className="quiz-answer-mark" aria-hidden="true">
                    {is_answer ? <FaCheck /> : <FaTimes />}
                  </span>
                )}
                <input
                  type="radio"
                  name={`question-${index + 1}`}
                  checked={is_selected}
                  disabled={show_results}
                  onChange={() => props.on_question_answer(i)}
                />
                <span className="quiz-answer-text">{answer}</span>
                {tag && <span className="sr-only">{tag}</span>}
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
  on_retake: () => void
}

function PostQuizResultsHeader(props: PostQuizResultsHeaderProps) {
  const percent = props.total ? Math.round((props.score / props.total) * 100) : 0
  const color = percent >= 70 ? '#0b874b' : percent >= 50 ? '#c66b00' : '#c62828'

  return (
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
}

export default function Quiz({ course }: QuizProps) {
  const { quiz } = course
  const emptyAnswers = () => quiz.questions.map(() => UNANSWERED)
  const [selected, setSelected] = useState<number[]>(emptyAnswers)
  const [started_at, setStartedAt] = useState(() => new Date())
  const [submitted_at, setSubmittedAt] = useState<Date | null>(null)

  const answered_questions = selected.map((s) => s !== UNANSWERED)
  const answered = answered_questions.filter(Boolean).length
  const score = quiz.questions.reduce((sum, q, i) => sum + (selected[i] === q.answer ? q.points : 0), 0)
  const total_points = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  const time_limit_ms = quiz.time_limit === undefined ? undefined : quiz.time_limit * 60_000
  const deadline = time_limit_ms === undefined ? null : started_at.getTime() + time_limit_ms
  const timed_out = deadline !== null && submitted_at !== null && submitted_at.getTime() >= deadline

  // if passed deadline, just submit
  useEffect(() => {
    if (deadline === null || submitted_at) return
    const id = setTimeout(() => {
      setSubmittedAt((prev) => prev ?? new Date(deadline))
      window.scrollTo({ top: 0 })
    }, deadline - Date.now())
    return () => clearTimeout(id)
  }, [deadline, submitted_at])

  const answer = (question_index: number, selected_answer_index: number) => {
    setSelected((prev) => prev.map((s, i) => (i === question_index ? selected_answer_index : s)))
  }

  const submit = () => {
    const unanswered = quiz.questions.length - answered
    if (unanswered > 0 && !window.confirm(
      `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Submit anyway?`
    )) return
    setSubmittedAt((prev) => prev ?? new Date())
    window.scrollTo({ top: 0 })
  }

  const retake = () => {
    setSelected(emptyAnswers())
    setStartedAt(new Date())
    setSubmittedAt(null)
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
            />
          )
        )}

        {!submitted_at && (
          <div className="quiz-submit-bar">
            <span className="quiz-sidebar-meta">{answered} of {quiz.questions.length} answered</span>
            <button className="quiz-btn" onClick={submit}>Submit Quiz</button>
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
    </div>
  )
}
