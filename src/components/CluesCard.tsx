import React, { useState } from "react";
import { Check, Image as ImageIcon, User } from "lucide-react";
import { useGame } from "../context/GameContext";
import { theme } from "../theme";
import { styles as sharedStyles } from "../shared/styles";
import { POOL_ID } from "../shared/data";
import { fileSrc } from "../api/client";

// Players drag each clue (item) onto the character they think it belongs to.
// The mapping lives in player_clues and is checked against the real owners
// server-side — see usePlayerClue.
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
  const detective = game.characters.find((c) => c.role === "detective");
  const suspects = game.characters.filter((c) => c.role === "suspect");

  const [dragOverBucket, setDragOverBucket] = useState<string | null>(null);

  const itemsIn = (characterId: string) =>
    game.clues.filter((item) => assignments[item.id] === characterId);
  const isBucketSolved = (characterId: string) =>
    solvedCharacterIds.includes(characterId);

  const handleItemDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    itemId: string,
  ) => {
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleBucketDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    bucketId: string,
  ) => {
    e.preventDefault();
    setDragOverBucket(bucketId);
  };

  const handleBucketDrop = (
    e: React.DragEvent<HTMLDivElement>,
    bucketId: string,
  ) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) onAssign(itemId, bucketId === POOL_ID ? null : bucketId);
    setDragOverBucket(null);
  };

  return (
    <div style={{ ...sharedStyles.card, position: "relative" }}>
      <div style={sharedStyles.sortGrid}>
        {detective &&
          (() => {
            const detectiveItems = itemsIn(detective.id);
            const detectiveSolved = isBucketSolved(detective.id);
            return (
              <div style={sharedStyles.sortGrid}>
                <div
                  style={{
                    ...sharedStyles.sortBucket,
                    ...(dragOverBucket === detective.id
                      ? sharedStyles.sortBucketOver
                      : {}),
                  }}
                  onDragOver={(e) => handleBucketDragOver(e, detective.id)}
                  onDragLeave={() => setDragOverBucket(null)}
                  onDrop={(e) => handleBucketDrop(e, detective.id)}
                >
                  <div style={sharedStyles.sortBucketHeader}>
                    <div style={sharedStyles.sortBucketHeaderLeft}>
                      <div style={sharedStyles.sortBucketAvatar}>
                        {detective.imageUrl ? (
                          <img
                            src={fileSrc(detective.imageUrl)}
                            alt={detective.name}
                            style={sharedStyles.sortBucketAvatarImg}
                          />
                        ) : (
                          <User size={18} color={theme.textFaint} />
                        )}
                      </div>
                      <span style={sharedStyles.sortBucketName}>
                        {detective.name}
                      </span>
                    </div>
                    <span
                      style={{
                        ...sharedStyles.subCheckCircle,
                        ...(detectiveSolved ? sharedStyles.subCheckCircleDone : {}),
                      }}
                      title={
                        detectiveSolved
                          ? "Rätt ledtrådar tilldelade"
                          : "Inte rätt ledtrådar tilldelade än"
                      }
                    >
                      {detectiveSolved && (
                        <Check size={10} color={theme.primaryText} />
                      )}
                    </span>
                  </div>
                  <div style={sharedStyles.sortItemList}>
                    {detectiveItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, item.id)}
                        style={sharedStyles.sortItem}
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
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
      <span
        title={
          solved
            ? "Alla ledtrådar är rätt tilldelade"
            : "Inte alla ledtrådar är rätt tilldelade än"
        }
        style={{
          ...sharedStyles.ledtradarTabCircle,
          ...(solved ? sharedStyles.subCheckCircleDone : {}),
        }}
      >
        {solved && <Check size={11} color={theme.primaryText} />}
      </span>

      <div style={sharedStyles.sortGrid}>
        {suspects.map((c) => {
          const items = itemsIn(c.id);
          const bucketSolved = isBucketSolved(c.id);
          return (
            <div
              key={c.id}
              style={{
                ...sharedStyles.sortBucket,
                ...(dragOverBucket === c.id ? sharedStyles.sortBucketOver : {}),
              }}
              onDragOver={(e) => handleBucketDragOver(e, c.id)}
              onDragLeave={() => setDragOverBucket(null)}
              onDrop={(e) => handleBucketDrop(e, c.id)}
            >
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
                  {bucketSolved && (
                    <Check size={10} color={theme.primaryText} />
                  )}
                </span>
              </div>
              <div style={sharedStyles.sortItemList}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, item.id)}
                    style={sharedStyles.sortItem}
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
                ))}
              </div>
            </div>
          );
        })}
        <div
          style={{
            ...sharedStyles.sortBucket,
            gridColumn: "1 / -1",
            ...(dragOverBucket === POOL_ID ? sharedStyles.sortBucketOver : {}),
          }}
          onDragOver={(e) => handleBucketDragOver(e, POOL_ID)}
          onDragLeave={() => setDragOverBucket(null)}
          onDrop={(e) => handleBucketDrop(e, POOL_ID)}
        >
          <div style={sharedStyles.sortBucketHeader}>
            <span style={sharedStyles.sortBucketName}>Ledtrådar</span>
          </div>
          <div style={sharedStyles.sortItemListRow}>
            {game.clues
              .filter((item) => !assignments[item.id])
              .map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item.id)}
                style={sharedStyles.sortItem}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
