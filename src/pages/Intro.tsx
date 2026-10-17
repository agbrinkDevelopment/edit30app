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
      <ApartmentGame onExit={onDone} style={styles.card} />
    </SignInFrame>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Same card as the sign-in form.
  card: {
    background: "#fff",
    border: "1px solid #d2d2d2",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    boxSizing: "border-box",
  },
};
