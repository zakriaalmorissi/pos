import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { url } from "../../../network/constants";
import { postData } from "../../../network/api";
import { LoadingSpinner } from "../../main/components/components";
import './login.css';

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const device = await window.api?.getSystemInfo();
    setIsLoading(true);

    await postData(`${url}accounts/login/`, {
      data: {
        device: device,
        username,
        password,
      },
      getResponse: (response) => {
        if (response.status === 'ok') {
          const { access, refresh } = response.data.tokens;
          localStorage.setItem("accessToken", access);
          localStorage.setItem("refreshToken", refresh);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setIsLoading(false);
          navigate('/');
        } else {
          console.log(response);
          setIsLoading(false);
          setError(response.data?.message || "Login failed. Please try again.");
        }
      }
    });
  };

  return (
    <div className="login-page">
      <div className="login-header" />
      <div className="login-body">
        <div className="login-info">
          <h1>Zack POS System</h1>
        </div>
        <div className="login-form-container">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <p>Please enter your credentials to log in.</p>

            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner/> : "Login"}
            </button>

            <p className="register-link">
              <Link to="/register">Don't have an account? Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
