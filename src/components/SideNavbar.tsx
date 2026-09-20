import React, { useState } from "react";
import { NAV_ITEMS } from "../shared/data";
import { styles as sharedStyles } from "../shared/styles";
import { scrollToSection } from "../shared/helpers";
import { useGameTimer } from "../context/GameTimerContext";

export default function SideNavbar() {
  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const { started } = useGameTimer();

  return (
    <nav className="overview-sidenav" style={sharedStyles.sideNav}>
      <div
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
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`overview-sidenav-item${id === activeNavId ? " active" : ""}`}
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
