import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Toast from "./components/Toast";


import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Clubs from "./pages/Clubs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminClubs from "./pages/AdminClubs";
import ClubDashboard from "./pages/ClubDashboard";
import ClubDetails from "./pages/ClubDetails";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50">
    <Loader2 className="animate-spin text-blue-600" size={48} />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      {/* NAVBAR ALWAYS VISIBLE */}
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      <Toast />


      {/* PAGES */}
      <main className="min-h-screen pt-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/clubs/:id" element={<ClubDetails />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["student", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clubs"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminClubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/club"
              element={
                <ProtectedRoute allowedRoles={["club"]}>
                  <ClubDashboard />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}