import { useState, type FormEvent } from 'react'
import {users} from "./data.ts"
import {useNavigate} from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const navigate = useNavigate();

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password != confirmPassword)
    {
        setMessage("Passwords do not match.");
    }
    else if (password.length < 8 || !passwordHasAllElements(password))
    {
        setNewMessage("Password must be at least 8 characters long and contain one lowercase letter, one uppercase letter, one number, and one special character.");
    }
    else
    {
        users.push({name: name, darkmode: false, imageType: "Default", email: email, password: password, avatar: "src/assets/cat1.webp"});
        navigate("/home", { state: { currentUser: users[users.length - 1] } });
    }
  }

  const passwordHasAllElements = (password: String) => {
    var hasLowerCase = false;
    var hasUpperCase = false;
    var hasNumber = false;
    var hasSpecialCharacter = false;

    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "1234567890";
    const specialChars = "./,:;!@#$%^&*()-_+=[{}]<>?"

    for (let i = 0; i < password.length; i++)
    {
        const char: string = password[i];

        if (lowerCase.includes(char))
        {
            hasLowerCase = true;
        }
        if (upperCase.includes(char))
        {
            hasUpperCase = true;
        }
        if (numbers.includes(char))
        {
            hasNumber = true;
        }
        if (specialChars.includes(char))
        {
            hasSpecialCharacter = true;
        }
    }

    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialCharacter;
  }

  return (
    <div className="app">
    <main className="content">
      <h1>Sign Up</h1>
      <form onSubmit={save} className="form">
        <input onChange={(e) => setName(e.target.value)} placeholder="Enter name:" />
        <input onChange={(e) => setEmail(e.target.value)} placeholder="Enter email:" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Enter password:" />
        {newMessage && <p className="error">{newMessage}</p>}
        <input type="password" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password:" />
        {message && <p className="error">{message}</p>}
        <div className="row">
          <button className="btn-a" onClick={() => navigate("/signup")}>Create Account</button>
        </div>
      </form>
    </main>
    </div>
  )
}