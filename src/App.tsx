import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { GameProvider, useGame } from "./context/GameContext";
import { GameTimerProvider, resetGameTimer } from "./context/GameTimerContext";
import { AuthProvider, Session, Role, useAuth } from "./context/AuthContext";
import { theme } from "./theme";
import Navbar from "./components/Navbar";
import InfoButton from "./components/InfoButton";
import GameStartButton from "./components/GameStartButton";
import GameInfoCard from "./components/GameInfoCard";
import SideNavbar from "./components/SideNavbar";
import { styles as sharedStyles } from "./shared/styles";
import Overview from "./pages/Overview";
import Characters from "./pages/Characters";
import CharacterInvestigate from "./pages/CharacterInvestigate";
import Compilation from "./pages/Compilation";
import Clues from "./pages/Clues";
import Scenes from "./pages/Scenes";
import Evidence from "./pages/Evidence";
import Handelseforloppet from "./pages/Handelseforloppet";
import Dokument from "./pages/Documents";
import SignIn from "./pages/SignIn";
import Admin from "./pages/Admin";

function loadSession(): Session | null {
  const team = localStorage.getItem("mystery-team");
  const role = localStorage.getItem("mystery-role") as Role | null;
  return team && role ? { team, role } : null;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);

  const handleSignIn = (team: string, role: Role) => {
    localStorage.setItem("mystery-team", team);
    localStorage.setItem("mystery-role", role);
    setSession({ team, role });
  };

  const handleSignOut = () => {
    localStorage.removeItem("mystery-team");
    localStorage.removeItem("mystery-role");
    resetGameTimer();
    setSession(null);
  };

  if (!session) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <AuthProvider session={session} signOut={handleSignOut}>
      <GameProvider>
        <GameTimerProvider>
          <AppShell />
        </GameTimerProvider>
      </GameProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { loading, error } = useGame();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          color: theme.text,
          fontFamily: theme.fontSerif,
        }}
      >
        Laddar spelet...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          background: theme.bg,
          color: theme.text,
          fontFamily: theme.fontSerif,
        }}
      >
        {error && (
          <div
            style={{
              background: theme.primary,
              color: theme.primaryText,
              padding: "8px 16px",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Kunde inte nå servern: {error}
          </div>
        )}
        <Navbar />
        <AppLayout />
        <InfoButton />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .app-pagewrap { grid-template-columns: 1fr !important; }
          .app-side-right { display: none !important; }
          .app-side-left {
            position: static !important;
            align-items: flex-start;
          }
        }
        @media (max-width: 480px) {
          .app-pagewrap { padding: 16px !important; gap: 20px !important; }
        }
      `}</style>
    </BrowserRouter>
  );
}

// Gate for /admin: only admins may render its children, everyone else is
// sent back to the front page.
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

// Three-column app shell: the game timer (plus the section nav, on Overview
// only) on the left, page content in the middle, and a same-width spacer on
// the right so the middle column stays optically centred.
function AppLayout() {
  const isOverview = useLocation().pathname === "/";

  return (
    <div className="app-pagewrap" style={sharedStyles.pageWrap}>
      <div className="app-side-left" style={sharedStyles.sideColumn}>
        <GameStartButton />
        {isOverview && <SideNavbar />}
      </div>

      <div style={sharedStyles.page}>
        <GameInfoCard />
        <Routes>
          <Route path="/" element={<Overview />} />
          {/* <Route path="/characters" element={<Characters />} /> */}
          <Route path="/characters/:id" element={<CharacterInvestigate />} />
          <Route
            path="/characters/:id/compilation"
            element={<Compilation />}
          />
          {/* <Route path="/clues" element={<Clues />} /> */}
          {/* <Route path="/scenes" element={<Scenes />} /> */}
          <Route path="/evidence" element={<Evidence />} />
          {/* <Route path="/handelseforloppet" element={<Handelseforloppet />} /> */}
          {/* <Route path="/dokument" element={<Dokument />} /> */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Routes>
      </div>

      <div className="app-side-right" aria-hidden />
    </div>
  );
}
