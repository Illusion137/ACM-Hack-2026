import { useState } from 'react'
import type { User, Course, SetCourses } from '../types'
import { distinct_colors } from '../data'
import { selectImage } from '../utils'

interface CoursesProps {
  courses: Course[]
  setCourses: SetCourses
  openCourse: (id: number) => void
  user: User
}

export default function Courses({ courses, setCourses, openCourse, user }: CoursesProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = courses.filter(
    (c) => c.title.includes(query) && (category === 'All' || c.category === category)
  )

  const on_click = (c: Course) => {
    if(c.enrolled) openCourse(c.id)
  }

  const enroll = (course: Course) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === course.id
          ? { ...c, enrolled: true }
          : c
      )
    )
  }

  const unenroll = (course: Course) => {
     setCourses(prev =>
      prev.map(c =>
        c.id === course.id
          ? { ...c, enrolled: false }
          : c
      )
    )
  }

  return (
    <div>
      <h1>Module Entities</h1>
      <div className="toolbar">
        <input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          <option>Programming</option>
          <option>Data</option>
          <option>Design</option>
          <option>Business</option>
        </select>
      </div>

      {filtered.length === 0 && <p className="faint">0 results.</p>}

      <div className="grid">
        {filtered.map((c, i) => (
          <div className="card">
            <img src={selectImage(c, user)} onClick={() => on_click(c)} />
            <div className="card-body">
              <p className="code">{c.code}</p>
              <h3 style={{color: distinct_colors[i]}} onClick={() => on_click(c)}>{c.title}</h3>
              <p className="faint">{c.instructor}</p>
              {c.enrolled ? (
                <button className="btn-green" onClick={() => unenroll(c)}>Unenroll</button>
              ) : (
                <button className="btn-b" onClick={() => enroll(c)}>Enroll</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
