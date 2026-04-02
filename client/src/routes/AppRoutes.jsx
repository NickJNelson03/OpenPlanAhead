import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import CourseDirectory from "../pages/CourseDirectory";
import MyCourses from "../pages/MyCourses";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import EditProfile from "../pages/EditProfile";

export default function AppRoutes({
  session,
  handleLogout,
  profile,
  refreshProfile,
}) {
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
        path="/courses"
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
            <EditProfile />
          ) : (
            <Navigate to="/login" replace />
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