import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import courses from "../data/courses.json";
import {
  MAJOR_OPTIONS,
  MINOR_OPTIONS,
  CONCENTRATION_OPTIONS,
} from "../data/programOptions";

const YEAR_OPTIONS = [
  "First Year",
  "Sophomore",
  "Junior",
  "Senior",
  "Other",
];

function buildCourseLabel(course) {
  const number = String(course.course_number || "").replace(/\.00$/, "");
  return `${course.subject} ${number} - ${course.title}`;
}

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [primaryMajor, setPrimaryMajor] = useState("");
  const [secondMajor, setSecondMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [concentration, setConcentration] = useState("");
  const [coursesTaken, setCoursesTaken] = useState([]);
  const [courseQuery, setCourseQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(`
            name,
            academic_year,
            primary_major,
            second_major,
            minor,
            concentration,
            courses_taken
          `)
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error);
        }

        if (isMounted && data) {
          setName(data.name || "");
          setAcademicYear(data.academic_year || "");
          setPrimaryMajor(data.primary_major || "");
          setSecondMajor(data.second_major || "");
          setMinor(data.minor || "");
          setConcentration(data.concentration || "");
          setCoursesTaken(data.courses_taken || []);
        }
      } catch (err) {
        console.error("Unexpected profile load error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.toLowerCase().trim();
    if (!q) return [];

    return courses
      .filter((course) => {
        const label = buildCourseLabel(course).toLowerCase();
        const code = `${course.subject} ${String(course.course_number || "").replace(/\.00$/, "")}`.toLowerCase();
        return label.includes(q) || code.includes(q);
      })
      .filter((course) => !coursesTaken.includes(buildCourseLabel(course)))
      .slice(0, 8);
  }, [courseQuery, coursesTaken]);

  function addCourse(course) {
    const label = buildCourseLabel(course);
    if (coursesTaken.includes(label)) return;
    setCoursesTaken((prev) => [...prev, label]);
    setCourseQuery("");
  }

  function removeCourse(courseLabel) {
    setCoursesTaken((prev) => prev.filter((course) => course !== courseLabel));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in.");
        setMessageType("error");
        setSaving(false);
        return;
      }

      if (secondMajor && secondMajor === primaryMajor) {
        setMessage("Your second major cannot be the same as your primary major.");
        setMessageType("error");
        setSaving(false);
        return;
      }

      const payload = {
        id: user.id,
        name: name.trim(),
        academic_year: academicYear,
        primary_major: primaryMajor,
        second_major: secondMajor || null,
        minor: minor || null,
        concentration: concentration || null,
        courses_taken: coursesTaken,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload)
        .select()
        .single();

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        setSaving(false);
        return;
      }

      await supabase.auth.updateUser({
        data: { name: name.trim() },
      });

      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (err) {
      console.error("Profile save error:", err);
      setMessage("Something went wrong while saving your profile.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
          <h1>Edit your profile</h1>
          <p>
            Add your academic details so we can personalize your advising
            experience.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <h2>Profile</h2>
            <p>Update your academic information and courses already completed.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="profile-year">Academic Year</label>
            <select
              id="profile-year"
              className="auth-select"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            >
              <option value="">Select your year</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-primary-major">Primary Major</label>
            <select
              id="profile-primary-major"
              className="auth-select"
              value={primaryMajor}
              onChange={(e) => setPrimaryMajor(e.target.value)}
              required
            >
              <option value="">Select your primary major</option>
              {MAJOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-second-major">Second Major</label>
            <select
              id="profile-second-major"
              className="auth-select"
              value={secondMajor}
              onChange={(e) => setSecondMajor(e.target.value)}
            >
              <option value="">None</option>
              {MAJOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-minor">Minor</label>
            <select
              id="profile-minor"
              className="auth-select"
              value={minor}
              onChange={(e) => setMinor(e.target.value)}
            >
              <option value="">None</option>
              {MINOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-concentration">Concentration</label>
            <select
              id="profile-concentration"
              className="auth-select"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
            >
              <option value="">None</option>
              {CONCENTRATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-courses-search">Courses Taken</label>
            <input
              id="profile-courses-search"
              type="text"
              placeholder="Search courses like MATH 111 or Calculus"
              value={courseQuery}
              onChange={(e) => setCourseQuery(e.target.value)}
            />

            {courseQuery.trim() && filteredCourses.length > 0 && (
              <div className="course-search-results">
                {filteredCourses.map((course) => {
                  const label = buildCourseLabel(course);
                  return (
                    <button
                      key={course.crn}
                      type="button"
                      className="course-search-result"
                      onClick={() => addCourse(course)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {courseQuery.trim() && filteredCourses.length === 0 && (
              <div className="course-search-empty">No matching courses found.</div>
            )}

            <div className="selected-courses">
              {coursesTaken.length === 0 ? (
                <p className="selected-courses-empty">No courses selected yet.</p>
              ) : (
                coursesTaken.map((course) => (
                  <div key={course} className="course-chip">
                    <span>{course}</span>
                    <button
                      type="button"
                      className="course-chip-remove"
                      onClick={() => removeCourse(course)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
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

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <p className="auth-switch">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </div>
    </div>
  );
}