import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home'
import Login from './Login'
import SignUp from './SignUp'
import { AuthProvider, RequireAuth } from './auth'

export default function App() {

  return (
    <AuthProvider>
    <Router>
    <div className="app">
      <Routes>
        <Route path="/" element={<RequireAuth guest><Login /></RequireAuth>} />
        <Route path="/signup" element={<RequireAuth guest><SignUp /></RequireAuth>} />
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </Router>
    </AuthProvider>
  )
}
