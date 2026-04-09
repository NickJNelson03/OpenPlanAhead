import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AppNavbar from "../components/AppNavbar";

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

function sortNames(list) {
  return [...list].sort((a, b) => a.localeCompare(b));
}

export default function EditProfile({
  session,
  profile,
  handleLogout,
  refreshProfile,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [primaryMajor, setPrimaryMajor] = useState("");
  const [secondMajor, setSecondMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [concentration, setConcentration] = useState("");
  const [coursesTaken, setCoursesTaken] = useState([]);
  const [courseQuery, setCourseQuery] = useState("");

  const [allCourses, setAllCourses] = useState([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [majorOptions, setMajorOptions] = useState([]);
  const [minorOptions, setMinorOptions] = useState([]);
  const [concentrationOptions, setConcentrationOptions] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user;

        if (!currentUser) {
          navigate("/login");
          return;
        }

        if (!isMounted) return;
        setUser(currentUser);

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
          .eq("id", currentUser.id)
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

  useEffect(() => {
    async function loadPrograms() {
      const { data, error } = await supabase
        .from("programs")
        .select("name, types")
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to load programs:", error);
        return;
      }

      const programs = data || [];

      setMajorOptions(
        sortNames(
          programs
            .filter((program) => program.types?.includes("major"))
            .map((program) => program.name)
        )
      );

      setMinorOptions(
        sortNames(
          programs
            .filter((program) => program.types?.includes("minor"))
            .map((program) => program.name)
        )
      );

      setConcentrationOptions(
        sortNames(
          programs
            .filter((program) => program.types?.includes("concentration"))
            .map((program) => program.name)
        )
      );
    }

    loadPrograms();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCoursesIfNeeded() {
      if (!courseQuery.trim() || coursesLoaded || coursesLoading) return;

      try {
        setCoursesLoading(true);

        const { data, error } = await supabase
          .from("course_offerings")
          .select("*")
          .order("subject", { ascending: true })
          .order("course_number", { ascending: true });

        if (error) {
          console.error("Failed to load course data:", error);
          return;
        }

        if (!isMounted) return;
        setAllCourses(data || []);
        setCoursesLoaded(true);
      } catch (err) {
        console.error("Failed to load course data:", err);
      } finally {
        if (isMounted) {
          setCoursesLoading(false);
        }
      }
    }

    loadCoursesIfNeeded();

    return () => {
      isMounted = false;
    };
  }, [courseQuery, coursesLoaded, coursesLoading]);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.toLowerCase().trim();
    if (!q || !coursesLoaded) return [];

    return allCourses
      .filter((course) => {
        const label = buildCourseLabel(course).toLowerCase();
        const code = `${course.subject} ${String(course.course_number || "").replace(
          /\.00$/,
          ""
        )}`.toLowerCase();

        return label.includes(q) || code.includes(q);
      })
      .filter((course) => !coursesTaken.includes(buildCourseLabel(course)))
      .slice(0, 8);
  }, [courseQuery, allCourses, coursesLoaded, coursesTaken]);

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

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        setSaving(false);
        return;
      }

      await supabase.auth.updateUser({
        data: { name: name.trim() },
      });

      if (typeof refreshProfile === "function") {
        await refreshProfile();
      }

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
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div style={{ padding: "2rem" }}>Loading...</div>
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
                {majorOptions.map((option) => (
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
                {majorOptions.map((option) => (
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
                {minorOptions.map((option) => (
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
                {concentrationOptions.map((option) => (
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

              {courseQuery.trim() && coursesLoading && (
                <div className="course-search-empty">Loading courses...</div>
              )}

              {courseQuery.trim() && !coursesLoading && filteredCourses.length > 0 && (
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

              {courseQuery.trim() &&
                !coursesLoading &&
                coursesLoaded &&
                filteredCourses.length === 0 && (
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
    </div>
  );
}