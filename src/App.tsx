import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'
import Login from './Login'
import SignUp from './SignUp'

export default function App() {

  return (
    <Router>
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
    </Router>
  )
}