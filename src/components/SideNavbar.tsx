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

// On mobile the nav is one horizontally scrolling row (see App.tsx); bring
// the tapped button to its left edge. Sets the row's own scroll position
// rather than using scrollIntoView, which would also scroll the page and
// fight the smooth scroll to the section. A no-op on desktop, where the
// column doesn't scroll sideways.
function alignLeftInNav(button: HTMLElement) {
  const nav = button.closest<HTMLElement>(".overview-sidenav");
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;
  // Keep the row's left border and padding showing before the button.
  const inset = nav.clientLeft + parseFloat(getComputedStyle(nav).paddingLeft);
  const offset =
    button.getBoundingClientRect().left -
    nav.getBoundingClientRect().left -
    inset;
  nav.scrollTo({ left: nav.scrollLeft + offset, behavior: "smooth" });
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
            onClick={(e) => {
              setActiveNavId(id);
              scrollToSection(id);
              alignLeftInNav(e.currentTarget);
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
