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
  dogimage: string
  catimage: string
  birdimage: string
  lessons: Lesson[]
  quiz: QuizInfo
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
  points: number
}

export interface QuizInfo {
  title: string
  instructions: string
  due: number
  time_limit?: number
  questions: QuizQuestion[]
}

export interface User {
  name: string
  email: string
  avatar: string
  password: string
  imageType: string
  bio?: string
  links?: string[]
}

export type Page = 'dashboard' | 'courses' | 'detail' | 'quizzes' | 'quiz' | 'settings' | 'profile' | 'profile'

export type SetCourses = Dispatch<SetStateAction<Course[]>>
