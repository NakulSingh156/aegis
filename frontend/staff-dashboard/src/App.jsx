import { useState }     from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage      from "./pages/LandingPage";
import AuthPage         from "./pages/AuthPage";
import VenueSetup       from "./pages/VenueSetup";
import Dashboard        from "./pages/Dashboard";

function AppRouter() {
  const { user, venue, loading } = useAuth();
  const [screen, setScreen]   = useState("landing");
  const [authMode, setAuthMode] = useState("register");

  if (loading) return null; // Wait for Firebase to init

  // Routing
  if (screen === "landing") {
    return (
      <LandingPage
        onGetStarted={(mode) => {
          setAuthMode(mode);
          setScreen("auth");
        }}
      />
    );
  }

  if (screen === "auth") {
    return (
      <AuthPage
        defaultMode={authMode}
        onSuccess={() => setScreen("venue-setup")}
      />
    );
  }

  if (screen === "venue-setup" || (user && !venue)) {
    return (
      <VenueSetup onComplete={() => setScreen("dashboard")} />
    );
  }

  if (screen === "dashboard" || (user && venue)) {
    return <Dashboard />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
