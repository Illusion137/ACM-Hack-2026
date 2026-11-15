import type { Dispatch, SetStateAction } from 'react'

export type Minigame = 'snake' | 'minesweeper'

export interface Lesson {
  id: number
  title: string
  completed: boolean
  completed_points: number
  points: number
  due: number
  minigame: Minigame
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
  bunnyimage: string
  catnbunnyimage: string
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
  id: number;
  title: string
  instructions: string
  due: number
  time_limit?: number
  completed_points: number | null
  questions: QuizQuestion[]
}

export interface User {
  name: string
  email: string
  darkmode: boolean
  avatar: string;
  imageType: 'Default' | 'Dogs' | 'Cats' | 'Birds' | 'Bnnuy' | 'CatnBunny'
  bio?: string
  links?: string[]
  planned?: string[]
}

// ISOString -> lesson.id
export type TentativeSchedule = Record<string, string>;

export type Page = 'dashboard' | 'courses' | 'detail' | 'quizzes' | 'quiz' | 'settings' | 'profile'

export type SetCourses = Dispatch<SetStateAction<Course[]>>
