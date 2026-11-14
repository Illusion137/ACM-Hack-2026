import type { DetailedHTMLProps, HTMLAttributes } from 'react'

// <marquee> is deprecated and missing from React's built-in JSX types
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      marquee: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
