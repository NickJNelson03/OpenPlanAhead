import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("user already registered")
      ) {
        setMessage("This email is already registered. Try logging in instead.");
      } else {
        setMessage(error.message);
      }
      setMessageType("error");
      return;
    }

    if (!data.session) {
      setMessage(
        "If this email is new, check your inbox to confirm your account. If you already signed up before, try logging in instead."
      );
      setMessageType("success");
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
          <h1>Create your account</h1>
          <p>
            Start saving courses and building a plan that matches your academic
            goals.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSignup}>
          <div className="auth-card-header">
            <h2>Sign Up</h2>
            <p>Create an account to personalize your advising experience.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@kenyon.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div
              className={
                messageType === "error"
                  ? "auth-message auth-message-error"
                  : "auth-message auth-message-success"
              }
            >
              {message.includes("logging in instead") ||
              message.includes("logging in instead.") ||
              message.includes("Try logging in instead.") ? (
                <>
                  This email is already registered. <Link to="/login">Log in instead</Link>.
                </>
              ) : (
                message
              )}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}