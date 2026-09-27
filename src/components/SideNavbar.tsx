import React, { useState } from "react";
import { LucideIcon } from "lucide-react";
import { styles as sharedStyles } from "../shared/styles";
import { scrollToSection } from "../shared/helpers";
import { useGameTimer } from "../context/GameTimerContext";
import { theme } from "../theme";

export interface SideNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Jump links to sections of the current page (scrolls to the element with
// the item's id). With lockUntilStarted, it's blurred and inert until the
// game clock has been started, like the Overview content itself.
export default function SideNavbar({
  items,
  lockUntilStarted = false,
}: {
  items: SideNavItem[];
  lockUntilStarted?: boolean;
}) {
  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const { started: gameStarted } = useGameTimer();
  const started = !lockUntilStarted || gameStarted;

  return (
    <nav className="overview-sidenav" style={sharedStyles.sideNav}>
      <div
        className="overview-sidenav-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          filter: started ? undefined : "blur(2px)",
          pointerEvents: started ? undefined : "none",
          userSelect: started ? undefined : "none",
          transition: "filter 0.4s",
        }}
        aria-hidden={!started}
      >
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`overview-sidenav-item ${id === activeNavId ? " active" : ""}`}
            style={sharedStyles.sideNavItem}
            onClick={() => {
              setActiveNavId(id);
              scrollToSection(id);
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {};
