import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  Search,
  BookOpen,
  Gamepad,
  LogOut,
  User,
  Menu,
  X,
  Microscope,
  ScrollText,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";

const links = [
  { to: "/", label: "Utredningen", icon: Gamepad },
  // { to: "/characters", label: "Karaktärer", icon: Users },
  // { to: "/clues", label: "Spår", icon: Search },
  // { to: "/scenes", label: "Scener", icon: BookOpen },
  { to: "/evidence", label: "Bevis", icon: Microscope },
  // { to: "/handelseforloppet", label: "Händelseförloppet", icon: ScrollText },
  // { to: "/dokument", label: "Dokument", icon: FileText },
];

export default function Navbar() {
  const { team, isAdmin, signOut } = useAuth();
  const { game } = useGame();
  const detective = game.characters.find((c) => c.role === "detective");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoText}>Mordmysterium</span>
        {isAdmin && <span style={styles.adminBadge}>Admin</span>}
      </div>

      <button
        className="navbar-hamburger"
        style={styles.hamburgerBtn}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`navbar-menu${menuOpen ? " open" : ""}`}>
        <div className="navbar-links" style={styles.links}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.active : {}),
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right" style={styles.right}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {detective && (
              <div style={styles.detectiveAvatar} title={detective.name}>
                {detective.imageUrl ? (
                  <img
                    src={detective.imageUrl}
                    alt={detective.name}
                    style={sharedStyles.imgCover}
                  />
                ) : (
                  <User size={16} color={theme.textFaint} />
                )}
              </div>
            )}
            <span style={styles.teamName}>{team}</span>
          </div>
          <button style={styles.signOut} onClick={signOut}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>

      <style>{`
        .nav-link { border-bottom: 1px solid transparent; }
        .nav-link:hover { border-bottom-color: ${theme.primary}66; }
        .navbar-hamburger { display: none; }
        .navbar-menu { display: contents; }

        @media (max-width: 768px) {
          .navbar-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
          }
          .navbar-menu {
            display: none;
          }
          .navbar-menu.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            width: 100%;
            box-sizing: border-box;
            border-radius: 0px 0px 0px 0px;
            background: ${theme.cardBg};
            border-bottom: 1px solid ${theme.cardBorder};
            padding: 16px 24px;
            gap: 16px;
            z-index: 200;
          }
          .navbar-menu.open .navbar-links {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .navbar-menu.open .navbar-right {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-left: 0;
            padding: 12px 24px;
            border-radius: 12px 12px 12px 12px;
            border-top: 1px solid ${theme.cardBorder};
            background: ${theme.cardBorder};
            border-radius: 0 0 12px 12px;
          }
        }
      `}</style>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 32,
    padding: "0 24px",
    height: 56,
    background: theme.cardBg,
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: `1px solid ${theme.textFaint}`,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: theme.accent,
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.5,
    flexShrink: 0,
    fontFamily: theme.fontSerif,
  },
  logoText: {
    fontFamily: theme.fontAccent,
    fontSize: 22,
    color: theme.primary,
    letterSpacing: 0.5,
  },
  hamburgerBtn: {
    background: "none",
    border: "none",
    color: theme.text,
    cursor: "pointer",
    padding: 4,
  },
  links: {
    display: "flex",
    gap: 8,
    flex: 1,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 6px",
    color: theme.text,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  active: {
    color: theme.textFaint,
    borderBottom: `1px solid ${theme.primary}`,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: theme.cardBg,
    background: theme.accent,
    padding: "2px 7px",
    borderRadius: 20,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  right: {
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    gap: 24,
    marginLeft: "auto",
    flexShrink: 0,
  },
  teamName: {
    fontSize: 16,
    color: theme.text,
    fontWeight: 500,
  },
  detectiveAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: theme.inputBg,
    border: `2px solid ${theme.roleColors.detective}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  signOut: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: theme.primary,
    border: `1px solid ${theme.primary}`,
    borderRadius: 20,
    color: theme.primaryText,
    fontSize: 13,
    padding: "6px 16px",
    cursor: "pointer",
  },
};
