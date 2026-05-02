import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ATSCheck from "./pages/ATSCheck";
import TailorResume from "./pages/TailorResume";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import InterviewResults from "./pages/InterviewResults";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden -z-50">
    {/* Multiple layered animated gradients */}
    <div className="absolute inset-0 gradient-animated opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary-glow/20 animate-pulse-slow" />
    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-primary/10 to-transparent animate-float" />

    {/* Dynamic floating shapes with stronger animations */}
    <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-primary-glow/30 rounded-full animate-float animate-pulse-slow shadow-glow" />
    <div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-r from-primary-glow/25 to-primary/35 rounded-2xl animate-bounce-slow shadow-medium rotate-12" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-tr from-primary/30 to-transparent rounded-full animate-rotate-slow shadow-glow" />
    <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-bl from-primary-glow/40 to-primary/20 rounded-lg animate-float shadow-medium -rotate-45" style={{ animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-r from-primary/25 to-primary-glow/35 rounded-full animate-pulse-slow shadow-soft" style={{ animationDelay: '3s' }} />
    <div className="absolute top-1/3 right-1/3 w-36 h-36 bg-gradient-to-tl from-primary-glow/15 to-primary/25 rounded-3xl animate-bounce-slow shadow-strong rotate-45" style={{ animationDelay: '0.5s' }} />
    <div className="absolute top-2/3 left-1/2 w-16 h-16 bg-gradient-to-br from-primary/40 to-transparent rounded-full animate-float shadow-glow" style={{ animationDelay: '4s' }} />
    <div className="absolute bottom-1/4 right-1/4 w-22 h-22 bg-gradient-to-t from-primary-glow/30 to-primary/20 rounded-xl animate-rotate-slow shadow-medium" style={{ animationDelay: '2.5s' }} />

    {/* Animated mesh pattern */}
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `
        radial-gradient(circle at 20% 50%, hsl(var(--primary)) 2px, transparent 2px),
        radial-gradient(circle at 80% 50%, hsl(var(--primary-glow)) 1px, transparent 1px),
        linear-gradient(90deg, transparent 24%, hsl(var(--primary)/0.1) 25%, hsl(var(--primary)/0.1) 26%, transparent 27%, transparent 74%, hsl(var(--primary)/0.1) 75%, hsl(var(--primary)/0.1) 76%, transparent 77%)
      `,
      backgroundSize: '50px 50px, 30px 30px, 60px 60px',
      animation: 'gradient-shift 15s ease-in-out infinite'
    }} />

    {/* Glowing particles */}
    <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-pulse-slow shadow-glow" style={{ animationDelay: '1s' }} />
    <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-primary-glow rounded-full animate-float shadow-soft" style={{ animationDelay: '3s' }} />
    <div className="absolute bottom-1/3 left-2/3 w-4 h-4 bg-primary rounded-full animate-bounce-slow shadow-glow" style={{ animationDelay: '2s' }} />
    <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-primary-glow rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }} />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AnimatedBackground />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route index element={<Landing />} />
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ats-check"
              element={
                <ProtectedRoute>
                  <ATSCheck />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tailor-resume"
              element={
                <ProtectedRoute>
                  <TailorResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/session/:sessionId"
              element={
                <ProtectedRoute>
                  <InterviewSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/results/:sessionId"
              element={
                <ProtectedRoute>
                  <InterviewResults />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
