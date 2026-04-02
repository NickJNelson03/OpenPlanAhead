import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import AppNavbar from "../components/AppNavbar";
import courses from "../data/courses.json";
import "../App.css";

const SUBJECTS = ["All", ...Array.from(new Set(courses.map(c => c.subject))).sort()];

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function buildCourseLabel(course) {
  const number = String(course.course_number || "").replace(/\.00$/, "");
  return `${course.subject} ${number} - ${course.title}`;
}

function badgeClass(subject) {
  return `subject-badge badge-${subject}`;
}

export default function CourseDirectory({
  session,
  profile,
  handleLogout,
  refreshProfile,
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [updating, setUpdating] = useState("");

  const takenCourses = profile?.courses_taken || [];

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return courses.filter((c) => {
      const matchesSubject = subject === "All" || c.subject === subject;
      if (!matchesSubject) return false;

      if (!q) return true;

      return (
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.course_number.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        `${c.subject} ${c.course_number}`.toLowerCase().includes(q)
      );
    });
  }, [query, subject]);

  async function toggleTaken(courseLabel, isTaken) {
    if (!session) return;

    setUpdating(courseLabel);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const current = profile?.courses_taken || [];

      const updated = isTaken
        ? current.filter((c) => c !== courseLabel)
        : [...new Set([...current, courseLabel])];

      const payload = {
        id: user.id,
        name: profile?.name || "",
        academic_year: profile?.academic_year || null,
        primary_major: profile?.primary_major || null,
        second_major: profile?.second_major || null,
        minor: profile?.minor || null,
        concentration: profile?.concentration || null,
        courses_taken: updated,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        console.error(error);
        return;
      }

      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating("");
    }
  }

  return (
    <div className="app">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <header className="header">
        <h1>Search Courses</h1>
        <p className="subtitle">
          Kenyon College &middot; Fall 2026 Course Directory
        </p>

        <div className="search-bar">
          <div className="search-bar-inner">
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, instructor, course code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="search-divider" />

            <select
              className="subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Departments" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="results-header">
          <span className="results-count">
            {results.length} {results.length === 1 ? "course" : "courses"} found
          </span>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Dept</th>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Days</th>
                  <th>Time</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {results.map((c) => {
                  const label = buildCourseLabel(c);
                  const isTaken = takenCourses.includes(label);
                  const isLoading = updating === label;

                  return (
                    <tr key={c.crn}>
                      <td>
                        <span className={badgeClass(c.subject)}>
                          {c.subject}
                        </span>{" "}
                        {c.course_number.replace(/\.00$/, "")}
                      </td>

                      <td>{c.title}</td>
                      <td>{c.instructor}</td>
                      <td>{c.days || "—"}</td>

                      <td>
                        {c.start_time && c.end_time
                          ? `${formatTime(c.start_time)}–${formatTime(c.end_time)}`
                          : "—"}
                      </td>

                      <td>{c.credits}</td>

                      <td>
                        {session ? (
                          <button
                            className={
                              isTaken
                                ? "taken-button taken-button-active"
                                : "taken-button"
                            }
                            onClick={() => toggleTaken(label, isTaken)}
                            disabled={isLoading}
                          >
                            {isLoading
                              ? "Saving..."
                              : isTaken
                              ? "Taken"
                              : "Mark as Taken"}
                          </button>
                        ) : (
                          <span className="status-hint">Log in</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {results.length === 0 && (
              <div className="empty-state">
                No courses match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}