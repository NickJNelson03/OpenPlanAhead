import { useEffect, useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { supabase } from "../lib/supabase";
import "../App.css";

const ROLE_OPTIONS = ["student", "creator", "root"];

export default function ManageUsers({ session, profile, handleLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function loadUsers() {
    setLoading(true);
    setMessage("");
    setMessageType("");

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        academic_year,
        primary_major,
        second_major,
        minor,
        concentration,
        role
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load users:", error);
      setMessage(error.message);
      setMessageType("error");
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, newRole) {
    setMessage("");
    setMessageType("");
    setSavingUserId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update role:", error);
      setMessage(error.message);
      setMessageType("error");
      setSavingUserId(null);
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    setMessage("User role updated successfully.");
    setMessageType("success");
    setSavingUserId(null);
  }

  function formatPrograms(user) {
    const items = [
      user.primary_major,
      user.second_major,
      user.minor ? `Minor: ${user.minor}` : null,
      user.concentration ? `Concentration: ${user.concentration}` : null,
    ].filter(Boolean);

    return items.length > 0 ? items.join(" · ") : "No academic program listed";
  }

  if (loading) {
    return (
      <div className="app">
        <AppNavbar
          session={session}
          profile={profile}
          handleLogout={handleLogout}
        />
        <div className="main-content">Loading users...</div>
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

      <div className="main-content manage-users-page">
        <div className="manage-users-hero">
          <div>
            <p className="manage-users-eyebrow">Root Controls</p>
            <h1>Manage Users</h1>
            <p className="manage-users-subtitle">
              Review user profiles and assign roles for students, creators, and
              root administrators.
            </p>
          </div>

          <button
            type="button"
            className="create-course-secondary"
            onClick={loadUsers}
          >
            Refresh
          </button>
        </div>

        {message && (
          <div
            className={
              messageType === "error"
                ? "auth-message auth-message-error"
                : "auth-message auth-message-success"
            }
            style={{ marginBottom: "18px" }}
          >
            {message}
          </div>
        )}

        <div className="manage-users-grid">
          {users.length === 0 ? (
            <div className="table-card">
              <div className="empty-state">No users found.</div>
            </div>
          ) : (
            users.map((user) => {
              const isCurrentUser = user.id === session?.user?.id;
              const isSaving = savingUserId === user.id;

              return (
                <div key={user.id} className="manage-user-card">
                  <div className="manage-user-card-top">
                    <div>
                      <h2>{user.name || "Unnamed User"}</h2>
                      <p className="manage-user-meta">
                        {user.academic_year || "Academic year not set"}
                      </p>
                    </div>

                    <span className="manage-user-role-badge">
                      {user.role || "student"}
                    </span>
                  </div>

                  <div className="manage-user-details">
                    <div className="manage-user-detail-row">
                      <span className="manage-user-detail-label">Programs</span>
                      <span className="manage-user-detail-value">
                        {formatPrograms(user)}
                      </span>
                    </div>

                    <div className="manage-user-detail-row">
                      <span className="manage-user-detail-label">User ID</span>
                      <span className="manage-user-detail-value manage-user-id">
                        {user.id}
                      </span>
                    </div>
                  </div>

                  <div className="manage-user-actions">
                    <label
                      htmlFor={`role-${user.id}`}
                      className="manage-user-select-label"
                    >
                      Role
                    </label>

                    <select
                      id={`role-${user.id}`}
                      className="auth-select"
                      value={user.role || "student"}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={isSaving}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    {isCurrentUser && (
                      <p className="manage-user-note">
                        This is your current account.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}