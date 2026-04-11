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
            courses_taken,
            role
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
        role: profile?.role || "student",
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
    <div className="min-h-screen bg-[#f9f9fb] text-[#2d3338]">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <main className="pt-28 pb-20 px-8 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-[0.8fr_1.6fr] gap-0 items-stretch min-h-[calc(100vh-120px)]">

        {/* TOP HEADER BLOCK */}
        <section className="p-12 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white shadow-2xl h-full flex flex-col justify-between space-y-6 relative overflow-hidden rounded-2xl border border-white/10 m-4 md:m-0">
          <div className="mt-6">
            <Link to="/" className="text-sm opacity-80 hover:opacity-100">
              ← Back to course directory
            </Link>
            <h1 className="text-4xl font-extrabold mt-8">Edit Profile</h1>
            <p className="text-indigo-100 mt-4">
              Update your academic details and personalize your experience.
            </p>
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 lg:p-16 space-y-10 w-full h-full shadow-sm m-4 md:m-0">

          <h2 className="text-2xl font-bold -mt-4">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* NAME + YEAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="None"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Academic Year</label>
                <select
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                >
                  <option value="">Select your year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MAJORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Primary Major</label>
                <select
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={primaryMajor}
                  onChange={(e) => setPrimaryMajor(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {majorOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Second Major</label>
                <select
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={secondMajor}
                  onChange={(e) => setSecondMajor(e.target.value)}
                >
                  <option value="">None</option>
                  {majorOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MINOR + CONCENTRATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Minor</label>
                <select
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                >
                  <option value="">None</option>
                  {minorOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Concentration</label>
                <select
                  className="w-full px-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                >
                  <option value="">None</option>
                  {concentrationOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COURSES */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1">Courses Taken</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="None"
                  className="w-full pl-12 pr-6 py-4 rounded-full bg-gray-100 border border-gray-200 text-on-surface focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                />
              </div>

              {courseQuery && filteredCourses.length > 0 && (
                <div className="border border-gray-200 rounded-xl mt-4 max-h-40 overflow-y-auto bg-white">
                  {filteredCourses.map((course) => {
                    const label = buildCourseLabel(course);
                    return (
                      <div
                        key={course.crn}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => addCourse(course)}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {coursesTaken.map((course) => (
                  <div
                    key={course}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  >
                    {course}
                    <button onClick={() => removeCourse(course)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* MESSAGE */}
            {message && (
              <div className={`p-3 rounded ${
                messageType === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              }`}>
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}