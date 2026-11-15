import { useState } from 'react'
import type { CSSProperties } from 'react'
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

  const [buttonText, setButtonText] = useState('Show Enrolled Only');

  const filtered = courses.filter(
    (c) => c.title.includes(query) && ((category === 'All' && buttonText === 'Show Enrolled Only') || c.category === category || buttonText === 'Show All Courses' && c.enrolled)
  )

  const on_click = (c: Course) => {
    if(c.enrolled) openCourse(c.id);
    if(!c.enrolled) handleOpen();
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
        {filtered.map((c, i) => (
          <div className="card">
            <img src={selectImage(c, user)} onClick={() => on_click(c)} />
            <div className="card-body">
              <p className="code">{c.code}</p>
              <h3 className="course-color" style={{ '--course': distinct_colors[i] } as CSSProperties} onClick={() => on_click(c)}>{c.title}</h3>
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
