import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { supabase } from "../lib/supabase";
import "../App.css";

const SEMESTER_OPTIONS = ["Fall", "Spring"];

export default function ManageCourses({ session, profile, handleLogout }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [semester, setSemester] = useState("Fall");
  const [year, setYear] = useState("");
  const [crn, setCrn] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [instructionMode, setInstructionMode] = useState("");
  const [days, setDays] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [additionalDays, setAdditionalDays] = useState("");
  const [additionalTime, setAdditionalTime] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
  const [instructor, setInstructor] = useState("");

  const [offerings, setOfferings] = useState([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  const [submittingOffering, setSubmittingOffering] = useState(false);
  const [deletingOfferingId, setDeletingOfferingId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [publishingCourseId, setPublishingCourseId] = useState(null);
  const [unpublishingCourseId, setUnpublishingCourseId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isCreator = profile?.role === "creator" || profile?.role === "root";

  async function loadCourses() {
    setLoading(true);

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("subject", { ascending: true })
      .order("course_code", { ascending: true });

    if (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } else {
      setCourses(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
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

  function resetOfferingForm() {
    setSemester("Fall");
    setYear("");
    setCrn("");
    setUnitValue("");
    setInstructionMode("");
    setDays("");
    setStartTime("");
    setEndTime("");
    setAdditionalDays("");
    setAdditionalTime("");
    setSeatsAvailable("");
    setInstructor("");
    setMessage("");
    setMessageType("");
  }

  function openAddOfferingModal(course) {
    setSelectedCourse(course);
    resetOfferingForm();
    setShowAddModal(true);
  }

  function closeAddOfferingModal() {
    setSelectedCourse(null);
    setShowAddModal(false);
    setSubmittingOffering(false);
    setMessage("");
    setMessageType("");
  }

  async function openStatusModal(course) {
    setSelectedCourse(course);
    setShowStatusModal(true);
    setOfferings([]);
    setOfferingsLoading(true);
    setMessage("");
    setMessageType("");

    const { data, error } = await supabase
      .from("course_offerings")
      .select("*")
      .eq("course_id", course.id)
      .order("term", { ascending: true });

    if (error) {
      console.error("Failed to load offerings:", error);
      setOfferings([]);
      setMessage("Failed to load course offering status.");
      setMessageType("error");
    } else {
      setOfferings(data || []);
    }

    setOfferingsLoading(false);
  }

  function closeStatusModal() {
    setSelectedCourse(null);
    setShowStatusModal(false);
    setOfferings([]);
    setOfferingsLoading(false);
    setMessage("");
    setMessageType("");
  }

  async function handleAddOffering(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedCourse) return;

    if (!semester || !year.trim() || !crn.trim()) {
      setMessage("Semester, year, and CRN are required.");
      setMessageType("error");
      return;
    }

    setSubmittingOffering(true);

    try {
      const trimmedCrn = crn.trim();
      const trimmedYear = year.trim();
      const builtTerm = `${semester} ${trimmedYear}`;

      const { data: existingOffering, error: existingError } = await supabase
        .from("course_offerings")
        .select("id")
        .eq("term", builtTerm)
        .eq("crn", trimmedCrn)
        .maybeSingle();

      if (existingError) {
        setMessage(existingError.message);
        setMessageType("error");
        setSubmittingOffering(false);
        return;
      }

      if (existingOffering) {
        setMessage("That CRN is already being used for this term.");
        setMessageType("error");
        setSubmittingOffering(false);
        return;
      }

      const offeringPayload = {
        course_id: selectedCourse.id,
        term: builtTerm,
        crn: trimmedCrn,
        subject: selectedCourse.subject,
        course_number: selectedCourse.course_code,
        title: selectedCourse.title,
        unit_value: unitValue.trim() || null,
        credits:
          selectedCourse.credit_hours !== null &&
          selectedCourse.credit_hours !== undefined
            ? String(selectedCourse.credit_hours)
            : null,
        instruction_mode: instructionMode.trim() || null,
        days: days.trim() || null,
        start_time: startTime || null,
        end_time: endTime || null,
        additional_days: additionalDays.trim() || null,
        additional_time: additionalTime.trim() || null,
        seats_available: seatsAvailable.trim() || null,
        instructor: instructor.trim() || null,
      };

      const { error } = await supabase
        .from("course_offerings")
        .insert(offeringPayload);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        setSubmittingOffering(false);
        return;
      }

      setMessage("Course offering created successfully.");
      setMessageType("success");
      setSubmittingOffering(false);

      setTimeout(() => {
        closeAddOfferingModal();
      }, 900);
    } catch (err) {
      console.error("Failed to add offering:", err);
      setMessage("Something went wrong while adding the offering.");
      setMessageType("error");
      setSubmittingOffering(false);
    }
  }

  async function handleDeleteOffering(offeringId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this course from that semester?"
    );
    if (!confirmed) return;

    setDeletingOfferingId(offeringId);
    setMessage("");
    setMessageType("");

    const { error } = await supabase
      .from("course_offerings")
      .delete()
      .eq("id", offeringId);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setDeletingOfferingId(null);
      return;
    }

    setOfferings((prev) => prev.filter((offering) => offering.id !== offeringId));
    setDeletingOfferingId(null);
    setMessage("Offering removed successfully.");
    setMessageType("success");
  }

  async function handleDeleteCourse(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This may also remove linked offerings."
    );
    if (!confirmed) return;

    setDeletingCourseId(courseId);

    const { error } = await supabase.from("courses").delete().eq("id", courseId);

    if (error) {
      alert(error.message);
      setDeletingCourseId(null);
      return;
    }

    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    setDeletingCourseId(null);

    if (selectedCourse?.id === courseId) {
      closeStatusModal();
      closeAddOfferingModal();
    }
  }

  async function handlePublishCourse(courseId) {
    setPublishingCourseId(courseId);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("courses")
      .update({
        is_published: true,
        published_at: now,
        published_by: session?.user?.id || null,
      })
      .eq("id", courseId);

    if (error) {
      alert(error.message);
      setPublishingCourseId(null);
      return;
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              is_published: true,
              published_at: now,
              published_by: session?.user?.id || null,
            }
          : course
      )
    );

    setPublishingCourseId(null);
  }

  async function handleUnpublishCourse(courseId) {
    setUnpublishingCourseId(courseId);

    const { error } = await supabase
      .from("courses")
      .update({
        is_published: false,
        published_at: null,
        published_by: null,
      })
      .eq("id", courseId);

    if (error) {
      alert(error.message);
      setUnpublishingCourseId(null);
      return;
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              is_published: false,
              published_at: null,
              published_by: null,
            }
          : course
      )
    );

    setUnpublishingCourseId(null);
  }

  if (loading) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div className="main-content">Loading courses...</div>
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
        <h1>Manage Courses</h1>
        <p className="subtitle">Search and manage the master course catalog</p>

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
                  {isCreator && <th>Status</th>}
                  {isCreator && <th>Actions</th>}
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
                    {isCreator && (
                      <td>
                        <span
                          className={
                            c.is_published
                              ? "manage-user-role-badge"
                              : "status-hint"
                          }
                        >
                          {c.is_published ? "Published" : "Unpublished"}
                        </span>
                      </td>
                    )}
                    {isCreator && (
                      <td>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {c.is_published ? (
                            <button
                              type="button"
                              className="navbar-logout"
                              onClick={() => handleUnpublishCourse(c.id)}
                              disabled={unpublishingCourseId === c.id}
                            >
                              {unpublishingCourseId === c.id
                                ? "Removing..."
                                : "Unpublish"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="taken-button"
                              onClick={() => handlePublishCourse(c.id)}
                              disabled={publishingCourseId === c.id}
                            >
                              {publishingCourseId === c.id
                                ? "Publishing..."
                                : "Publish"}
                            </button>
                          )}

                          <button
                            type="button"
                            className="taken-button"
                            onClick={() => openAddOfferingModal(c)}
                          >
                            Add to Offerings
                          </button>

                          <button
                            type="button"
                            className="taken-button"
                            onClick={() => openStatusModal(c)}
                          >
                            View Status
                          </button>

                          <button
                            type="button"
                            className="navbar-logout"
                            onClick={() => handleDeleteCourse(c.id)}
                            disabled={deletingCourseId === c.id}
                          >
                            {deletingCourseId === c.id ? "Deleting..." : "Delete Course"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {results.length === 0 && (
              <div className="empty-state">No courses match your search.</div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeAddOfferingModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-card-header">
              <h2>Add to Offerings</h2>
            </div>

            <p style={{ marginTop: 0, color: "#6b7280" }}>
              {selectedCourse.subject} {selectedCourse.course_code} - {selectedCourse.title}
            </p>

            <form onSubmit={handleAddOffering}>
              <div className="auth-field">
                <label htmlFor="offering-semester">Semester</label>
                <select
                  id="offering-semester"
                  className="auth-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  {SEMESTER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="offering-year">Year</label>
                <input
                  id="offering-year"
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-crn">CRN</label>
                <input
                  id="offering-crn"
                  type="text"
                  placeholder="80123"
                  value={crn}
                  onChange={(e) => setCrn(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-unit-value">Unit Value</label>
                <input
                  id="offering-unit-value"
                  type="text"
                  placeholder="0.5"
                  value={unitValue}
                  onChange={(e) => setUnitValue(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-instruction-mode">Instruction Mode</label>
                <input
                  id="offering-instruction-mode"
                  type="text"
                  placeholder="In Person"
                  value={instructionMode}
                  onChange={(e) => setInstructionMode(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-days">Days</label>
                <input
                  id="offering-days"
                  type="text"
                  placeholder="MWF"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-start-time">Start Time</label>
                <input
                  id="offering-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-end-time">End Time</label>
                <input
                  id="offering-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-additional-days">Additional Days</label>
                <input
                  id="offering-additional-days"
                  type="text"
                  placeholder="T"
                  value={additionalDays}
                  onChange={(e) => setAdditionalDays(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-additional-time">Additional Time</label>
                <input
                  id="offering-additional-time"
                  type="text"
                  placeholder="1310-1430"
                  value={additionalTime}
                  onChange={(e) => setAdditionalTime(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-seats">Seats Available</label>
                <input
                  id="offering-seats"
                  type="text"
                  placeholder="25"
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="offering-instructor">Instructor</label>
                <input
                  id="offering-instructor"
                  type="text"
                  placeholder="Professor Name"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
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

              <div className="modal-actions">
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={submittingOffering}
                >
                  {submittingOffering ? "Adding..." : "Add Offering"}
                </button>

                <button
                  type="button"
                  className="navbar-logout"
                  onClick={closeAddOfferingModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatusModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-card-header">
              <h2>View Status</h2>
            </div>

            <p style={{ marginTop: 0, color: "#6b7280" }}>
              {selectedCourse.subject} {selectedCourse.course_code} - {selectedCourse.title}
            </p>

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

            {offeringsLoading ? (
              <div>Loading offerings...</div>
            ) : offerings.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                This course is not currently offered in any semester.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>Term</th>
                      <th>CRN</th>
                      <th>Instructor</th>
                      <th>Days</th>
                      <th>Time</th>
                      <th>Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerings.map((offering) => (
                      <tr key={offering.id}>
                        <td>{offering.term || "—"}</td>
                        <td>{offering.crn || "—"}</td>
                        <td>{offering.instructor || "—"}</td>
                        <td>{offering.days || "—"}</td>
                        <td>
                          {offering.start_time && offering.end_time
                            ? `${offering.start_time} - ${offering.end_time}`
                            : "—"}
                        </td>
                        <td>{offering.seats_available || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="navbar-logout"
                            onClick={() => handleDeleteOffering(offering.id)}
                            disabled={deletingOfferingId === offering.id}
                          >
                            {deletingOfferingId === offering.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="navbar-logout"
                onClick={closeStatusModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}