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
import { PlayerSectionsProvider } from "./context/PlayerSectionsContext";
import { AuthProvider, Session, Role, useAuth } from "./context/AuthContext";
import { theme } from "./theme";
import Navbar from "./components/Navbar";
import InfoButton from "./components/InfoButton";
import GameStartButton from "./components/GameStartButton";
import GameInfoCard from "./components/GameInfoCard";
import SideNavbar from "./components/SideNavbar";
import { styles as sharedStyles } from "./shared/styles";
import Overview from "./pages/Overview";
import CharacterInvestigate from "./pages/CharacterInvestigate";
import Compilation from "./pages/Compilation";
import Evidence from "./pages/Evidence";
import SignIn from "./pages/SignIn";
import Admin from "./pages/Admin";
import { api } from "./api/client";

function loadSession(): Session | null {
  const team = localStorage.getItem("mystery-team");
  const role = localStorage.getItem("mystery-role") as Role | null;
  const playerId = localStorage.getItem("mystery-player-id") ?? undefined;
  return team && role ? { team, role, playerId } : null;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);

  const handleSignIn = async (team: string, role: Role) => {
    localStorage.setItem("mystery-team", team);
    localStorage.setItem("mystery-role", role);
    let playerId: string | undefined;
    try {
      const player = await api.signInPlayer(team, role);
      playerId = player.id;
      localStorage.setItem("mystery-player-id", playerId);
    } catch (err) {
      console.error("Could not register player:", err);
    }
    setSession({ team, role, playerId });
  };

  const handleSignOut = () => {
    localStorage.removeItem("mystery-team");
    localStorage.removeItem("mystery-role");
    localStorage.removeItem("mystery-player-id");
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
          <PlayerSectionsProvider>
            <AppShell />
          </PlayerSectionsProvider>
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

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

function AppLayout() {
  const isOverview = useLocation().pathname === "/";
  const notAdmin = useLocation().pathname !== "/admin";

  return (
    <div className="app-pagewrap" style={sharedStyles.pageWrap}>
      <div className="app-side-left" style={sharedStyles.sideColumn}>
        {notAdmin && <GameStartButton />}
        {isOverview && <SideNavbar />}
      </div>

      <div style={sharedStyles.page}>
        {notAdmin && <GameInfoCard />}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/characters/:id" element={<CharacterInvestigate />} />
          <Route path="/characters/:id/compilation" element={<Compilation />} />
          <Route path="/evidence" element={<Evidence />} />
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
