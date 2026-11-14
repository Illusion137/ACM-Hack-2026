import { useState, type FormEvent } from 'react'
import {users} from "./data.ts"
import {useNavigate} from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const navigate = useNavigate();

  const save = (e: FormEvent<HTMLFormElement>) => {
    var loggedIn = false;
    e.preventDefault();
    users.forEach((user) => {
        if (email == user.email && password == user.password)
        {
            loggedIn = true;
            navigate("/home", { state: { currentUser: user } });
        }
    })
    if (!loggedIn)
    {
        setMessage("Login attempt failed - email or password is incorrect.");
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
    </main>
    </div>
  )
}