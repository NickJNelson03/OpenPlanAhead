import { useState, useMemo } from "react";
import courses from "./data/courses.json";
import "./App.css";

const SUBJECTS = ["All", ...Array.from(new Set(courses.map((c) => c.subject))).sort()];

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

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

  return (
    <div className="app">
      <header className="header">
        <h1>OpenPlanAhead</h1>
        <p className="subtitle">Kenyon College · Fall 2026 Course Directory</p>
      </header>

      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title, instructor, course code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
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

      <div className="results-count">
        {results.length} course{results.length !== 1 ? "s" : ""} found
      </div>

      <div className="table-wrapper">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Days</th>
              <th>Time</th>
              <th>Seats</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {results.map((c) => (
              <tr key={c.crn}>
                <td className="code-cell">
                  <span className="subject-badge">{c.subject}</span>{" "}
                  {c.course_number.replace(/\.00$/, "")}
                </td>
                <td className="title-cell">{c.title}</td>
                <td>{c.instructor}</td>
                <td className="days-cell">{c.days}</td>
                <td className="time-cell">
                  {c.start_time && c.end_time
                    ? `${formatTime(c.start_time)}–${formatTime(c.end_time)}`
                    : "—"}
                </td>
                <td
                  className={`seats-cell ${
                    parseInt(c.seats_available) === 0 ? "no-seats" : ""
                  }`}
                >
                  {c.seats_available}
                </td>
                <td>{c.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {results.length === 0 && (
          <div className="empty-state">No courses match your search.</div>
        )}
      </div>
    </div>
  );
}
