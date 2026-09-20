import React, { useState } from "react";
import { Check, Image as ImageIcon, User } from "lucide-react";
import { useGame } from "../context/GameContext";
import { theme } from "../theme";
import { styles as sharedStyles } from "../shared/styles";
import { isBucketSolved, loadSort } from "../shared/helpers";
import { SORT_ITEMS, POOL_ID, SORT_KEY } from "../shared/data";

export default function CluesCard() {
  const { game } = useGame();
  const detective = game.characters.find((c) => c.role === "detective");
  const suspects = game.characters.filter((c) => c.role === "suspect");
  const clueBucketCharacters = detective ? [...suspects, detective] : suspects;

  const [itemBucket, setItemBucket] =
    useState<Record<string, string>>(loadSort);
  const [dragOverBucket, setDragOverBucket] = useState<string | null>(null);

  const allBucketsChecked =
    clueBucketCharacters.length > 0 &&
    clueBucketCharacters.every((c) => isBucketSolved(c.id, itemBucket));

  const assignItem = (itemId: string, bucketId: string) => {
    setItemBucket((prev) => {
      const next = { ...prev, [itemId]: bucketId };
      try {
        localStorage.setItem(SORT_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

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
    if (itemId) assignItem(itemId, bucketId);
    setDragOverBucket(null);
  };

  return (
    <div style={{ ...sharedStyles.card, position: "relative" }}>
      <div style={sharedStyles.sortGrid}>
        {detective &&
          (() => {
            const detectiveItems = SORT_ITEMS.filter(
              (item) => itemBucket[item.id] === detective.id,
            );
            const detectiveSolved = isBucketSolved(detective.id, itemBucket);
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
                            src={detective.imageUrl}
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
                              src={item.imageUrl}
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
          allBucketsChecked
            ? "Alla misstänkta är klara"
            : "Inte alla misstänkta är klara än"
        }
        style={{
          ...sharedStyles.ledtradarTabCircle,
          ...(allBucketsChecked ? sharedStyles.subCheckCircleDone : {}),
        }}
      >
        {allBucketsChecked && <Check size={11} color={theme.primaryText} />}
      </span>

      <div style={sharedStyles.sortGrid}>
        {suspects.map((c) => {
          const items = SORT_ITEMS.filter(
            (item) => itemBucket[item.id] === c.id,
          );
          const solved = isBucketSolved(c.id, itemBucket);
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
                        src={c.imageUrl}
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
                    ...(solved ? sharedStyles.subCheckCircleDone : {}),
                  }}
                  title={
                    solved
                      ? "Rätt ledtrådar tilldelade"
                      : "Inte rätt ledtrådar tilldelade än"
                  }
                >
                  {solved && <Check size={10} color={theme.primaryText} />}
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
                          src={item.imageUrl}
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
            {SORT_ITEMS.filter(
              (item) => !itemBucket[item.id] || itemBucket[item.id] === POOL_ID,
            ).map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item.id)}
                style={sharedStyles.sortItem}
              >
                <div style={sharedStyles.sortItemImage}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
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
