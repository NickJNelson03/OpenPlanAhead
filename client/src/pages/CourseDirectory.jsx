import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import AppNavbar from "../components/AppNavbar";
import "../App.css";

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

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function CourseDirectory({
  session,
  profile,
  handleLogout,
  refreshProfile,
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const [allTerms, setAllTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [termsLoading, setTermsLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [localTakenCourses, setLocalTakenCourses] = useState(
    profile?.courses_taken || []
  );
  const [saving, setSaving] = useState(false);
  const [queuedLabels, setQueuedLabels] = useState(new Set());

  const desiredCoursesRef = useRef(profile?.courses_taken || []);
  const savedCoursesRef = useRef(profile?.courses_taken || []);
  const saveInFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    async function loadTerms() {
      setTermsLoading(true);

      const { data, error } = await supabase
        .from("course_offerings")
        .select("term")
        .order("term", { ascending: true });

      if (error) {
        console.error("Failed to load terms:", error);
        setAllTerms([]);
      } else {
        const uniqueTerms = Array.from(
          new Set((data || []).map((row) => row.term).filter(Boolean))
        );
        setAllTerms(uniqueTerms);
      }

      setTermsLoading(false);
    }

    loadTerms();
  }, []);

  useEffect(() => {
    async function loadCoursesForTerm() {
      if (!selectedTerm) {
        setCourses([]);
        return;
      }

      setCoursesLoading(true);

      const { data, error } = await supabase
        .from("course_offerings")
        .select("*")
        .eq("term", selectedTerm)
        .order("subject", { ascending: true })
        .order("course_number", { ascending: true });

      if (error) {
        console.error("Failed to load course offerings:", error);
        setCourses([]);
      } else {
        setCourses(data || []);
      }

      setCoursesLoading(false);
    }

    loadCoursesForTerm();
  }, [selectedTerm]);

  useEffect(() => {
    const incoming = profile?.courses_taken || [];

    if (!dirtyRef.current) {
      setLocalTakenCourses(incoming);
      desiredCoursesRef.current = incoming;
      savedCoursesRef.current = incoming;
    }

    initializedRef.current = true;
  }, [profile?.courses_taken]);

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
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        String(c.course_number || "").toLowerCase().includes(q) ||
        (c.instructor || "").toLowerCase().includes(q) ||
        `${c.subject} ${c.course_number}`.toLowerCase().includes(q)
      );
    });
  }, [query, subject, courses]);

  async function flushCourseUpdates() {
    if (!session?.user) return;
    if (saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    setSaving(true);

    try {
      while (!arraysEqual(savedCoursesRef.current, desiredCoursesRef.current)) {
        const snapshot = [...desiredCoursesRef.current];

        const payload = {
          id: session.user.id,
          name: profile?.name || "",
          academic_year: profile?.academic_year || null,
          primary_major: profile?.primary_major || null,
          second_major: profile?.second_major || null,
          minor: profile?.minor || null,
          concentration: profile?.concentration || null,
          courses_taken: snapshot,
          role: profile?.role || "student",
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("profiles").upsert(payload);

        if (error) {
          console.error(error);
          desiredCoursesRef.current = savedCoursesRef.current;
          setLocalTakenCourses(savedCoursesRef.current);
          dirtyRef.current = false;
          break;
        }

        savedCoursesRef.current = snapshot;
      }

      if (arraysEqual(savedCoursesRef.current, desiredCoursesRef.current)) {
        dirtyRef.current = false;
      }

      await refreshProfile();
    } catch (err) {
      console.error(err);
      desiredCoursesRef.current = savedCoursesRef.current;
      setLocalTakenCourses(savedCoursesRef.current);
      dirtyRef.current = false;
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
      setQueuedLabels(new Set());

      if (!arraysEqual(savedCoursesRef.current, desiredCoursesRef.current)) {
        flushCourseUpdates();
      }
    }
  }

  function toggleTaken(courseLabel, isTaken) {
    if (!session?.user) return;

    setLocalTakenCourses((prev) => {
      const updated = isTaken
        ? prev.filter((c) => c !== courseLabel)
        : [...new Set([...prev, courseLabel])];

      desiredCoursesRef.current = updated;
      dirtyRef.current = true;

      return updated;
    });

    setQueuedLabels((prev) => {
      const next = new Set(prev);
      next.add(courseLabel);
      return next;
    });

    flushCourseUpdates();
  }

  const takenCourses = localTakenCourses;

  if (termsLoading) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div className="main-content">Loading semesters...</div>
      </div>
    );
  }

  if (!selectedTerm) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />

        <div className="create-course-page">
          <div className="create-course-shell">
            <div className="create-course-hero">
              <div className="auth-brand-badge">OpenPlanAhead</div>
              <h1>Choose a Semester</h1>
              <p>
                Select the semester you want to browse before viewing course
                offerings.
              </p>

              <div className="create-course-hero-pills">
                <span className="create-course-pill">Course Offerings</span>
                <span className="create-course-pill">Semester Search</span>
              </div>
            </div>

            <div className="create-course-card">
              <div className="create-course-section">
                <div className="create-course-section-header">
                  <h2>Available Semesters</h2>
                  <p>Choose one to continue.</p>
                </div>

                <div className="restriction-chip-group">
                  {allTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="restriction-chip"
                      onClick={() => setSelectedTerm(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {allTerms.length === 0 && (
                  <div className="empty-state">
                    No course offering semesters found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (coursesLoading) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div className="main-content">Loading course offerings...</div>
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
        <h1>Course Offerings</h1>
        <p className="subtitle">Browsing offerings for {selectedTerm}</p>

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

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {saving && <span className="status-hint">Saving changes...</span>}
            <button
              type="button"
              className="create-course-secondary"
              onClick={() => {
                setSelectedTerm("");
                setQuery("");
                setSubject("All");
              }}
            >
              Change Semester
            </button>
          </div>
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
                  const isLoading = queuedLabels.has(label);

                  return (
                    <tr key={`${c.term}-${c.crn}`}>
                      <td>
                        <span className={badgeClass(c.subject)}>
                          {c.subject}
                        </span>{" "}
                        {String(c.course_number || "").replace(/\.00$/, "")}
                      </td>

                      <td>{c.title}</td>
                      <td>{c.instructor || "—"}</td>
                      <td>{c.days || "—"}</td>

                      <td>
                        {c.start_time && c.end_time
                          ? `${formatTime(c.start_time)}–${formatTime(c.end_time)}`
                          : "—"}
                      </td>

                      <td>{c.credits || "—"}</td>

                      <td>
                        {session ? (
                          <button
                            className={
                              isTaken
                                ? "taken-button taken-button-active"
                                : "taken-button"
                            }
                            onClick={() => toggleTaken(label, isTaken)}
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
                No courses match your search for {selectedTerm}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}