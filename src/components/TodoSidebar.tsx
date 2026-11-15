import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,
  FaListUl,
  FaRegCalendarCheck,
  FaRegCircle,
  FaTimes,
} from 'react-icons/fa'
import { distinct_colors } from '../data'
import type { Course } from '../types'
import { isPastDue } from '../utils'

type RangeMode = 'week' | 'month'
type TodoTab = 'todo' | 'planned' | 'done'

const RANGE_DAYS: Record<RangeMode, number> = { week: 7, month: 30 }

const TABS: { id: TodoTab; label: string; title: string; icon: JSX.Element }[] = [
  { id: 'todo', label: 'To Do', title: 'To do', icon: <FaListUl /> },
  { id: 'planned', label: 'Planned', title: 'Will be completed', icon: <FaRegCalendarCheck /> },
  { id: 'done', label: 'Done', title: 'Completed', icon: <FaCheck /> },
]

const EMPTY_TEXT: Record<TodoTab, string> = {
  todo: 'Nothing to do 🎉',
  planned: 'Nothing planned yet. Click a circle to plan it.',
  done: 'Nothing completed in this range.',
}

const SWEEP_DEG = 190
const ARC = (SWEEP_DEG / 360) * 100 // in pathLength units
const ARC_START_DEG = 180 - (SWEEP_DEG - 180) / 2
const OUTER_EDGE = 95
const RING_BAND = 56
const RING_FILL = 0.87
const SOLO_WIDTH = 50
const SOLO_R = OUTER_EDGE - SOLO_WIDTH / 2

interface TodoItem {
  key: string
  course: Course
  color: string
  title: string
  due: number
  points: number
  kind: 'lesson' | 'quiz'
  status: TodoTab
}

interface RingData {
  id: number
  label: string
  color: string
  done: number
  planned: number
  total: number
}

function addDays(ts: number, days: number): number {
  const d = new Date(ts)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

function formatRangeDay(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDue(ts: number): string {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
  return `${d.getMonth() + 1}/${d.getDate()} at ${time}`
}

function groupLabel(due: number, today: number): string {
  if (isPastDue(due)) return 'Overdue'
  if (due < addDays(today, 1)) return 'Due Today'
  if (due < addDays(today, 2)) return 'Due Tomorrow'
  return 'Due Later'
}

function buildItems(course: Course, color: string, planned: Set<string>): TodoItem[] {
  const status = (key: string, completed: boolean): TodoTab =>
    completed ? 'done' : planned.has(key) ? 'planned' : 'todo'
  const lessons = course.lessons.map((l): TodoItem => {
    const key = `${course.id}:lesson:${l.id}`
    return { key, course, color, title: l.title, due: l.due, points: l.points, kind: 'lesson', status: status(key, l.completed) }
  })
  const { quiz } = course
  const quiz_key = `${course.id}:quiz:${quiz.id}`
  return [
    ...lessons,
    {
      key: quiz_key,
      course,
      color,
      title: quiz.title,
      due: quiz.due,
      points: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      kind: 'quiz',
      status: status(quiz_key, quiz.completed_points !== null),
    },
  ]
}

function Arc(props: { r: number; width: number; color: string; length: number; opacity?: number }) {
  const style = {
    stroke: props.color,
    r: props.r,
    strokeWidth: props.width,
    strokeDasharray: `${props.length} 100`,
    strokeOpacity: props.length > 0 ? props.opacity ?? 1 : 0,
  } as CSSProperties
  return (
    <circle
      cx={100}
      cy={100}
      fill="none"
      strokeLinecap="round"
      pathLength={100}
      transform={`rotate(${ARC_START_DEG} 100 100)`}
      style={style}
    />
  )
}

function ProgressRings(props: { rings: RingData[]; focus: number | null; on_select: (id: number | null) => void }) {
  const step = Math.min(24, RING_BAND / Math.max(props.rings.length, 1))
  const ring_width = step * RING_FILL
  const solo = props.focus !== null || props.rings.length === 1
  const selectable = props.rings.length > 1
  const counted = props.rings.filter((r) => props.focus === null || r.id === props.focus)
  const done = counted.reduce((sum, r) => sum + r.done + r.planned, 0)
  const total = counted.reduce((sum, r) => sum + r.total, 0)
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <svg className="todo-rings" viewBox="0 0 200 135" role="img" aria-label={`${percent}% complete or planned, ${done} of ${total}`}>
      {props.rings.map((ring, i) => {
        const r = solo ? SOLO_R : OUTER_EDGE - ring_width / 2 - i * step
        const width = solo ? SOLO_WIDTH : ring_width
        const scale = ring.total ? ARC / ring.total : 0
        const hidden = props.focus !== null && props.focus !== ring.id
        const toggle = () => props.on_select(props.focus === ring.id ? null : ring.id)
        return (
          <g
            key={ring.id}
            className={`todo-ring course-color ${hidden ? 'hidden' : ''} ${selectable ? 'selectable' : ''}`}
            style={{ '--course': ring.color } as CSSProperties}
            role={selectable ? 'button' : undefined}
            tabIndex={selectable && !hidden ? 0 : undefined}
            aria-label={selectable ? `${props.focus === ring.id ? 'Show all courses' : 'Focus course'} ${ring.label}` : undefined}
            onClick={selectable ? toggle : undefined}
            onKeyDown={selectable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } } : undefined}
          >
            <Arc r={r} width={width} color="var(--course-mark)" length={ARC} opacity={0.2} />
            <Arc r={r} width={width} color="var(--course-mark)" length={(ring.done + ring.planned) * scale} opacity={0.5} />
            <Arc r={r} width={width} color="var(--course-mark)" length={ring.done * scale} />
          </g>
        )
      })}
      <text x={100} y={100} className="todo-rings-percent">{percent}%</text>
      <text x={100} y={122} className="todo-rings-count">{done}/{total}</text>
    </svg>
  )
}

// animates its children open/closed by collapsing their height
function Collapse(props: { open: boolean; as?: 'div' | 'li'; children: ReactNode }) {
  const Tag = props.as ?? 'div'
  return (
    <Tag className={`todo-collapse ${props.open ? '' : 'hidden'}`} aria-hidden={!props.open}>
      <div className="todo-collapse-inner">{props.children}</div>
    </Tag>
  )
}

function TodoCard(props: { item: TodoItem; on_toggle: () => void; on_open: () => void }) {
  const { item } = props
  const done = item.status === 'done'
  const late = !done && isPastDue(item.due)

  return (
    <div className={`todo-item course-color ${item.status}`} style={{ '--course': item.color } as CSSProperties}>
      <button className="todo-item-body" onClick={props.on_open}>
        <span className="todo-item-course">
          {item.course.code} · {item.course.title}
        </span>
        <span className="todo-item-title" title={item.title}>
          {item.kind === 'quiz' && <FaClipboardList className="todo-item-kind" />}
          {item.title}
        </span>
        <span className="todo-item-meta">
          <span className={late ? 'late' : ''}><b>Due</b> {formatDue(item.due)}</span>
          <span>{item.points} pts</span>
        </span>
      </button>
      <button
        className="todo-item-check"
        onClick={props.on_toggle}
        disabled={done}
        aria-label={done ? 'Completed' : item.status === 'planned' ? 'Move back to to-do' : 'Mark as will be completed'}
        title={done ? 'Completed' : item.status === 'planned' ? 'Move back to to-do' : 'Will be completed'}
      >
        {done ? <FaCheckCircle /> : item.status === 'planned' ? <FaRegCalendarCheck /> : <FaRegCircle />}
      </button>
    </div>
  )
}

interface TodoSidebarProps {
  courses: Course[]
  course?: Course
  planned: Set<string>
  togglePlanned: (key: string) => void
  openCourse: (id: number) => void
  openQuiz: (id: number) => void
}

export default function TodoSidebar({ courses, course, planned, togglePlanned, openCourse, openQuiz }: TodoSidebarProps) {
  const [mode, setMode] = useState<RangeMode>('month')
  const [offset, setOffset] = useState(0)
  const [tab, setTab] = useState<TodoTab>('todo')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [focus_id, setFocus] = useState<number | null>(null)

  const enrolled = courses.filter((c) => c.enrolled)
  const colorOf = (c: Course) => distinct_colors[Math.max(enrolled.findIndex((e) => e.id === c.id), 0) % distinct_colors.length]
  const shown = course ? [course] : enrolled
  const focus = !course && shown.some((c) => c.id === focus_id) ? focus_id : null
  const isVisible = (item: TodoItem) => focus === null || item.course.id === focus
  const items = shown.flatMap((c) => buildItems(c, colorOf(c), planned)).sort((a, b) => a.due - b.due)

  const today = new Date().setHours(0, 0, 0, 0)
  const days = RANGE_DAYS[mode]
  const start = addDays(today, offset * days)
  const end = addDays(start, days)

  const in_range = items.filter((i) => i.due >= start && i.due < end)
  const overdue = offset === 0 ? items.filter((i) => i.status !== 'done' && i.due < start) : []
  const lists: Record<TodoTab, TodoItem[]> = {
    todo: [...overdue, ...in_range].filter((i) => i.status === 'todo'),
    planned: [...overdue, ...in_range].filter((i) => i.status === 'planned'),
    done: in_range.filter((i) => i.status === 'done'),
  }

  const rings: RingData[] = shown.map((c) => {
    const mine = in_range.filter((i) => i.course.id === c.id)
    return {
      id: c.id,
      label: c.code,
      color: colorOf(c),
      done: mine.filter((i) => i.status === 'done').length,
      planned: mine.filter((i) => i.status === 'planned').length,
      total: mine.length,
    }
  })
  const planned_count = rings.filter((r) => focus === null || r.id === focus).reduce((sum, r) => sum + r.planned, 0)

  const groups: { label: string; items: TodoItem[] }[] = []
  lists[tab].forEach((item) => {
    const label = tab === 'done' ? 'Completed' : groupLabel(item.due, today)
    const group = groups.find((g) => g.label === label)
    if (group) group.items.push(item)
    else groups.push({ label, items: [item] })
  })

  const openItem = (item: TodoItem) => item.kind === 'quiz' ? openQuiz(item.course.id) : openCourse(item.course.id)

  return (
    <aside className="todo-sidebar no-select">
      <h2 className="todo-heading">{course ? `${course.code} To-Do` : 'To-Do List'}</h2>

      <div className="todo-range">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as RangeMode)
            setOffset(0)
          }}
          aria-label="Range"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <button className="todo-range-arrow" onClick={() => setOffset(offset - 1)} aria-label="Previous range">
          <FaArrowLeft />
        </button>
        <span className="todo-range-label">{formatRangeDay(start)} - {formatRangeDay(addDays(end, -1))}</span>
        <button className="todo-range-arrow" onClick={() => setOffset(offset + 1)} aria-label="Next range">
          <FaArrowRight />
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="faint">No enrolled courses.</p>
      ) : (
        <>
          <ProgressRings rings={rings} focus={focus} on_select={setFocus} />
          <ul className="todo-legend">
            {course ? (
              <>
                <li><span className="todo-dot course-color" style={{ '--course': colorOf(course) } as CSSProperties} />Completed</li>
                <li><span className="todo-dot course-color" style={{ '--course': colorOf(course), opacity: 0.5 } as CSSProperties} />Planned</li>
              </>
            ) : (
              <>
                {shown.filter((c) => focus === null || c.id === focus).map((c) => (
                  <li key={c.id}>
                    <button
                      className="todo-legend-course"
                      title={c.title}
                      aria-pressed={focus === c.id}
                      onClick={() => setFocus(focus === c.id ? null : c.id)}
                    >
                      <span className="todo-dot course-color" style={{ '--course': colorOf(c) } as CSSProperties} />
                      {focus === c.id ? `${c.code} · ${c.title}` : c.code}
                    </button>
                  </li>
                ))}
                {focus !== null && (
                  <li>
                    <button className="todo-legend-course todo-show-all" onClick={() => setFocus(null)}>
                      <FaTimes /> Show all
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
          {planned_count > 0 && <p className="todo-planned-note">+{planned_count} planned</p>}
        </>
      )}

      <div className="todo-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            title={t.title}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
            {lists[t.id].filter(isVisible).length > 0 && <span className="todo-count">{lists[t.id].filter(isVisible).length}</span>}
          </button>
        ))}
      </div>

      <Collapse open={!lists[tab].some(isVisible)}>
        <p className="todo-empty">{EMPTY_TEXT[tab]}</p>
      </Collapse>
      {groups.map((group) => {
        const group_key = `${tab}:${group.label}`
        const is_collapsed = collapsed[group_key]
        const visible_count = group.items.filter(isVisible).length
        return (
          <Collapse key={group_key} open={visible_count > 0}>
            <section className="todo-group">
              <button
                className={`todo-group-header ${group.label === 'Overdue' ? 'late' : ''}`}
                onClick={() => setCollapsed({ ...collapsed, [group_key]: !is_collapsed })}
                aria-expanded={!is_collapsed}
              >
                {group.label} ({visible_count})
                {is_collapsed ? <FaChevronRight /> : <FaChevronDown />}
              </button>
              <Collapse open={!is_collapsed}>
                <ul className="todo-list">
                  {group.items.map((item) => (
                    <Collapse key={item.key} as="li" open={isVisible(item)}>
                      <TodoCard
                        item={item}
                        on_toggle={() => togglePlanned(item.key)}
                        on_open={() => openItem(item)}
                      />
                    </Collapse>
                  ))}
                </ul>
              </Collapse>
            </section>
          </Collapse>
        )
      })}
    </aside>
  )
}
