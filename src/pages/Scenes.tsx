import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Scene } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { theme } from '../theme';
import { sharedStyles } from '../shared/styles';

const emptyScene = (): Omit<Scene, 'id' | 'order'> => ({
  title: '', description: '', characterIds: [], clueIds: [],
});

export default function Scenes() {
  const { game, addScene, updateScene, removeScene } = useGame();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<Scene | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyScene());

  const sorted = [...game.scenes].sort((a, b) => a.order - b.order);

  const startCreate = () => { setDraft(emptyScene()); setCreating(true); setEditing(null); };
  const startEdit = (s: Scene) => { setEditing(s); setDraft(s); setCreating(false); };
  const cancel = () => { setEditing(null); setCreating(false); };

  const save = () => {
    if (!draft.title.trim()) return;
    if (creating) addScene(draft);
    else if (editing) updateScene({ ...draft, id: editing.id, order: editing.order });
    cancel();
  };

  const setField = (field: keyof Omit<Scene, 'id' | 'order'>, value: any) =>
    setDraft(d => ({ ...d, [field]: value }));

  const toggleId = (field: 'characterIds' | 'clueIds', id: string) => {
    const arr = draft[field];
    setField(field, arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  const showForm = isAdmin && (editing || creating);

  return (
    <div style={sharedStyles.pageNarrow}>
      <div style={sharedStyles.header}>
        <h1 style={sharedStyles.h1}>Scenes</h1>
        {isAdmin && <button style={sharedStyles.btn} onClick={startCreate}><Plus size={16} /> Add Scene</button>}
      </div>

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>{creating ? 'New Scene' : `Edit: ${editing!.title}`}</h2>
          <div style={{ ...sharedStyles.formGrid, marginBottom: 20 }}>
            <Field label="Scene Title" full>
              <input style={sharedStyles.input} value={draft.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. The Dinner Party, Scene 1" />
            </Field>
            <Field label="Description" full>
              <textarea style={sharedStyles.textarea} value={draft.description} onChange={e => setField('description', e.target.value)} placeholder="What happens in this scene? Set the atmosphere, describe the events..." rows={4} />
            </Field>
            {game.characters.length > 0 && (
              <Field label="Characters Present" full>
                <div style={sharedStyles.checkboxGroup}>
                  {game.characters.map(c => (
                    <label key={c.id} style={sharedStyles.checkLabel}>
                      <input type="checkbox" checked={draft.characterIds.includes(c.id)} onChange={() => toggleId('characterIds', c.id)} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </Field>
            )}
            {game.clues.length > 0 && (
              <Field label="Clues Introduced" full>
                <div style={sharedStyles.checkboxGroup}>
                  {game.clues.map(cl => (
                    <label key={cl.id} style={sharedStyles.checkLabel}>
                      <input type="checkbox" checked={draft.clueIds.includes(cl.id)} onChange={() => toggleId('clueIds', cl.id)} />
                      {cl.title}
                    </label>
                  ))}
                </div>
              </Field>
            )}
          </div>
          <div style={sharedStyles.formActions}>
            <button style={sharedStyles.btnSecondary} onClick={cancel}><X size={15} /> Cancel</button>
            <button style={sharedStyles.btn} onClick={save}><Check size={15} /> Save</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm ? (
        <div style={sharedStyles.empty}>No scenes yet. Build your mystery's story arc here.</div>
      ) : (
        <div style={styles.timeline}>
          {sorted.map((scene, idx) => {
            const chars = game.characters.filter(c => scene.characterIds.includes(c.id));
            const clues = game.clues.filter(cl => scene.clueIds.includes(cl.id));
            return (
              <div key={scene.id} style={styles.timelineRow}>
                <div style={styles.timelineLeft}>
                  <div style={styles.number}>{idx + 1}</div>
                  {idx < sorted.length - 1 && <div style={styles.line} />}
                </div>
                <div style={{ ...sharedStyles.card, flex: 1, marginBottom: 16 }}>
                  <div style={sharedStyles.cardTop}>
                    <span style={sharedStyles.name}>{scene.title}</span>
                    {isAdmin && (
                      <div style={sharedStyles.cardActions}>
                        <button style={sharedStyles.iconBtn} onClick={() => startEdit(scene)}><Edit2 size={15} /></button>
                        <button style={{ ...sharedStyles.iconBtn, color: theme.primary }} onClick={() => removeScene(scene.id)}><Trash2 size={15} /></button>
                      </div>
                    )}
                  </div>
                  {scene.description && <p style={sharedStyles.desc}>{scene.description}</p>}
                  <div style={styles.chipRow}>
                    {chars.map(c => <span key={c.id} style={{ ...styles.chip, background: theme.accentBg, color: theme.accent }}>{c.name}</span>)}
                    {clues.map(cl => <span key={cl.id} style={{ ...styles.chip, background: '#e6f2ec', color: '#2f6b4f' }}>{cl.title}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineRow: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 },
  number: { width: 32, height: 32, borderRadius: '50%', background: theme.accent, color: theme.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  line: { width: 2, flexGrow: 1, background: theme.divider, minHeight: 24, margin: '4px 0' },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: { fontSize: 12, padding: '2px 8px', borderRadius: 20 },
};
