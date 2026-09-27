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
import SideNavbar, { SideNavItem } from "./components/SideNavbar";
import { NAV_ITEMS } from "./shared/data";
import { BookOpen, FileText, Newspaper } from "lucide-react";
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
          .app-pagewrap {
            grid-template-columns: 1fr !important;
            padding-top: 0 !important;
          }
          .app-side-right { display: none !important; }
          /* Timer + section nav become one row that sticks just under the
             56px top navbar. The negative margins stretch its background to
             the screen edges so content scrolling underneath is hidden. */
          .app-side-left {
            position: sticky !important;
            top: 56px !important;
            z-index: 50;
            flex-direction: row !important;
            align-items: center;
            gap: 8px !important;
            background: ${theme.bg};
            margin: 0 -24px;
            padding: 8px 24px;
            border-bottom: 1px solid ${theme.textFaint}
          }
          .overview-sidenav {
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .overview-sidenav::-webkit-scrollbar { display: none; }
          .overview-sidenav-list { flex-direction: row !important; }
          .game-timer { width: 92px !important; }
          /* Nav jumps land below the top navbar plus the sticky row. */
          .app-pagewrap section[id],
          .app-pagewrap [data-scroll-target] {
            scroll-margin-top: 124px !important;
          }
        }
        @media (max-width: 480px) {
          .app-pagewrap { padding: 0 16px 16px !important; gap: 20px !important; }
          .app-side-left { margin: 0 -16px; padding: 8px 16px; }
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
  const { pathname } = useLocation();
  const { game } = useGame();
  const isOverview = pathname === "/";
  const isEvidence = pathname === "/evidence";
  const notAdmin = pathname !== "/admin";

  const victim = game.characters.find((c) => c.role === "victim");
  const evidenceNavItems: SideNavItem[] = [
    { id: "forhorsdokument", label: "Förhörsdokument", icon: FileText },
    { id: "nyhetsartiklar", label: "Nyhetsartiklar", icon: Newspaper },
    {
      id: "anteckningar",
      label: "Offrets anteckningar",
      icon: BookOpen,
    },
  ];

  return (
    <div className="app-pagewrap" style={sharedStyles.pageWrap}>
      <div className="app-side-left" style={sharedStyles.sideColumn}>
        {notAdmin && <GameStartButton />}
        {isOverview && <SideNavbar items={NAV_ITEMS} lockUntilStarted />}
        {isEvidence && <SideNavbar items={evidenceNavItems} />}
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
