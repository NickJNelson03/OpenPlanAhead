import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";

export default function Home({ session, profile, handleLogout }) {
  const coursesTaken = profile?.courses_taken?.length || 0;
  const progressPercent = Math.min((coursesTaken / 32) * 100, 100); // adjust later

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#2d3338]">
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <main className="pt-24 pb-20 px-8 max-w-screen-2xl mx-auto space-y-12">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-lg p-12 bg-gradient-to-br from-indigo-700 to-indigo-900 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <h1 className="text-5xl font-extrabold text-white">
              OpenPlanAhead
            </h1>

            <p className="text-xl text-indigo-100">
              Plan your academic path with a cleaner view of your profile, courses, and future options.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/published-courses"
                className="bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-600 transition"
              >
                Search Courses
              </Link>

              <Link
                to="/my-courses"
                className="bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition"
              >
                View My Courses
              </Link>

              <Link
                to="/profile"
                className="bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* ACADEMIC SNAPSHOT */}
          <div className="md:col-span-8 bg-white rounded-lg p-8 shadow flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Academic Snapshot</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <Snapshot label="Name" value={profile?.name || "Not set"} />
              <Snapshot label="Year" value={profile?.academic_year || "Not set"} />
              <Snapshot label="Major" value={profile?.primary_major || "Not set"} />
              <Snapshot label="Second Major" value={profile?.second_major || "—"} />
              <Snapshot label="Minor" value={profile?.minor || "—"} />
              <Snapshot label="Concentration" value={profile?.concentration || "—"} />
            </div>
          </div>

          {/* PROGRESS */}
          <div className="md:col-span-4 bg-white rounded-lg p-8 shadow flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Progress</h2>

              <div className="flex justify-between">
                <span>Courses Taken</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {coursesTaken}
                </span>
              </div>

              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-sm text-gray-500">
                You’ve completed {Math.round(progressPercent)}% of your degree.
              </p>
            </div>

            <Link to="/degree-audit" className="text-indigo-600 font-semibold mt-6">
              Detailed Degree Audit →
            </Link>
          </div>

          {/* NEXT STEPS */}
          <div className="md:col-span-5 bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Next Steps</h2>

            <div className="space-y-4">
              <Step
                title="Complete profile"
                subtitle="Add your advisor"
                icon="person_add"
                to="/profile"
              />

              <Step
                title="Search classes"
                subtitle="Find Spring electives"
                icon="search"
                to="/published-courses"
              />

              <Step
                title="Check prerequisites"
                subtitle="Verify requirements"
                icon="fact_check"
                to="/degree-audit"
              />
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="md:col-span-7 bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Quick Insights</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Insight icon="calculate" text="You've completed 2 math courses this semester." />
              <Insight icon="pending_actions" text="You still need to plan next year." />
              <Insight icon="trending_up" text="Your GPA trend is rising." />
              <Insight icon="bookmark" text="Saved 4 internships." />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* SMALL COMPONENTS */

function Snapshot({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}

function Step({ title, subtitle, icon, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-md bg-gray-100 hover:bg-gray-200 transition"
    >
      {/* LEFT ICON */}
      <span className="material-symbols-outlined text-indigo-600">
        {icon}
      </span>

      {/* TEXT */}
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* RIGHT ARROW */}
      <span className="material-symbols-outlined text-gray-400">
        chevron_right
      </span>
    </Link>
  );
}

function Insight({ text, icon }) {
  return (
    <div className="p-6 rounded-lg bg-gray-100 space-y-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-indigo-600">
          {icon}
        </span>
      </div>

      <p className="text-gray-600">{text}</p>
    </div>
  );
}