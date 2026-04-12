import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { useEffect } from "react";

export default function MyCourses({ session, profile, handleLogout }) {
  const takenCourses = profile?.courses_taken || [];

  useEffect(() => {
    if (window.tailwind) {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              background: "#f9f9fb",
              "surface-container-low": "#f2f4f6",
              "surface-container-highest": "#dde3e9",
              "surface-container-high": "#e4e9ee",
              "surface-container-lowest": "#ffffff",
              secondary: "#5148d8",
              "secondary-dim": "#453acc",
              "secondary-container": "#e3dfff",
              "on-secondary": "#fbf7ff",
              "on-secondary-container": "#4338ca",
              "on-surface": "#2d3338",
              "on-surface-variant": "#596065",
            },
          },
        },
      };
    }
  }, []);

  return (
    <div className="bg-[#f9f9fb] min-h-screen font-body text-[#2d3338]">
      {/* subtle background layer */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-[#f2f4f6] to-[#dde3e9]"></div>
      <AppNavbar
        session={session}
        profile={profile}
        handleLogout={handleLogout}
      />

      <main className="pt-16 pb-24 px-8 max-w-screen-2xl mx-auto">
        <div className="space-y-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#e3dfff] text-[#4338ca] px-3 py-1 rounded-sm text-xs font-semibold uppercase shadow-sm">
                Library
              </span>
              <span className="text-[#596065] text-sm">
                {takenCourses.length} Courses Completed
              </span>
            </div>

            <h1 className="text-5xl font-extrabold font-headline tracking-tighter">
              My Courses
            </h1>

            <p className="text-lg text-[#596065]">
              Courses you’ve marked as completed.
            </p>
          </div>

          <Link
            to="/courses"
            className="bg-[#5148d8] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 shadow-[0_10px_30px_rgba(81,72,216,0.2)] hover:bg-[#453acc] hover:scale-105 transition-all active:scale-95"
          >
            + Search More Courses
          </Link>
        </div>

        {/* Course Section */}
        {takenCourses.length === 0 ? (
          <div className="mt-32 p-12 bg-white rounded-lg text-center shadow-[0_12px_40px_rgba(45,51,56,0.06)]">
            <h3 className="text-2xl font-bold font-headline mb-4">
              No courses yet
            </h3>
            <p className="text-[#596065] mb-8">
              Start building your academic history by adding courses.
            </p>
            <Link
              to="/courses"
              className="bg-[#5148d8] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#453acc] transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-20">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold font-headline">
                  Your Courses
                </h2>
                <div className="h-[2px] flex-grow bg-surface-container-highest"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {takenCourses.map((course) => (
                  <div
                    key={course}
                    className="group bg-white rounded-md p-6 shadow-[0_12px_40px_rgba(45,51,56,0.08)] hover:shadow-[0_16px_50px_rgba(45,51,56,0.12)] hover:bg-surface-container-low transition-all duration-300 relative"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5148d8] to-[#453acc] rounded-t-md"></div>
                      <span className="bg-[#e3dfff] text-[#4338ca] px-2 py-1 rounded-sm text-xs font-medium shadow-sm border border-secondary/10">
                        {course.split(" ")[0]}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-headline mb-2 text-[#2d3338]">
                      {course}
                    </h3>

                    <p className="text-sm text-[#596065] mt-2">
                      Completed course in your academic plan.
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-xs text-[#596065]">
                        Prof: N/A
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom CTA Section */}
            <div className="mt-32 py-16 px-12 bg-[#f2f4f6] rounded-lg text-center border border-[#dde3e9]">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold font-headline mb-4">
                  Continuing your journey?
                </h3>

                <p className="text-[#596065] mb-8 max-w-md">
                  Discover new academic paths or plan your future semesters.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Link
                  to="/courses"
                  className="bg-[#5148d8] text-white px-8 py-3 rounded-full font-semibold shadow-[0_10px_30px_rgba(81,72,216,0.2)] hover:bg-[#453acc] transition-all active:scale-95"
                >
                  Explore Catalog
                </Link>

                <Link
                  to="/roadmap"
                  className="bg-white text-[#2d3338] px-8 py-3 rounded-full font-semibold border border-[#dde3e9] hover:bg-[#f9f9fb] transition-all"
                >
                  Degree Plan
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}