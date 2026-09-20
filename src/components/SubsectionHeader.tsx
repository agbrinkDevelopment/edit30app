import React from "react";
import { Check } from "lucide-react";
import { styles as sharedStyles } from "../shared/styles";
import { theme } from "../theme";

export default function SubsectionHeader({
  title,
  checked,
  onToggle,
}: {
  title: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={sharedStyles.subsectionHeaderRow}>
      <h4 style={sharedStyles.investigationSubtitle}>{title}</h4>
      <button
        style={sharedStyles.subCheckBtn}
        onClick={onToggle}
        title={checked ? "Markera som oläst" : "Markera som klar"}
      >
        <span
          style={{
            ...sharedStyles.subCheckCircle,
            ...(checked ? sharedStyles.subCheckCircleDone : {}),
          }}
        >
          {checked && <Check size={9} color={theme.primaryText} />}
        </span>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
