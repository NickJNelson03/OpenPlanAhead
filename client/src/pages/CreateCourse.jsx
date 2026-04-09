import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { supabase } from "../lib/supabase";
import "../App.css";

const OFFER_PERIOD_OPTIONS = [
  "Every Semester",
  "Every Year",
  "Every Fall",
  "Every Spring",
  "Once Every Two Years",
  "Other",
];

const CLASS_RESTRICTION_OPTIONS = [
  "First Year",
  "Sophomore",
  "Junior",
  "Senior",
];

export default function CreateCourse({ session, profile, handleLogout }) {
  const [subject, setSubject] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [offerPeriod, setOfferPeriod] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [restrictions, setRestrictions] = useState([]);
  const [prerequisites, setPrerequisites] = useState("");
  const [corequisites, setCorequisites] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleRestriction(value) {
    setRestrictions((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function resetForm() {
    setSubject("");
    setCourseCode("");
    setTitle("");
    setOfferPeriod("");
    setCreditHours("");
    setRestrictions([]);
    setPrerequisites("");
    setCorequisites("");
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setSaving(true);

    try {
      if (!subject.trim() || !courseCode.trim() || !title.trim()) {
        setMessage("Subject, course ID, and title are required.");
        setMessageType("error");
        setSaving(false);
        return;
      }

      const formattedSubject = subject.trim().toUpperCase();
      const formattedCode = courseCode.trim();

      // ✅ CHECK IF COURSE ALREADY EXISTS
      const { data: existingCourse, error: checkError } = await supabase
        .from("courses")
        .select("id")
        .eq("subject", formattedSubject)
        .eq("course_code", formattedCode)
        .maybeSingle();

      if (checkError) {
        setMessage(checkError.message);
        setMessageType("error");
        setSaving(false);
        return;
      }

      if (existingCourse) {
        setMessage(
          `Course ${formattedSubject} ${formattedCode} already exists.`
        );
        setMessageType("error");
        setSaving(false);
        return;
      }

      const createdBy = session?.user?.id || null;

      const coursePayload = {
        subject: formattedSubject,
        course_code: formattedCode,
        title: title.trim(),
        offer_period: offerPeriod || null,
        credit_hours: creditHours ? Number(creditHours) : null,
        restrictions,
        prerequisites: prerequisites.trim() || null,
        corequisites: corequisites.trim() || null,
        created_by: createdBy,
      };

      const { error } = await supabase.from("courses").insert(coursePayload);

      // ✅ HANDLE DB UNIQUE CONSTRAINT ERROR (OPTIONAL BUT IMPORTANT)
      if (error) {
        if (error.message.includes("unique_course_subject_code")) {
          setMessage(
            `Course ${formattedSubject} ${formattedCode} already exists.`
          );
        } else {
          setMessage(error.message);
        }
        setMessageType("error");
        setSaving(false);
        return;
      }

      setMessage("Course created successfully.");
      setMessageType("success");
      resetForm();
    } catch (err) {
      console.error("Create course error:", err);
      setMessage("Something went wrong while creating the course.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

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
            <h1>Create a Course</h1>
            <p>
              Add a new course to the catalog with its core academic details.
            </p>

            <div className="create-course-hero-pills">
              <span className="create-course-pill">Catalog Entry</span>
              <span className="create-course-pill">Creator Tools</span>
            </div>
          </div>

          <form className="create-course-card" onSubmit={handleSubmit}>
            <div className="create-course-section">
              <div className="create-course-section-header">
                <h2>Catalog Information</h2>
                <p>Define the course itself.</p>
              </div>

              <div className="create-course-grid">
                <div className="auth-field">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="MATH"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>Course ID / Number</label>
                  <input
                    type="text"
                    placeholder="224"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Linear Algebra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="create-course-grid">
                <div className="auth-field">
                  <label>Offer Period</label>
                  <select
                    className="auth-select"
                    value={offerPeriod}
                    onChange={(e) => setOfferPeriod(e.target.value)}
                    required
                  >
                    <option value="">Select offer period</option>
                    {OFFER_PERIOD_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field">
                  <label>Credit Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="4"
                    value={creditHours}
                    onChange={(e) => setCreditHours(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Restrictions(This course will not open to the classes that you select)</label>
                <div className="restriction-chip-group">
                  {CLASS_RESTRICTION_OPTIONS.map((option) => {
                    const active = restrictions.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={
                          active
                            ? "restriction-chip restriction-chip-active"
                            : "restriction-chip"
                        }
                        onClick={() => toggleRestriction(option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="create-course-grid">
                <div className="auth-field">
                  <label>Prerequisites</label>
                  <input
                    type="text"
                    placeholder="MATH 111"
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label>Corequisites</label>
                  <input
                    type="text"
                    placeholder="PHYS 131"
                    value={corequisites}
                    onChange={(e) => setCorequisites(e.target.value)}
                  />
                </div>
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

            <div className="create-course-actions">
              <button type="submit" className="auth-submit" disabled={saving}>
                {saving ? "Creating..." : "Create Course"}
              </button>

              <button
                type="button"
                className="create-course-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}