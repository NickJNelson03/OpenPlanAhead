import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import CourseDirectory from "../pages/CourseDirectory";
import MyCourses from "../pages/MyCourses";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import EditProfile from "../pages/EditProfile";
import CreateCourse from "../pages/CreateCourse";
import ManageUsers from "../pages/ManageUsers";
import ManageCourses from "../pages/ManageCourses";
import PublishedCourses from "../pages/PublishedCourses";

export default function AppRoutes({
  session,
  handleLogout,
  profile,
  refreshProfile,
}) {
  const isCreator = profile?.role === "creator" || profile?.role === "root";
  const isRoot = profile?.role === "root";

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? (
            <Home
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/course-offerings"
        element={
          session ? (
            <CourseDirectory
              session={session}
              profile={profile}
              handleLogout={handleLogout}
              refreshProfile={refreshProfile}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/published-courses"
        element={
          session ? (
            <PublishedCourses
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/manage-courses"
        element={
          session && isCreator ? (
            <ManageCourses
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/my-courses"
        element={
          session ? (
            <MyCourses
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          session ? (
            <EditProfile
              session={session}
              profile={profile}
              handleLogout={handleLogout}
              refreshProfile={refreshProfile}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/create-course"
        element={
          session && isCreator ? (
            <CreateCourse
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/manage-users"
        element={
          session && isRoot ? (
            <ManageUsers
              session={session}
              profile={profile}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <Signup />}
      />

      <Route
        path="/forgot-password"
        element={session ? <Navigate to="/" replace /> : <ForgotPassword />}
      />

      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}