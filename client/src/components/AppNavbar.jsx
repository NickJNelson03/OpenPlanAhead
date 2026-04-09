import { Link, useLocation } from "react-router-dom";
import "../App.css";

export default function AppNavbar({ session, profile, handleLogout }) {
  const location = useLocation();

  function navClass(path) {
    return location.pathname === path ? "nav-link nav-link-active" : "nav-link";
  }

  const isCreator = profile?.role === "creator" || profile?.role === "root";
  const isRoot = profile?.role === "root";

  return (
    <div className="app-navbar">
      <div className="app-navbar-left">
        <Link to="/" className="app-brand">
          OpenPlanAhead
        </Link>

        {session && (
          <div className="app-nav-links">
            <Link to="/" className={navClass("/")}>
              Home
            </Link>
            <Link to="/courses" className={navClass("/courses")}>
              Search Courses
            </Link>
            <Link
              to="/published-courses"
              className={navClass("/published-courses")}
            >
              Published Courses
            </Link>
            <Link to="/my-courses" className={navClass("/my-courses")}>
              My Courses
            </Link>
            <Link to="/profile" className={navClass("/profile")}>
              Profile
            </Link>

            {isCreator && (
              <>
                <Link to="/view-courses" className={navClass("/view-courses")}>
                  View Courses
                </Link>
                <Link to="/create-course" className={navClass("/create-course")}>
                  Create Courses
                </Link>
              </>
            )}

            {isRoot && (
              <Link to="/manage-users" className={navClass("/manage-users")}>
                Manage Users
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="app-navbar-right">
        {session ? (
          <>
            <span className="navbar-user">
              {profile?.name ? `Hello, ${profile.name}` : session.user.email}
              {profile?.role ? ` (${profile.role})` : ""}
            </span>
            <button className="navbar-logout" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Log In
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}