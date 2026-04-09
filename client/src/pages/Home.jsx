import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import "../App.css";

export default function Home({ session, profile, handleLogout }) {
  return (
    <div className="app">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <div className="main-content home-content">
        <div className="home-hero-card">
          <h1>OpenPlanAhead</h1>
          <p className="home-subtitle">
            Plan your academic path with a cleaner view of your profile, courses,
            and future options.
          </p>

          <div className="home-hero-actions">
            <Link to="/published-courses" className="dashboard-link-button">
              Search Courses
            </Link>
            <Link to="/my-courses" className="dashboard-link-button">
              View My Courses
            </Link>
            <Link to="/profile" className="dashboard-link-button">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Academic Snapshot</h2>
            </div>

            <div className="snapshot-list">
              <div className="snapshot-item">
                <span className="snapshot-label">Name</span>
                <span className="snapshot-value">
                  {profile?.name || "Not set"}
                </span>
              </div>

              <div className="snapshot-item">
                <span className="snapshot-label">Year</span>
                <span className="snapshot-value">
                  {profile?.academic_year || "Not set"}
                </span>
              </div>

              <div className="snapshot-item">
                <span className="snapshot-label">Primary Major</span>
                <span className="snapshot-value">
                  {profile?.primary_major || "Not set"}
                </span>
              </div>

              <div className="snapshot-item">
                <span className="snapshot-label">Second Major</span>
                <span className="snapshot-value">
                  {profile?.second_major || "—"}
                </span>
              </div>

              <div className="snapshot-item">
                <span className="snapshot-label">Minor</span>
                <span className="snapshot-value">
                  {profile?.minor || "—"}
                </span>
              </div>

              <div className="snapshot-item">
                <span className="snapshot-label">Concentration</span>
                <span className="snapshot-value">
                  {profile?.concentration || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2>Progress Overview</h2>
            </div>

            <div className="progress-stat">
              <span className="progress-number">
                {profile?.courses_taken?.length || 0}
              </span>
              <span className="progress-label">Courses marked as taken</span>
            </div>

            <p className="dashboard-empty">
              Later, this section can show degree progress, recommended next
              courses, and semester planning status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}