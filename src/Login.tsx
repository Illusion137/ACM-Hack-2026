import { useState, type FormEvent } from 'react'
import { useAuth } from "./auth"
import {useNavigate} from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const navigate = useNavigate();
  const { login } = useAuth();

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        await login(email, password);
        navigate("/home");
    } catch (err) {
        setMessage(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className="app">
    <main className="content">
      <h1>Login</h1>
      <form onSubmit={save} className="form">
        <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {message && <p className="error">{message}</p>}
        <div className="row">
          <button className="btn-a" type="submit">Login</button>
        </div>
      </form>
      <p>New User?</p>
        <div className="row">
          <button className="btn-a" onClick={() => navigate("/signup")}>Create Account</button>
        </div>
    </main>
    </div>
  )
}