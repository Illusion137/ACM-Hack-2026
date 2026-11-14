import { useState, type MouseEventHandler } from 'react'
import type { Course, SetCourses } from '../types'

interface CoursesProps {
  courses: Course[]
  setCourses: SetCourses
  openCourse: (id: number) => void
}

export default function Courses({ courses, setCourses, openCourse }: CoursesProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  
  const [buttonText, setButtonText] = useState('Show Enrolled Only');

  const filtered = courses.filter(
    (c) => c.title.includes(query) && ((category === 'All' && buttonText === 'Show Enrolled Only') || c.category === category || buttonText === 'Show All Courses' && c.enrolled)
  )

  const enroll = (id: number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, enrolled: true } : c)))
  }

  const unenroll = (id: number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, enrolled: false } : c)))
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
        {filtered.map((c) => (
          <div className="card">
            <img src={c.birdimage} onClick={() =>
                c.enrolled ? openCourse(c.id) : handleOpen()} />
            <div className="card-body">
              <p className="code">{c.code}</p>
              <h3 onClick={() => c.enrolled ? openCourse(c.id) : handleOpen()}>{c.title}</h3>
              <p className="faint">{c.instructor}</p>
              {c.enrolled ? (
                <button className="btn-green" onClick={() => unenroll(c.id)}>Unenroll</button>
              ) : (
                <button className="btn-b" onClick={() => enroll(c.id)}>Enroll</button>
              )}
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
          
        ))}
      </div>
    </div>
  )
}