import { useEffect } from 'react'
import { useAnoraconda } from '@norarcasey/anoraconda'
import type { Direction } from '@norarcasey/anoraconda'
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from 'react-icons/fa'

const SIZE = 14
const TARGET = 5
const SPEED_MS = 140

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
}

export default function Snake(props: { on_win: () => void }) {
  const game = useAnoraconda({ cols: SIZE, rows: SIZE, speed: SPEED_MS })

  const turn = (direction: Direction) => {
    if (game.status === 'idle') game.start()
    game.turn(direction)
  }

  useEffect(() => {
    const on_key = (event: KeyboardEvent) => {
      const direction = KEYS[event.key]
      if (!direction) return
      event.preventDefault()
      turn(direction)
    }
    window.addEventListener('keydown', on_key)
    return () => window.removeEventListener('keydown', on_key)
  })

  useEffect(() => {
    if (game.score >= TARGET) props.on_win()
  }, [game.score])

  const cell_class = (x: number, y: number) => {
    if (game.snake[0].x === x && game.snake[0].y === y) return 'game-cell snake-head'
    if (game.snake.some((p) => p.x === x && p.y === y)) return 'game-cell snake-body'
    if (game.food.x === x && game.food.y === y) return 'game-cell snake-food'
    return 'game-cell'
  }

  return (
    <div className="game">
      <div className="game-status">
        <span>Apples: {Math.min(game.score, TARGET)} / {TARGET}</span>
        {game.status === 'idle' && <span>Press an arrow key or WASD to start</span>}
        {game.status === 'over' && <button className="quiz-btn" onClick={game.reset}>Try again</button>}
      </div>
      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }} aria-label="Snake board">
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <div key={i} className={cell_class(i % SIZE, Math.floor(i / SIZE))} />
        ))}
      </div>
      <div className="snake-pad">
        <button aria-label="Up" onClick={() => turn('up')}><FaArrowUp /></button>
        <button aria-label="Left" onClick={() => turn('left')}><FaArrowLeft /></button>
        <button aria-label="Down" onClick={() => turn('down')}><FaArrowDown /></button>
        <button aria-label="Right" onClick={() => turn('right')}><FaArrowRight /></button>
      </div>
    </div>
  )
}
