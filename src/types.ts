import type { Dispatch, SetStateAction } from 'react'

export interface Lesson {
  id: number
  title: string
  duration: number
  completed: boolean
}

export interface Course {
  id: number
  code: string
  title: string
  instructor: string
  category: string
  enrolled: boolean
  startDate: number
  image: string
  lessons: Lesson[]
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export interface User {
  name: string
  email: string
}

export type Page = 'dashboard' | 'courses' | 'detail' | 'quiz' | 'settings'

export type SetCourses = Dispatch<SetStateAction<Course[]>>
