import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BottomNav } from "@/components/BottomNav";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import MemoryDetail from "./pages/MemoryDetail";
import Search from "./pages/Search";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/" element={<ProtectedRoute user={user}><Home /></ProtectedRoute>} />
              <Route path="/timeline" element={<ProtectedRoute user={user}><Timeline /></ProtectedRoute>} />
              <Route path="/memory/:id" element={<ProtectedRoute user={user}><MemoryDetail /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute user={user}><Search /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute user={user}><Reminders /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute user={user}><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {user && <BottomNav />}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
