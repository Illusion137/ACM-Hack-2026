import { getProgress } from './Dashboard'
import type { Course, User } from '../types'
import default_avatar from '../assets/default-avatar.svg'

export default function Profile(props: { user: User; courses: Course[] }) {
  const { user } = props
  const enrolled = props.courses.filter((c) => c.enrolled)

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-layout">
        <img src={user.avatar || default_avatar} alt={`${user.name}'s profile picture`} className="profile-avatar" />

        <div className="profile-details">
          <h2 className="profile-name">{user.name}</h2>

          <section>
            <h3>Contact</h3>
            <p><a href={`mailto:${user.email}`}>{user.email}</a></p>
          </section>

          <section>
            <h3>Biography</h3>
            <p className={user.bio ? '' : 'profile-empty'}>{user.bio || 'No biography has been added'}</p>
          </section>

          <section>
            <h3>Links</h3>
            {user.links && user.links.length > 0 ? (
              <ul className="profile-links">
                {user.links.map((link) => (
                  <li key={link}><a href={link} target="_blank" rel="noreferrer">{link}</a></li>
                ))}
              </ul>
            ) : (
              <p className="profile-empty">No links have been added</p>
            )}
          </section>

          <section>
            <h3>Courses</h3>
            {enrolled.length > 0 ? (
              <ul className="profile-courses">
                {enrolled.map((c) => (
                  <li key={c.id}>
                    <span className="profile-course-code">{c.code}</span>
                    <span className="profile-course-title">{c.title}</span>
                    <span className="profile-course-progress">{getProgress(c)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-empty">Not enrolled in any courses</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
