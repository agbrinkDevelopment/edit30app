import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Binoculars,
  Cat,
  HelpCircle,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";

// A small Nancy Drew–style point-and-click game: the player walks through
// photos of the apartment, clicking on things to move closer, open doors and
// pick up hidden items. Everything lives in the SCENES/ITEMS data below, so
// the story can be changed without touching the component.

type ItemId = "kikare" | "katt" | "nyckel" | "nasgrej";

type SceneId =
  | "hall"
  | "dubbeldorr"
  | "dorroppning"
  | "garderobsdorr"
  | "garderobsdorr-nara"
  | "garderob"
  | "hyllor"
  | "hylla"
  | "sovrum"
  | "sang"
  | "tejpen"
  | "under-sangen"
  | "skrivbord"
  | "datorn"
  | "sanghorn"
  | "gardin"
  | "fonstret"
  | "utsikten"
  | "kikarvy"
  | "nattduksbord"
  | "narbild"
  | "under-ljuset";

// Position and size in percent of the photo, so hotspots scale with it.
interface Hotspot {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  // Where clicking takes the player, optionally via a short sequence of
  // in-between photos (a door swinging open).
  to?: SceneId;
  frames?: string[];
  // Picks up an item; the hotspot disappears once it's in the inventory.
  item?: ItemId;
  // A line of narration shown when clicked.
  say?: string;
  // Only works once this item ("all": every item) is in the inventory; until
  // then clicking just shows `locked`.
  requires?: ItemId | "all";
  locked?: string;
  // Played when clicked while still locked.
  lockedSound?: string;
  // An image opened in a pop-up, e.g. what's on a screen.
  show?: string;
  // Leaves the game (see the `onExit` prop), after the player types this
  // code when one is set.
  exit?: boolean;
  exitCode?: string;
}

interface Scene {
  image: string;
  text: string;
  back?: SceneId;
  hotspots: Hotspot[];
}

const img = (n: string) => `/lagenheten/${n}.jpg`;

const ITEMS: Record<
  ItemId,
  {
    name: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  kikare: {
    name: "Kikare",
    description:
      "En liten kikare, gömd längst in på hyllan i garderoben. Vem har spanat på vad?",
    icon: Binoculars,
  },
  katt: {
    name: "Kattbrickan",
    description:
      "En träbricka med en utskuren katt. Den låg dold under ljuset på nattduksbordet.",
    icon: Cat,
  },
  nyckel: {
    name: "Nyckel",
    description:
      "En liten nyckel som låg på golvet under sängen. Vad passar den till?",
    icon: KeyRound,
  },
  nasgrej: {
    name: "Näsgrej",
    description: "Ett litet genomskinligt näsgrej. Ingen aning, ärligt talat.",
    icon: HelpCircle,
  },
};

const START: SceneId = "hall";

// The two clues before the player may leave for the sign-in page: the rebus
// on the cat coaster says where to look ("katedralen"), and the code is the
// year cut into the cathedral, seen through the binoculars, which is typed
// into the computer screen. Uppsala domkyrka was consecrated in 1435.
const REBUS_ANSWERS = ["katedral", "katedralen"];
const CODE = "1435";
const WRONG_SOUND = "/lagenheten/cant_check_that_off.m4a";

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");

const SCENES: Record<SceneId, Scene> = {
  hall: {
    image: img("1638"),
    text: "Hallen i Edits lägenhet. Det är tyst – alldeles för tyst.",
    hotspots: [
      {
        x: 30,
        y: 22,
        w: 50,
        h: 56,
        label: "Gå fram till dubbeldörren",
        to: "dubbeldorr",
      },
    ],
  },
  dubbeldorr: {
    image: img("1639"),
    text: "En stängd dubbeldörr. Handtaget är kallt.",
    back: "hall",
    hotspots: [
      {
        x: 58,
        y: 50,
        w: 24,
        h: 20,
        label: "Öppna dörren",
        frames: [img("1640"), img("1641"), img("1642")],
        to: "dorroppning",
      },
    ],
  },
  dorroppning: {
    image: img("1643"),
    text: "Dörren glider upp. Längre in skymtar ett sovrum i halvmörker.",
    back: "hall",
    hotspots: [
      { x: 33, y: 25, w: 34, h: 50, label: "Gå in i sovrummet", to: "sovrum" },
      {
        x: 0,
        y: 20,
        w: 20,
        h: 60,
        label: "Den andra dörren",
        to: "garderobsdorr",
      },
    ],
  },
  garderobsdorr: {
    image: img("1644"),
    text: "En smal dörr bredvid dubbeldörren.",
    back: "dorroppning",
    hotspots: [
      {
        x: 8,
        y: 15,
        w: 48,
        h: 80,
        label: "Gå närmare",
        to: "garderobsdorr-nara",
      },
    ],
  },
  "garderobsdorr-nara": {
    image: img("1645"),
    text: "En stängd dörr med ett nyckelhål under handtaget.",
    back: "dorroppning",
    hotspots: [
      {
        x: 56,
        y: 50,
        w: 22,
        h: 22,
        label: "Öppna dörren",
        frames: [img("1646"), img("1647"), img("1648")],
        to: "garderob",
        requires: "nyckel",
        locked: "Dörren är låst. Du behöver en nyckel.",
        lockedSound: "/lagenheten/its_locked_new.aif",
        say: "Nyckeln passar! Låset klickar till.",
      },
    ],
  },
  garderob: {
    image: img("1651"),
    text: "En fullproppad garderob. Här har någon stuvat undan allt möjligt.",
    back: "dorroppning",
    hotspots: [
      { x: 25, y: 15, w: 50, h: 75, label: "Titta på hyllorna", to: "hyllor" },
    ],
  },
  hyllor: {
    image: img("1652"),
    text: "Strykjärn, påsar, gamla kläder … och något längre in på en hylla.",
    back: "garderob",
    hotspots: [
      {
        x: 50,
        y: 25,
        w: 45,
        h: 55,
        label: "Titta närmare på hyllan",
        to: "hylla",
      },
    ],
  },
  hylla: {
    image: img("1653"),
    text: "Mellan handdukarna ligger något som inte riktigt hör hemma här.",
    back: "hyllor",
    hotspots: [
      {
        x: 46,
        y: 40,
        w: 24,
        h: 20,
        label: "Ta kikaren",
        item: "kikare",
        say: "Du stoppar kikaren i fickan. Den kan komma till nytta.",
      },
    ],
  },
  sovrum: {
    image: img("1665"),
    text: "Sovrummet. Gardinerna är fördragna och lampan i taket lyser svagt.",
    // Back out to the doorway, where the closet door is.
    back: "dorroppning",
    hotspots: [
      {
        x: 72,
        y: 44,
        w: 26,
        h: 20,
        label: "Gå till skrivbordet",
        to: "skrivbord",
      },
      {
        x: 0,
        y: 42,
        w: 20,
        h: 16,
        label: "Gå till nattduksbordet",
        to: "sanghorn",
      },
      { x: 0, y: 60, w: 14, h: 30, label: "Vänd vänster", to: "sang" },
      { x: 21, y: 20, w: 50, h: 38, label: "Gardinerna", to: "gardin" },
    ],
  },
  sang: {
    image: img("1666"),
    text: "Sängen är bäddad. Någon har inte sovit här i natt.",
    back: "sovrum",
    hotspots: [
      { x: 62, y: 42, w: 16, h: 18, label: "Nattduksbordet", to: "sanghorn" },
      {
        x: 29,
        y: 47,
        w: 9,
        h: 10,
        label: "Något sitter fast på sänggaveln",
        to: "tejpen",
      },
      {
        x: 24,
        y: 62,
        w: 26,
        h: 12,
        label: "Titta under sängen",
        to: "under-sangen",
      },
    ],
  },
  tejpen: {
    image: img("1685"),
    text: "Någon har tejpat fast en lapp på sänggaveln.",
    back: "sang",
    hotspots: [
      {
        x: 22,
        y: 21,
        w: 46,
        h: 46,
        label: "Läs lappen",
        say: "”DE VILL TYSTA MIG!” Handstilen är darrig. Edit visste att hon var i fara.",
      },
    ],
  },
  "under-sangen": {
    image: img("1684"),
    text: "Du lägger dig på golvet och kikar in under sängen. Något glimmar i mörkret.",
    back: "sang",
    hotspots: [
      {
        x: 62,
        y: 44,
        w: 12,
        h: 8,
        label: "Ta nyckeln",
        item: "nyckel",
        say: "En nyckel! Någon måste ha tappat den – eller gömt den.",
      },
      {
        x: 17,
        y: 43,
        w: 11,
        h: 6,
        label: "Ta näsgrejen",
        item: "nasgrej",
        say: "Ett … näsgrej? Du stoppar det i fickan, för säkerhets skull.",
      },
    ],
  },
  skrivbord: {
    image: img("1670"),
    text: "Skrivbordet. Skärmarna lyser fortfarande.",
    back: "sovrum",
    hotspots: [
      { x: 45, y: 34, w: 45, h: 30, label: "Titta på datorn", to: "datorn" },
    ],
  },
  datorn: {
    image: img("1671"),
    text: "Någon har lämnat datorn igång.",
    back: "skrivbord",
    hotspots: [
      {
        x: 20,
        y: 40,
        w: 60,
        h: 18,
        label: "Den stora skärmen",
        exit: true,
        exitCode: CODE,
        requires: "all",
        locked: "Du kan inte bocka av det här än. Leta vidare i lägenheten.",
        lockedSound: "/lagenheten/cant_check_that_off_new.aif",
      },
      {
        x: 40,
        y: 58,
        w: 17,
        h: 18,
        label: "Laptopen",
        say: "Kvällens schema. Edit ler mot dig från skärmen, ovetande om vad som väntar.",
        show: img("inbjudan"),
      },
      {
        x: 58,
        y: 66,
        w: 18,
        h: 10,
        label: "Telefonen och klockorna",
        say: "En telefon och två klockor. Telefonen är avstängd.",
      },
    ],
  },
  sanghorn: {
    image: img("1673"),
    text: "Hörnet bakom sängen. Ett nattduksbord och en tung gardin.",
    back: "sovrum",
    hotspots: [
      {
        x: 36,
        y: 44,
        w: 16,
        h: 16,
        label: "Nattduksbordet",
        to: "nattduksbord",
      },
      { x: 52, y: 0, w: 48, h: 100, label: "Gardinen", to: "gardin" },
    ],
  },
  gardin: {
    image: img("1674"),
    text: "En tung gardin. Det drar lite kallt bakom den.",
    back: "sanghorn",
    hotspots: [
      {
        x: 36,
        y: 5,
        w: 62,
        h: 85,
        label: "Dra undan gardinen",
        to: "fonstret",
      },
      {
        x: 0,
        y: 50,
        w: 32,
        h: 28,
        label: "Nattduksbordet",
        to: "nattduksbord",
      },
    ],
  },
  fonstret: {
    image: img("1686"),
    text: "Bakom gardinen finns ett högt fönster. Ute i mörkret skymtar en kyrkspira.",
    back: "gardin",
    hotspots: [
      {
        x: 45,
        y: 27,
        w: 20,
        h: 52,
        label: "Titta ut genom fönstret",
        to: "utsikten",
      },
    ],
  },
  utsikten: {
    image: img("1689"),
    text: "Domkyrkans tornspiror lyser över Uppsala. Härifrån ser man allt som händer nere vid gatan.",
    back: "fonstret",
    hotspots: [
      {
        x: 37,
        y: 18,
        w: 30,
        h: 52,
        label: "Domkyrkan",
        to: "kikarvy",
        requires: "kikare",
        locked:
          "Domkyrkan är för långt bort för att se några detaljer. Om du bara hade något att titta med …",
      },
    ],
  },
  kikarvy: {
    image: img("kikare-domkyrkan"),
    text: `Genom kikaren syns tornen tydligt. I stenen under spirorna är ett årtal inhugget: ${CODE}.`,
    back: "utsikten",
    hotspots: [],
  },
  nattduksbord: {
    image: img("1675"),
    text: "Ett nattduksbord med en lampa och ett ljus.",
    back: "sanghorn",
    hotspots: [
      { x: 40, y: 25, w: 45, h: 37, label: "Titta närmare", to: "narbild" },
    ],
  },
  narbild: {
    image: img("1678"),
    text: "Ljuset står på något. Konstigt ställe att ställa ett ljus på.",
    back: "nattduksbord",
    hotspots: [
      {
        x: 25,
        y: 40,
        w: 16,
        h: 28,
        label: "Lyft på ljuset",
        to: "under-ljuset",
        say: "Du lyfter försiktigt på ljuset …",
      },
    ],
  },
  "under-ljuset": {
    image: img("1679"),
    text: "Under ljuset döljer sig en liten träbricka.",
    back: "narbild",
    hotspots: [
      {
        x: 24,
        y: 55,
        w: 20,
        h: 17,
        label: "Ta brickan",
        item: "katt",
        say: "En katt? Det här måste betyda något. Titta närmare på den i fickan.",
      },
    ],
  },
};

const FRAME_MS = 280;

interface Progress {
  scene: SceneId;
  items: ItemId[];
  rebusSolved: boolean;
}

function preload(src: string) {
  const i = new Image();
  i.src = src;
}

export default function ApartmentGame({
  onExit,
  style,
}: {
  onExit?: () => void;
  // Overrides for the outer card.
  style?: React.CSSProperties;
}) {
  // Kept in memory only, so every page load starts the game over.
  const [progress, setProgress] = useState<Progress>({
    scene: START,
    items: [],
    rebusSolved: false,
  });
  // A one-off line (from a click) shown instead of the scene's own text.
  const [said, setSaid] = useState<string | null>(null);
  // The in-between photo while a door is swinging open.
  const [frame, setFrame] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  // Which answer prompt is open, if any.
  const [puzzle, setPuzzle] = useState<"rebus" | "code" | null>(null);
  const timers = useRef<number[]>([]);

  const scene = SCENES[progress.scene];
  const allFound = (Object.keys(ITEMS) as ItemId[]).every((id) =>
    progress.items.includes(id),
  );

  // Warm the cache for everything one click away, so moving feels instant.
  useEffect(() => {
    scene.hotspots.forEach((h) => {
      h.frames?.forEach(preload);
      if (h.to) preload(SCENES[h.to].image);
    });
    if (scene.back) preload(SCENES[scene.back].image);
  }, [scene]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const goTo = (to: SceneId) => {
    setHovered(null);
    setProgress((p) => ({ ...p, scene: to }));
  };

  const onHotspot = (h: Hotspot) => {
    if (frame) return;
    const unlocked =
      !h.requires ||
      (h.requires === "all" ? allFound : progress.items.includes(h.requires));
    if (!unlocked) {
      setSaid(h.locked ?? "Det går inte.");
      if (h.lockedSound) {
        // play() rejects if the browser blocks audio; the text still shows.
        new Audio(h.lockedSound).play().catch(() => undefined);
      }
      return;
    }
    if (h.exit && onExit) {
      if (h.exitCode) setPuzzle("code");
      else onExit();
      return;
    }
    setSaid(h.say ?? null);
    if (h.show) setShown(h.show);
    if (h.item) {
      const item = h.item;
      setProgress((p) =>
        p.items.includes(item) ? p : { ...p, items: [...p.items, item] },
      );
    }
    if (!h.to) return;
    const to = h.to;
    const frames = h.frames ?? [];
    if (frames.length === 0) {
      goTo(to);
      return;
    }
    frames.forEach((f, i) => {
      timers.current.push(window.setTimeout(() => setFrame(f), i * FRAME_MS));
    });
    timers.current.push(
      window.setTimeout(() => {
        setFrame(null);
        goTo(to);
      }, frames.length * FRAME_MS),
    );
  };

  const goBack = () => {
    if (!scene.back || frame) return;
    setSaid(null);
    goTo(scene.back);
  };

  const restart = () => {
    timers.current.forEach(clearTimeout);
    setFrame(null);
    setSaid(null);
    setProgress({ scene: START, items: [], rebusSolved: false });
  };

  const visibleHotspots = scene.hotspots.filter(
    (h) => !h.item || !progress.items.includes(h.item),
  );

  return (
    <div style={{ ...sharedStyles.card, ...style }}>
      <style>{`
        .lagenheten-photo { animation: lagenheten-fade 0.35s ease-out; }
        @keyframes lagenheten-fade { from { opacity: 0.2; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .lagenheten-photo { animation: none; }
        }
      `}</style>

      <div style={styles.layout}>
        <div style={styles.viewer}>
          <img
            key={frame ?? scene.image}
            className={frame ? undefined : "lagenheten-photo"}
            src={frame ?? scene.image}
            alt=""
            style={styles.photo}
            draggable={false}
          />
          {!frame &&
            visibleHotspots.map((h, i) => (
              <button
                key={`${progress.scene}-${i}`}
                type="button"
                aria-label={h.label}
                title={h.label}
                onClick={() => onHotspot(h)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...styles.hotspot,
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.w}%`,
                  height: `${h.h}%`,
                  cursor: h.item ? "grab" : h.to ? "zoom-in" : "help",
                  ...(hovered === i ? styles.hotspotHover : {}),
                }}
              />
            ))}
          {scene.back && !frame && (
            <button type="button" onClick={goBack} style={styles.backBtn}>
              <ArrowLeft size={16} /> Tillbaka
            </button>
          )}
        </div>

        <div style={styles.side}>
          <div style={styles.narration}>
            {said ?? scene.text}
            {hovered !== null && visibleHotspots[hovered] && (
              <div style={styles.hint}>{visibleHotspots[hovered].label}</div>
            )}
          </div>

          <div>
            <div style={styles.inventoryTitle}>Fickan</div>
            <div style={styles.inventory}>
              {(Object.keys(ITEMS) as ItemId[]).map((id) => {
                const found = progress.items.includes(id);
                const { icon: Icon, name, description } = ITEMS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!found}
                    onClick={() => {
                      if (id === "katt" && !progress.rebusSolved) {
                        setPuzzle("rebus");
                        return;
                      }
                      setSaid(
                        id === "katt"
                          ? `${description} Rebusen på baksidan: katedralen. Du finner koden i katedralen.`
                          : description,
                      );
                    }}
                    title={found ? name : "Inte hittad än"}
                    style={{
                      ...styles.slot,
                      ...(found ? styles.slotFound : {}),
                    }}
                  >
                    {found ? (
                      <>
                        <Icon size={22} color={theme.accent} />
                        <span style={styles.slotName}>{name}</span>
                      </>
                    ) : (
                      <span style={styles.slotEmpty}>?</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {allFound && (
            <div style={styles.done}>
              Du har hittat allt som gömts i lägenheten. Vad kan kikaren, katten
              och nyckeln ha med mordet att göra?
            </div>
          )}

          <button type="button" onClick={restart} style={styles.restartBtn}>
            <RotateCcw size={14} /> Börja om
          </button>
        </div>
      </div>
      {puzzle === "rebus" && (
        <AnswerModal
          title="Baksidan av kattbrickan"
          answers={REBUS_ANSWERS}
          onClose={() => setPuzzle(null)}
          onSolved={() => {
            setPuzzle(null);
            setProgress((p) => ({ ...p, rebusSolved: true }));
            setSaid("Katedralen! Du finner koden i katedralen.");
          }}
        >
          <p style={styles.puzzleText}>
            Någon har ristat en rebus på baksidan av brickan:
          </p>
          <div style={styles.rebus}>
            <Cat size={56} color={theme.accent} />
            <span>– T + EDRALEN</span>
          </div>
        </AnswerModal>
      )}
      {puzzle === "code" && (
        <AnswerModal
          title="Skärmen är låst"
          answers={[CODE]}
          onClose={() => setPuzzle(null)}
          onSolved={() => {
            setPuzzle(null);
            onExit?.();
          }}
        >
          <p style={styles.puzzleText}>Ange koden för att låsa upp datorn.</p>
        </AnswerModal>
      )}
      {shown && (
        <Modal onClose={() => setShown(null)} maxWidth={420} maxHeight="90vh">
          <img src={shown} alt="" style={styles.shownImage} />
        </Modal>
      )}
    </div>
  );
}

// A pop-up with a puzzle (children) and a text field; calls onSolved once
// the player types one of `answers` (case and spaces don't matter).
function AnswerModal({
  title,
  answers,
  onSolved,
  onClose,
  children,
}: {
  title: string;
  answers: string[];
  onSolved: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.map(normalize).includes(normalize(value))) {
      onSolved();
      return;
    }
    setWrong(true);
    new Audio(WRONG_SOUND).play().catch(() => undefined);
  };

  return (
    <Modal onClose={onClose} maxWidth={380}>
      <h3 style={styles.puzzleTitle}>{title}</h3>
      {children}
      <form onSubmit={submit} style={styles.puzzleForm}>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setWrong(false);
          }}
          placeholder="Ditt svar …"
          style={styles.puzzleInput}
        />
        <button type="submit" style={styles.puzzleBtn}>
          Svara
        </button>
      </form>
      {wrong && (
        <div style={styles.puzzleWrong}>Det stämmer inte. Försök igen.</div>
      )}
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  puzzleTitle: {
    fontFamily: theme.fontSerif,
    fontSize: 24,
    margin: "0 0 8px",
    color: theme.text,
  },
  puzzleText: {
    fontFamily: theme.fontSerif,
    fontSize: 17,
    color: theme.textFaint,
    margin: "0 0 12px",
  },
  rebus: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "16px 0 20px",
    fontFamily: theme.fontSerif,
    fontSize: 30,
    fontWeight: 700,
    color: theme.text,
    letterSpacing: 1,
  },
  puzzleForm: { display: "flex", gap: 8 },
  puzzleInput: {
    flex: 1,
    minWidth: 0,
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${theme.inputBorder}`,
    background: theme.inputBg,
    fontFamily: theme.fontSerif,
    fontSize: 17,
  },
  puzzleBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: 0,
    background: theme.accent,
    color: theme.primaryText,
    fontFamily: theme.fontSerif,
    fontSize: 16,
    cursor: "pointer",
  },
  puzzleWrong: {
    marginTop: 8,
    fontSize: 14,
    color: theme.primary,
  },
  shownImage: {
    display: "block",
    width: "100%",
    height: "auto",
    marginTop: 20,
    borderRadius: 8,
  },
  layout: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
  },
  viewer: {
    position: "relative",
    flex: "1 1 300px",
    maxWidth: 480,
    aspectRatio: "3 / 4",
    borderRadius: 10,
    overflow: "hidden",
    background: "#111",
    userSelect: "none",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  hotspot: {
    position: "absolute",
    background: "transparent",
    border: "2px solid transparent",
    borderRadius: 10,
    padding: 0,
    transition: "border-color 0.15s, background 0.15s",
  },
  hotspotHover: {
    borderColor: "rgba(255, 253, 248, 0.8)",
    background: "rgba(255, 253, 248, 0.12)",
  },
  backBtn: {
    position: "absolute",
    left: 10,
    bottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 20,
    border: 0,
    background: "rgba(26, 22, 17, 0.7)",
    color: theme.primaryText,
    fontFamily: "inherit",
    fontSize: 14,
    cursor: "pointer",
  },
  side: {
    flex: "1 1 220px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  narration: {
    background: theme.text,
    color: theme.cardBg,
    borderRadius: 10,
    padding: "14px 16px",
    fontFamily: theme.fontSerif,
    fontSize: 18,
    lineHeight: 1.4,
    minHeight: 90,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  inventoryTitle: {
    fontFamily: theme.fontSerif,
    fontWeight: 700,
    fontSize: 18,
    color: theme.textFaint,
    marginBottom: 6,
  },
  inventory: { display: "flex", gap: 8, flexWrap: "wrap" },
  slot: {
    width: 84,
    height: 72,
    borderRadius: 10,
    border: `1.5px dashed ${theme.inputBorder}`,
    background: theme.inputBg,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    fontFamily: "inherit",
    padding: 4,
  },
  slotFound: {
    border: `1.5px solid ${theme.accent}`,
    background: theme.cardBg,
    cursor: "pointer",
  },
  slotName: { fontSize: 12, color: theme.textFaint },
  slotEmpty: { fontSize: 20, color: theme.inputBorder },
  done: {
    background: theme.accentBg,
    color: theme.accent,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    lineHeight: 1.5,
  },
  restartBtn: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: 0,
    color: theme.textFaint,
    fontFamily: "inherit",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
  },
};
