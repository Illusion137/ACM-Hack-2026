import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'
import Login from './Login'

export default function App() {

  return (
    <Router>
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
    </Router>
  )
}