import React from "react";
import { styles as sharedStyles } from "../shared/styles";

export default function Section({
  id,
  title,
  style,
  children,
}: {
  id?: string;
  title: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ ...sharedStyles.section, scrollMarginTop: 72, ...style }}
    >
      <h2 style={sharedStyles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {};
