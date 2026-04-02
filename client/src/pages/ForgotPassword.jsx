import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
    setMessageType("success");
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <Link to="/" className="auth-back-link">
            ← Back to course directory
          </Link>
          <div className="auth-brand-badge">OpenPlanAhead</div>
          <h1>Reset your password</h1>
          <p>
            Enter your email and we’ll send you a link to create a new password.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleResetRequest}>
          <div className="auth-card-header">
            <h2>Forgot Password</h2>
            <p>We’ll email you a secure password reset link.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              placeholder="you@kenyon.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {message}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="auth-switch">
            Remembered your password? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}