import React, { useState } from "react";
import { Check, Image as ImageIcon, User } from "lucide-react";
import { useGame } from "../context/GameContext";
import { theme } from "../theme";
import SectionCheckCircle from "./SectionCheckCircle";
import { styles as sharedStyles } from "../shared/styles";
import { POOL_ID } from "../shared/data";
import { fileSrc } from "../api/client";
import { useIsMobile } from "../hooks/useIsMobile";
import { Character, Clue } from "../types";

// Players sort each clue (item) onto the character they think it belongs to.
// The mapping lives in player_clues and is checked against the real owners
// server-side — see usePlayerClue.
//
// Desktop: drag and drop. Mobile: HTML5 drag and drop doesn't fire on touch
// screens, so there it's tap an item to pick it up, then tap the character
// (or the Ledtrådar pool) to put it down; tapping the item again cancels.
export default function CluesCard({
  assignments,
  solved,
  solvedCharacterIds,
  onAssign,
}: {
  assignments: Record<string, string | null>;
  solved: boolean;
  solvedCharacterIds: string[];
  onAssign: (clueId: string, characterId: string | null) => void;
}) {
  const { game } = useGame();
  const isMobile = useIsMobile();
  const detective = game.characters.find((c) => c.role === "detective");
  const suspects = game.characters.filter((c) => c.role === "suspect");

  const [dragOverBucket, setDragOverBucket] = useState<string | null>(null);
  // Mobile only: the item picked up by a tap, waiting for a bucket tap.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = game.clues.find((c) => c.id === selectedId);

  const itemsIn = (characterId: string) =>
    game.clues.filter((item) => assignments[item.id] === characterId);

  const assignTo = (itemId: string, bucketId: string) =>
    onAssign(itemId, bucketId === POOL_ID ? null : bucketId);

  const handleBucketDrop = (
    e: React.DragEvent<HTMLDivElement>,
    bucketId: string,
  ) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) assignTo(itemId, bucketId);
    setDragOverBucket(null);
  };

  const handleBucketTap = (bucketId: string) => {
    if (!isMobile || !selectedId) return;
    assignTo(selectedId, bucketId);
    setSelectedId(null);
  };

  const bucketProps = (bucketId: string) => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOverBucket(bucketId);
    },
    onDragLeave: () => setDragOverBucket(null),
    onDrop: (e: React.DragEvent<HTMLDivElement>) =>
      handleBucketDrop(e, bucketId),
    onClick: () => handleBucketTap(bucketId),
  });

  // Highlighted while dragged over, or on mobile while an item is picked up
  // (every bucket is then a place it can go).
  const bucketStyle = (bucketId: string): React.CSSProperties => ({
    ...sharedStyles.sortBucket,
    ...(dragOverBucket === bucketId || (isMobile && selectedId)
      ? sharedStyles.sortBucketOver
      : {}),
    ...(isMobile && selectedId ? { cursor: "pointer" } : {}),
  });

  const renderItem = (item: Clue) => {
    const selected = isMobile && item.id === selectedId;
    return (
      <div
        key={item.id}
        draggable={!isMobile}
        onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
        onClick={(e) => {
          if (!isMobile) return;
          // Don't let the tap also count as a tap on the surrounding bucket.
          e.stopPropagation();
          setSelectedId(selected ? null : item.id);
        }}
        style={{
          ...sharedStyles.sortItem,
          ...(isMobile ? { cursor: "pointer" } : {}),
          ...(selected ? styles.sortItemSelected : {}),
        }}
      >
        <div style={sharedStyles.sortItemImage}>
          {item.imageUrl ? (
            <img
              src={fileSrc(item.imageUrl)}
              alt={item.title}
              style={sharedStyles.sortItemImageImg}
            />
          ) : (
            <ImageIcon size={16} color={theme.textFaint} />
          )}
        </div>
        <span style={sharedStyles.sortItemTitle}>{item.title}</span>
      </div>
    );
  };

  const renderBucket = (c: Character) => {
    const bucketSolved = solvedCharacterIds.includes(c.id);
    return (
      <div key={c.id} style={bucketStyle(c.id)} {...bucketProps(c.id)}>
        <div style={sharedStyles.sortBucketHeader}>
          <div style={sharedStyles.sortBucketHeaderLeft}>
            <div style={sharedStyles.sortBucketAvatar}>
              {c.imageUrl ? (
                <img
                  src={fileSrc(c.imageUrl)}
                  alt={c.name}
                  style={sharedStyles.sortBucketAvatarImg}
                />
              ) : (
                <User size={18} color={theme.textFaint} />
              )}
            </div>
            <span style={sharedStyles.sortBucketName}>{c.name}</span>
          </div>
          <span
            style={{
              ...sharedStyles.subCheckCircle,
              ...(bucketSolved ? sharedStyles.subCheckCircleDone : {}),
            }}
            title={
              bucketSolved
                ? "Rätt ledtrådar tilldelade"
                : "Inte rätt ledtrådar tilldelade än"
            }
          >
            {bucketSolved && <Check size={10} color={theme.primaryText} />}
          </span>
        </div>
        <div style={sharedStyles.sortItemList}>
          {itemsIn(c.id).map(renderItem)}
        </div>
      </div>
    );
  };

  // The unassigned items. Last on desktop; first on mobile, so the items
  // to tap are right under the instructions instead of below every bucket.
  const poolBucket = (
    <div
      style={{ ...bucketStyle(POOL_ID), gridColumn: "1 / -1" }}
      {...bucketProps(POOL_ID)}
    >
      <div style={sharedStyles.sortBucketHeader}>
        <span style={sharedStyles.sortBucketName}>Ledtrådar</span>
      </div>
      <div style={sharedStyles.sortItemListRow}>
        {game.clues.filter((item) => !assignments[item.id]).map(renderItem)}
      </div>
    </div>
  );

  return (
    <div style={{ ...sharedStyles.card, position: "relative" }}>
      {isMobile && (
        <p style={styles.mobileHelp}>
          {selectedItem
            ? `Tryck på den karaktär som ${selectedItem.title} tillhör.`
            : "Tryck på en ledtråd och sedan på den karaktär den tillhör."}
        </p>
      )}
      {isMobile && poolBucket}
      <div
        style={{ ...sharedStyles.sortGrid, marginBottom: 12, marginTop: 12 }}
      >
        {detective && (
          <div style={sharedStyles.sortGrid}>{renderBucket(detective)}</div>
        )}
      </div>
      <SectionCheckCircle
        sectionId="ledtradar"
        done={solved}
        wrapperStyle={sharedStyles.ledtradarTabCircles}
        baseStyle={sharedStyles.ledtradarTabCircle}
        doneStyle={sharedStyles.subCheckCircleDone}
        iconSize={11}
        title={
          solved
            ? "Alla ledtrådar är rätt tilldelade"
            : "Inte alla ledtrådar är rätt tilldelade än"
        }
      />

      <div style={sharedStyles.sortGrid}>
        {suspects.map(renderBucket)}
        {!isMobile && poolBucket}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // A ring rather than a border change, so the item doesn't shift in size
  // (and sortItem's `border` shorthand isn't mixed with a longhand).
  sortItemSelected: {
    boxShadow: `0 0 0 2px ${theme.textFaint}`,
    background: theme.accentBg,
  },
  mobileHelp: {
    margin: "4px 0 24px",
    // Clear of the status circles in the top-right corner.
    paddingRight: 72,
    fontSize: 13,
    color: theme.textMuted,
  },
};
