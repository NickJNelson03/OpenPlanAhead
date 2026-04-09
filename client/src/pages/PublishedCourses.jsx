import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { supabase } from "../lib/supabase";
import "../App.css";

export default function PublishedCourses({ session, profile, handleLogout }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  useEffect(() => {
    async function loadPublishedCourses() {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("subject", { ascending: true })
        .order("course_code", { ascending: true });

      if (error) {
        console.error("Failed to load published courses:", error);
        setCourses([]);
      } else {
        setCourses(data || []);
      }

      setLoading(false);
    }

    loadPublishedCourses();
  }, []);

  const SUBJECTS = useMemo(() => {
    return ["All", ...Array.from(new Set(courses.map((c) => c.subject))).sort()];
  }, [courses]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return courses.filter((c) => {
      const matchesSubject = subject === "All" || c.subject === subject;
      if (!matchesSubject) return false;

      if (!q) return true;

      return (
        c.title?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.course_code?.toLowerCase().includes(q) ||
        `${c.subject} ${c.course_code}`.toLowerCase().includes(q) ||
        c.offer_period?.toLowerCase().includes(q) ||
        c.prerequisites?.toLowerCase().includes(q) ||
        c.corequisites?.toLowerCase().includes(q)
      );
    });
  }, [courses, query, subject]);

  if (loading) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div className="main-content">Loading published courses...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <header className="header">
        <h1>Published Courses</h1>
        <p className="subtitle">Courses available for students to browse</p>

        <div className="search-bar">
          <div className="search-bar-inner">
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, subject, course code..."
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
                  <th>Course</th>
                  <th>Title</th>
                  <th>Credits</th>
                  <th>Offer Period</th>
                  <th>Restrictions</th>
                  <th>Prerequisites</th>
                  <th>Corequisites</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => (
                  <tr key={c.id}>
                    <td>{`${c.subject} ${c.course_code}`}</td>
                    <td>{c.title}</td>
                    <td>{c.credit_hours ?? "—"}</td>
                    <td>{c.offer_period || "—"}</td>
                    <td>
                      {Array.isArray(c.restrictions) && c.restrictions.length > 0
                        ? c.restrictions.join(", ")
                        : "—"}
                    </td>
                    <td>{c.prerequisites || "—"}</td>
                    <td>{c.corequisites || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {results.length === 0 && (
              <div className="empty-state">No published courses found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}