import { useEffect, useState } from 'react'
import { useMinesweeper } from '@ebinas/react-use-minesweeper/react'
import type { Cell } from '@ebinas/react-use-minesweeper'
import { FaBomb, FaFlag } from 'react-icons/fa'

const SIZE = 8
const MINES = 8

export default function Minesweeper(props: { on_win: () => void }) {
  const { game, board, stats, open, setFlag, restart } = useMinesweeper({
    config: { rows: SIZE, cols: SIZE, mines: MINES },
    firstClick: 'zero',
  })
  const [flag_mode, setFlagMode] = useState(false)
  const finished = game.status === 'won' || game.status === 'lost'
  const mines = new Set(game.mines ?? [])

  const toggleFlag = (cell: Cell) => {
    if (finished || cell.state === 'revealed') return
    setFlag(cell.id, cell.flag === 'flag' ? 'none' : 'flag')
  }

  const click = (cell: Cell) => {
    if (flag_mode) return toggleFlag(cell)
    if (finished || cell.flag === 'flag') return
    open(cell.id)
  }

  useEffect(() => {
    if (game.status === 'won') props.on_win()
  }, [game.status])

  const content = (cell: Cell) => {
    if (cell.state === 'revealed') return cell.value === 'mine' ? <FaBomb /> : cell.value || ''
    if (game.status === 'lost' && mines.has(cell.id)) return <FaBomb />
    return cell.flag === 'flag' ? <FaFlag /> : ''
  }

  return (
    <div className="game">
      <div className="game-status">
        <span><FaFlag /> {stats.remainingMines} left</span>
        <label>
          <input type="checkbox" checked={flag_mode} onChange={() => setFlagMode(!flag_mode)} /> Flag mode
        </label>
        {game.status === 'lost' && <button className="quiz-btn" onClick={restart}>Try again</button>}
      </div>
      <div className="mine-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }} aria-label="Minesweeper board">
        {board.cells.map((cell) => {
          const revealed = cell.state === 'revealed'
          const is_mine = (revealed && cell.value === 'mine') || (game.status === 'lost' && mines.has(cell.id))
          return (
            <button
              key={cell.id}
              className={`mine-cell ${revealed || is_mine ? 'revealed' : ''} ${is_mine ? 'mine' : ''}`}
              data-adjacent={revealed && cell.value !== 'mine' ? cell.value : undefined}
              onClick={() => click(cell)}
              onContextMenu={(event) => {
                event.preventDefault()
                toggleFlag(cell)
              }}
            >
              {content(cell)}
            </button>
          )
        })}
      </div>
      <p className="game-hint">Click to reveal, right-click (or enter flag mode) to flag.</p>
    </div>
  )
}
