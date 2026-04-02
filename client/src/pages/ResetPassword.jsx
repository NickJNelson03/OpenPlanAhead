import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initializeResetSession() {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage("This reset link is invalid or expired.");
          setMessageType("error");
          return;
        }
      }

      setReady(true);
    }

    initializeResetSession();
  }, []);

  async function handlePasswordUpdate(e) {
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");
    setMessageType("success");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }

  if (!ready && !message) {
    return <div className="app">Loading...</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <Link to="/" className="auth-back-link">
            ← Back to course directory
          </Link>
          <div className="auth-brand-badge">OpenPlanAhead</div>
          <h1>Create a new password</h1>
          <p>
            Choose a new password for your account and then log back in.
          </p>
        </div>

        <form className="auth-card" onSubmit={handlePasswordUpdate}>
          <div className="auth-card-header">
            <h2>Change Password</h2>
            <p>Enter your new password below.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              placeholder="Re-enter your new password"
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
              {message}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          <p className="auth-switch">
            Back to <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}