import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <Link to="/" className="auth-back-link">
            ← Back to course directory
          </Link>
          <div className="auth-brand-badge">OpenPlanAhead</div>
          <h1>Welcome back</h1>
          <p>
            Log in to save courses, build plans, and unlock personalized advising
            tools.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card-header">
            <h2>Log In</h2>
            <p>Use your email and password to continue.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@kenyon.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <div className="auth-message auth-message-error">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
          <p className="auth-switch">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <p className="auth-switch">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}