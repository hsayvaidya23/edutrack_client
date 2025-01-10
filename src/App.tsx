import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Classes from "./pages/Classes";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import Analytics from "./pages/Analytics";
import Signup from "./pages/Register";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { AuthProvider } from "./components/AuthProvider";
import FinancialAnalytics from "./components/shared/FinancialAnalytics";
import ClassAnalytics from "./components/shared/ClassAnalytics";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />


            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <Classes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/class-analytics/:classId"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <ClassAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-analytics"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
                  <FinancialAnalytics />
                </ProtectedRoute>
              }
            />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
