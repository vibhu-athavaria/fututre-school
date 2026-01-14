import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { SignUp } from './pages/SignUp';
import { ParentLogin } from './pages/ParentLogin';
import { StudentLogin } from './pages/StudentLogin';
import { AddChild } from './pages/AddChild';
import { Dashboard } from './pages/Dashboard';
import { ChildDashboard } from './pages/ChildDashboard';
import { AITutor } from './pages/AITutor';
import { Lesson } from './pages/Lesson';
import { StudyPlan } from './pages/StudyPlan';
import { StudentProgress } from './pages/StudentProgress';
import AssessmentPage from './pages/AssessmentPage';
import { EditChild } from './pages/EditChild';
import MicroCoursePage from './pages/MicroCoursePage';
import AssessmentDiagnosticSummary from './pages/AssessmentDiagnosticSummary';
import { ParentSettings } from './pages/ParentSettings';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // ✅ Decide where to redirect based on role
  const getDefaultDashboard = () => {
    if (!user || !user.role) return '/';
    return user.role === 'parent' ? '/dashboard' : '/child-dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Header variant={user ? 'dashboard' : 'landing'} />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={getDefaultDashboard()} /> : <Home />} />
          <Route path="/signup" element={user ? <Navigate to={getDefaultDashboard()} /> : <SignUp />} />
          <Route path="/parent-login" element={!user ? <ParentLogin /> : <Navigate to={getDefaultDashboard()} />} />
          <Route path="/student-login" element={!user ? <StudentLogin /> : <Navigate to={getDefaultDashboard()} />} />

          {/* Parent-only Routes */}
          <Route
            path="/add-child"
            element={
              <ProtectedRoute>
                {user?.role === 'parent' ? <AddChild /> : <Navigate to="/child-dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-child/:id"
            element={
              <ProtectedRoute>
                {user?.role === 'parent' ? <EditChild /> : <Navigate to="/child-dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'parent' ? <Dashboard /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-settings"
            element={
              <ProtectedRoute>
                {user?.role === 'parent' ? <ParentSettings /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute>
                {user?.role === 'parent' ? <AddChild /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />

          {/* Student-only Routes */}
          <Route
            path="/child-dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <ChildDashboard /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-dashboard/assessment"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <AssessmentPage /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-dashboard/assessment-diagnostic-report"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <AssessmentDiagnosticSummary /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tutor"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <AITutor /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <Lesson /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-plan"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <StudyPlan /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-dashboard/take-micro-course"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <MicroCoursePage
                title="Understanding Area and Perimeter"
            subtopic="Geometry Basics"
            videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
            textContent={`Area and perimeter are two fundamental concepts in geometry that help us measure shapes.

**Perimeter** is the distance around the outside of a shape. To find the perimeter, you add up the lengths of all the sides.

For example, if you have a rectangle with length 5 cm and width 3 cm:
Perimeter = 5 + 3 + 5 + 3 = 16 cm

**Area** is the amount of space inside a shape. For rectangles, you multiply the length by the width.

Using the same rectangle:
Area = 5 × 3 = 15 cm²

Remember: Perimeter is measured in units (cm, m, etc.) while area is measured in square units (cm², m², etc.).`}
            learningObjectives={[
              "Understand the difference between area and perimeter",
              "Calculate the perimeter of rectangles and squares",
              "Calculate the area of rectangles and squares",
              "Apply formulas to solve real-world problems",
            ]}
            outcomes={[
              "Confidently measure the perimeter of any rectangular shape",
              "Calculate area using the correct formula",
              "Recognize when to use area vs perimeter in real situations",
            ]}
            guidedProblems={[
              "A rectangular garden is 8 meters long and 5 meters wide. What is its perimeter?",
              "If the same garden needs to be covered with grass, what is the area that needs grass?",
              "A square room has sides of 4 meters. Find both the perimeter and area.",
              "A rectangular field is 12 feet long and 7 feet wide. Calculate the perimeter.",
              "What is the area of a rectangle with length 9 cm and width 6 cm?",
            ]}
            quiz={[
              {
                question:
                  "What is the perimeter of a rectangle with length 6 cm and width 4 cm?",
                options: ["10 cm", "20 cm", "24 cm", "40 cm"],
                answer: "20 cm",
              },
              {
                question:
                  "What is the area of a square with sides of 5 meters?",
                options: ["20 m²", "25 m²", "10 m²", "50 m²"],
                answer: "25 m²",
              },
              {
                question:
                  "If you want to put a fence around a garden, are you measuring area or perimeter?",
                options: [
                  "Area",
                  "Perimeter",
                  "Both",
                  "Neither",
                ],
                answer: "Perimeter",
              },
              {
                question:
                  "What is the area of a rectangle with length 8 cm and width 3 cm?",
                options: [
                  "11 cm²",
                  "22 cm²",
                  "24 cm²",
                  "64 cm²",
                ],
                answer: "24 cm²",
              },
            ]}
            /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? <StudentProgress /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            }
          />

          {/* Static Pages */}
          <Route
            path="/about"
            element={
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">About Us</h1>
                  <p className="text-gray-600">Coming soon!</p>
                </div>
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact</h1>
                  <p className="text-gray-600">Coming soon!</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
