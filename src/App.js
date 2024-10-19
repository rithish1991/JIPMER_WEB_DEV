import './App.css';
import logo from './images/MedicusLogo.PNG';
import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/login?email=${email}&password=${password}`, {
        method: 'POST', // Change to POST if your API requires it
        headers: {
          'Content-Type': 'application/text',
        },
      });

      if(response.ok)
{

  alert("login successfull")
  setSuccess(true);
      setError(null);
}
     else  {
        alert('Login failed');
        setError('Login failed');
      setSuccess(false);
      }

      
      
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      setSuccess(false);
    }
  };

  return (
    <div className="App">
      <header>
        <img src={logo} alt="Medicus Logo" className="logo" />
      </header>
      <div className="background">
        <div className="login-container">
          <h2>Sign in</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="options">
              <div>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="/">Forgot password?</a>
            </div>
            <button type="submit">Sign in</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Login successful!</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
