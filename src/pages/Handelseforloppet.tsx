import React from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Clock, EyeOff } from 'lucide-react';
import { theme } from '../theme';
import { sharedStyles } from '../shared/styles';

export default function Handelseforloppet() {
  const { game } = useGame();
  const { isAdmin } = useAuth();

  const events = [...game.timelineEvents]
    .filter(e => isAdmin || e.revealed)
    .sort((a, b) => a.time.localeCompare(b.time));

  const charById = new Map(game.characters.map(c => [c.id, c]));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={sharedStyles.h1}>Händelseförloppet</h1>
      </div>

      {events.length === 0 ? (
        <div style={sharedStyles.empty}>Inga händelser att visa än.</div>
      ) : (
        <div style={styles.list}>
          {events.map((e, i) => (
            <div key={e.id} style={styles.row}>
              <div style={styles.left}>
                <div style={styles.time}><Clock size={11} /> {e.time || '—'}</div>
                {i < events.length - 1 && <div style={styles.line} />}
              </div>
              <div style={{ ...styles.card, opacity: e.revealed ? 1 : 0.6 }}>
                <p style={styles.desc}>{e.description || 'Ingen information tillagd.'}</p>
                <div style={styles.chips}>
                  {e.characterIds.map(id => (
                    <span key={id} style={sharedStyles.tag}>{charById.get(id)?.name ?? 'Okänd'}</span>
                  ))}
                  {!e.revealed && (
                    <span style={sharedStyles.hiddenTag}><EyeOff size={11} /> Dold för spelarna</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 720, margin: '0 auto', padding: '32px 24px' },
  header: { marginBottom: 28 },
  list: { display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  left: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80, flexShrink: 0 },
  time: { display: 'flex', alignItems: 'center', gap: 4, background: theme.accent, color: theme.primaryText, fontWeight: 700, fontSize: 12, padding: '4px 8px', borderRadius: 20, whiteSpace: 'nowrap' },
  line: { width: 2, flexGrow: 1, background: theme.divider, minHeight: 20, margin: '6px 0' },
  card: { flex: 1, background: theme.cardBg, borderRadius: 10, padding: '14px 18px', border: `1px solid ${theme.cardBorder}`, marginBottom: 16 },
  desc: { fontSize: 14, color: theme.text, lineHeight: 1.6, margin: '0 0 10px' },
  chips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
};
