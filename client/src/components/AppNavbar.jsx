import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../App.css";

export default function AppNavbar({ session, profile, handleLogout }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  function linkClass(path) {
    return location.pathname === path
      ? "dropdown-link dropdown-link-active"
      : "dropdown-link";
  }

  function toggleMenu(menu) {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCreator = profile?.role === "creator" || profile?.role === "root";
  const isRoot = profile?.role === "root";

  return (
    <div className="app-navbar" ref={navRef}>
      <div className="app-navbar-left">
        <Link to="/" className="app-brand">
          OpenPlanAhead
        </Link>

        {session && (
          <div className="app-nav-groups">
            <div className="nav-group">
              <button
                type="button"
                className="nav-group-trigger"
                onClick={() => toggleMenu("dashboard")}
              >
                Dashboard
                <span className={`nav-arrow ${openMenu === "dashboard" ? "open" : ""}`}>
                  ▼
                </span>
              </button>

              {openMenu === "dashboard" && (
                <div className="nav-dropdown">
                  <Link to="/" onClick={() => setOpenMenu(null)} className={linkClass("/")}>
                    Home
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setOpenMenu(null)}
                    className={linkClass("/profile")}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-courses"
                    onClick={() => setOpenMenu(null)}
                    className={linkClass("/my-courses")}
                  >
                    My Courses
                  </Link>
                </div>
              )}
            </div>

            <div className="nav-group">
              <button
                type="button"
                className="nav-group-trigger"
                onClick={() => toggleMenu("academics")}
              >
                Academics
                <span className={`nav-arrow ${openMenu === "academics" ? "open" : ""}`}>
                  ▼
                </span>
              </button>

              {openMenu === "academics" && (
                <div className="nav-dropdown">
                  <Link
                    to="/course-offerings"
                    onClick={() => setOpenMenu(null)}
                    className={linkClass("/course-offerings")}
                  >
                    Course Offerings
                  </Link>
                  <Link
                    to="/published-courses"
                    onClick={() => setOpenMenu(null)}
                    className={linkClass("/published-courses")}
                  >
                    Published Courses
                  </Link>
                </div>
              )}
            </div>

            {isCreator && (
              <div className="nav-group">
                <button
                  type="button"
                  className="nav-group-trigger"
                  onClick={() => toggleMenu("admin")}
                >
                  Admin
                  <span className={`nav-arrow ${openMenu === "admin" ? "open" : ""}`}>
                    ▼
                  </span>
                </button>

                {openMenu === "admin" && (
                  <div className="nav-dropdown">
                    <Link
                      to="/manage-courses"
                      onClick={() => setOpenMenu(null)}
                      className={linkClass("/manage-courses")}
                    >
                      Manage Courses
                    </Link>
                    <Link
                      to="/create-course"
                      onClick={() => setOpenMenu(null)}
                      className={linkClass("/create-course")}
                    >
                      Create Course
                    </Link>
                    {isRoot && (
                      <Link
                        to="/manage-users"
                        onClick={() => setOpenMenu(null)}
                        className={linkClass("/manage-users")}
                      >
                        Manage Users
                      </Link>
                    )}
                  </div>
                )}
              </div>
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
            <Link to="/login" className="nav-auth-link">
              Log In
            </Link>
            <Link to="/signup" className="nav-auth-link nav-auth-link-filled">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}