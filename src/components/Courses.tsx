import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { User, Course, SetCourses } from '../types'
import { distinct_colors } from '../data'
import { selectImage } from '../utils'
import { apiRequest } from '../auth'

interface CoursesProps {
  courses: Course[]
  setCourses: SetCourses
  openCourse: (id: number) => void
  user: User
}

export default function Courses({ courses, setCourses, openCourse, user }: CoursesProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const [buttonText, setButtonText] = useState('Show Enrolled Only');

  const enrolled_only = buttonText === 'Show All Courses'
  const search = query.trim().toLowerCase()
  const filtered = courses.filter(
    (c) => c.title.toLowerCase().includes(search)
      && (category === 'All' || c.category === category)
      && (!enrolled_only || c.enrolled)
  )
  const colorOf = (c: Course) => distinct_colors[courses.indexOf(c) % distinct_colors.length]

  const on_click = (c: Course) => {
    if(c.enrolled) openCourse(c.id);
    if(!c.enrolled) handleOpen();
  }

  const setEnrolled = (course: Course, enrolled: boolean) => {
    apiRequest<{ course: Course }>(enrolled ? 'enroll' : 'unenroll', { course: course.id })
      .then(({ course: updated }) => setCourses(prev => prev.map(c => c.id === updated.id ? updated : c)))
      .catch((err) => alert(err.message))
  }

  const enroll = (course: Course) => setEnrolled(course, true)
  const unenroll = (course: Course) => setEnrolled(course, false)

  const handleClick = () => {
    setButtonText(buttonText === 'Show Enrolled Only' ? 'Show All Courses' : 'Show Enrolled Only');
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
      setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

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

        <button className="btn" onClick={handleClick}>{buttonText}</button>
      </div>

      {filtered.length === 0 && <p className="faint">0 results.</p>}

      <div className="grid">
        {filtered.map((c) => (
          <div key={c.id} className="card">
            <img src={selectImage(c, user)} onClick={() => on_click(c)} />
            <div className="card-body">
              <p className="code">{c.code}</p>
              <h3 className="course-color" style={{ '--course': colorOf(c) } as CSSProperties} onClick={() => on_click(c)}>{c.title}</h3>
              <p className="faint">{c.instructor}</p>
              {c.enrolled ? (
                <button className="btn-unenroll" onClick={() => unenroll(c)}>Unenroll</button>
              ) : (
                <button className="btn-enroll" onClick={() => enroll(c)}>Enroll</button>
              )}
            </div>
            </div>
        ))}
      </div>

      {open?(
              <div
                onClick={handleClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
              >
              <div
                style={{
                    background: "white",
                    height: 150,
                    width: 240,
                    margin: "auto",
                    padding: "2%",
                    border: "2px solid #000",
                    borderRadius: "10px",
                    boxShadow: "2px solid black",
                }}
              >
              <h3>Enroll in the class to access course content!</h3>
            </div>
        </div>) : (null)}
    </div>
  )
}
