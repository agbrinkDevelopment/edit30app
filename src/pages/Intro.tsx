import React, { useEffect } from "react";
import ApartmentGame from "../components/ApartmentGame";
import { SignInFrame } from "./SignIn";

// Shown before the sign-in page, in the same frame: the apartment game.
// Clicking the big computer screen in the bedroom (which shows this app's
// sign-in page) takes the player on to signing in.
const INTRO_SOUND = "/lagenheten/her_interactive_new.aif";
const INTRO_SOUND_KEY = "lagenheten-intro-sound-played";

// Plays the intro jingle the first time someone opens the app (per browser).
// Browsers block sound until the page has been interacted with, so if the
// immediate attempt is refused it plays on the first click or key press.
function usePlayIntroSoundOnce() {
  useEffect(() => {
    try {
      if (localStorage.getItem(INTRO_SOUND_KEY)) return;
    } catch {
      // ignore storage errors
    }
    const audio = new Audio(INTRO_SOUND);
    const markPlayed = () => {
      try {
        localStorage.setItem(INTRO_SOUND_KEY, "1");
      } catch {
        // ignore storage errors
      }
    };
    const playOnInteraction = () => {
      audio
        .play()
        .then(markPlayed)
        .catch(() => undefined);
      removeListeners();
    };
    const removeListeners = () => {
      window.removeEventListener("pointerdown", playOnInteraction);
      window.removeEventListener("keydown", playOnInteraction);
    };
    audio
      .play()
      .then(markPlayed)
      .catch(() => {
        window.addEventListener("pointerdown", playOnInteraction);
        window.addEventListener("keydown", playOnInteraction);
      });
    return () => {
      removeListeners();
      audio.pause();
    };
  }, []);
}

export default function Intro({ onDone }: { onDone: () => void }) {
  usePlayIntroSoundOnce();
  return (
    <SignInFrame maxWidth={860}>
      <p style={styles.welcome}>
        Välkomna till <span style={styles.subtitle}>Mordmysterium</span>, Edit
        30 år edition. Innan mordmysteriet kan börja måste ni lösa detta
        minispel. Klicka er runt, leta upp de gömda föremålen och lös
        ledtrådarna – den som låser upp datorn kommer vidare till själva spelet.
      </p>
      <h2 style={styles.title}>Minispelet</h2>
      <ApartmentGame onExit={onDone} style={styles.card} />
    </SignInFrame>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Same look as the section titles inside the app.
  title: {
    alignSelf: "stretch",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 700,
    color: "#3d372c",
    margin: "0 0 8px",
  },
  welcome: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 19,
    lineHeight: 1.5,
    color: "#3d372c",
    textAlign: "center",
    maxWidth: 660,
    margin: "0 0 24px",
  },
  // Same card as the sign-in form.
  card: {
    background: "#fff",
    border: "1px solid #d2d2d2",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    boxSizing: "border-box",
  },
  subtitle: {
    fontFamily: "'Creepster', cursive",
    fontSize: 19,
    fontWeight: 400,
    color: "#a40000",
    margin: "0 0 30px",
    textAlign: "center",
  },
};
