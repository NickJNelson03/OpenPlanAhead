import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import "../App.css";

export default function MyCourses({ session, profile, handleLogout }) {
  const takenCourses = profile?.courses_taken || [];

  return (
    <div className="app">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <div className="main-content">
        <div className="results-header">
          <span className="results-count">
            {takenCourses.length} {takenCourses.length === 1 ? "course" : "courses"} marked as taken
          </span>
        </div>

        <div className="table-card my-courses-card">
          <div className="my-courses-header">
            <h2>My Courses</h2>
            <Link to="/courses" className="dashboard-link-button">
              Search Courses
            </Link>
          </div>

          {takenCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📘</div>
              You have not marked any courses as taken yet.
            </div>
          ) : (
            <div className="taken-course-list">
              {takenCourses.map((course) => (
                <div key={course} className="taken-course-item">
                  {course}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}