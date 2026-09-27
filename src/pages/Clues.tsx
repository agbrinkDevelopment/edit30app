import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Clue } from '../types';
import { Plus, Trash2, Edit2, X, Check, Star } from 'lucide-react';
import { theme } from '../theme';
import { sharedStyles } from '../shared/styles';

const emptyClue = (): Omit<Clue, 'id'> => ({
  title: '', description: '', location: '', revealedBy: '', relatedCharacterIds: [], isMacguffin: false, imageUrl: null,
});

export default function Clues() {
  const { game, addClue, updateClue, removeClue } = useGame();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<Clue | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyClue());

  const startCreate = () => { setDraft(emptyClue()); setCreating(true); setEditing(null); };
  const startEdit = (c: Clue) => { setEditing(c); setDraft(c); setCreating(false); };
  const cancel = () => { setEditing(null); setCreating(false); };

  const save = () => {
    if (!draft.title.trim()) return;
    if (creating) addClue(draft);
    else if (editing) updateClue({ ...draft, id: editing.id });
    cancel();
  };

  const setField = (field: keyof Omit<Clue, 'id'>, value: any) =>
    setDraft(d => ({ ...d, [field]: value }));

  const toggleCharacter = (id: string) => {
    const ids = draft.relatedCharacterIds.includes(id)
      ? draft.relatedCharacterIds.filter(x => x !== id)
      : [...draft.relatedCharacterIds, id];
    setField('relatedCharacterIds', ids);
  };

  const showForm = isAdmin && (editing || creating);

  return (
    <div style={sharedStyles.pageNarrow}>
      <div style={sharedStyles.header}>
        <h1 style={sharedStyles.h1}>Clues</h1>
        {isAdmin && <button style={sharedStyles.btn} onClick={startCreate}><Plus size={16} /> Add Clue</button>}
      </div>

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>{creating ? 'New Clue' : `Edit: ${editing!.title}`}</h2>
          <div style={sharedStyles.formGrid}>
            <Field label="Title">
              <input style={sharedStyles.input} value={draft.title} onChange={e => setField('title', e.target.value)} placeholder="Clue name" />
            </Field>
            <Field label="Location Found">
              <input style={sharedStyles.input} value={draft.location} onChange={e => setField('location', e.target.value)} placeholder="Where is this clue discovered?" />
            </Field>
            <Field label="Description" full>
              <textarea style={sharedStyles.textarea} value={draft.description} onChange={e => setField('description', e.target.value)} placeholder="What is this clue and what does it reveal?" rows={3} />
            </Field>
            <Field label="Image URL" full>
              <input style={sharedStyles.input} value={draft.imageUrl ?? ''} onChange={e => setField('imageUrl', e.target.value || null)} placeholder="e.g. /evidence/evidence_knife.png" />
            </Field>
            <Field label="How It's Revealed" full>
              <input style={sharedStyles.input} value={draft.revealedBy} onChange={e => setField('revealedBy', e.target.value)} placeholder="e.g. found in the library, given by the butler..." />
            </Field>
            {game.characters.length > 0 && (
              <Field label="Related Characters" full>
                <div style={sharedStyles.checkboxGroup}>
                  {game.characters.map(c => (
                    <label key={c.id} style={sharedStyles.checkLabel}>
                      <input type="checkbox" checked={draft.relatedCharacterIds.includes(c.id)} onChange={() => toggleCharacter(c.id)} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </Field>
            )}
          </div>
          <label style={styles.macguffinToggle}>
            <input type="checkbox" checked={draft.isMacguffin} onChange={e => setField('isMacguffin', e.target.checked)} />
            <Star size={14} color={theme.accent} />
            <span>Key / pivotal clue</span>
          </label>
          <div style={sharedStyles.formActions}>
            <button style={sharedStyles.btnSecondary} onClick={cancel}><X size={15} /> Cancel</button>
            <button style={sharedStyles.btn} onClick={save}><Check size={15} /> Save</button>
          </div>
        </div>
      )}

      {game.clues.length === 0 && !showForm ? (
        <div style={sharedStyles.empty}>No clues yet. Add one to start building your mystery.</div>
      ) : (
        <div style={sharedStyles.list}>
          {game.clues.map(clue => {
            const related = game.characters.filter(c => clue.relatedCharacterIds.includes(c.id));
            return (
              <div key={clue.id} style={{ ...sharedStyles.card, borderLeft: `4px solid ${clue.isMacguffin ? theme.accent : theme.cardBorder}` }}>
                <div style={sharedStyles.cardTop}>
                  <div style={sharedStyles.cardMeta}>
                    <span style={sharedStyles.name}>{clue.title}</span>
                    {clue.isMacguffin && <Star size={14} color={theme.accent} fill={theme.accent} />}
                    {clue.location && <span style={sharedStyles.location}>{clue.location}</span>}
                  </div>
                  {isAdmin && (
                    <div style={sharedStyles.cardActions}>
                      <button style={sharedStyles.iconBtn} onClick={() => startEdit(clue)}><Edit2 size={15} /></button>
                      <button style={{ ...sharedStyles.iconBtn, color: theme.primary }} onClick={() => removeClue(clue.id)}><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
                {clue.description && <p style={sharedStyles.descCompact}>{clue.description}</p>}
                {clue.revealedBy && <p style={styles.revealed}><strong>Revealed:</strong> {clue.revealedBy}</p>}
                {related.length > 0 && (
                  <div style={sharedStyles.tags}>
                    {related.map(c => <span key={c.id} style={sharedStyles.tag}>{c.name}</span>)}
                  </div>
                )}
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
  macguffinToggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: theme.accent, fontSize: 14, marginBottom: 20 },
  revealed: { fontSize: 12, color: theme.textMuted, margin: '0 0 10px' },
};
