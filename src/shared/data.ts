import {
  Fingerprint,
  Footprints,
  HelpCircle,
  MapPin,
  History,
  Microscope,
  Search,
  Skull,
  Users,
  Eye,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "mordaren", label: "Mördaren", icon: HelpCircle },
  { id: "kartan", label: "Kartan", icon: MapPin },
  { id: "tidslinje", label: "Tidslinje", icon: History },
  { id: "bevis", label: "Bevis", icon: Microscope },
  { id: "ledtradar", label: "Ledtrådar", icon: Search },
  { id: "spar", label: "Spår", icon: Footprints },
  { id: "detektiven", label: "Detektiven", icon: Fingerprint },
  { id: "offret", label: "Offret", icon: Skull },
  { id: "de-misstankta", label: "De misstänkta", icon: Users },
  { id: "vittnen", label: "Vittnen", icon: Eye },
];

export const PROGRESS_KEY = "mystery-progress";

export const SORT_ITEMS = [
  {
    id: "item-knife",
    title: "Fällkniven",
    imageUrl: "/evidence/evidence_knife.png",
  },
  { id: "item-gun", title: "Pistolen", imageUrl: "/evidence/evidence_gun.png" },
  {
    id: "item-clip",
    title: "Hårspännet",
    imageUrl: "/evidence/evidence_clip.png",
  },
  {
    id: "item-note",
    title: "Lappen om katedralen",
    imageUrl: "/evidence/evidence_note.png",
  },
  {
    id: "item-snus",
    title: "Snusdosan",
    imageUrl: "/evidence/evidence_snus.png",
  },
  {
    id: "item-cigaretts",
    title: "Cigarettpaketet",
    imageUrl: "/evidence/evidence_cigaretts.png",
  },
  {
    id: "item-filosofi",
    title: "Filosofiboken",
    imageUrl: "/evidence/evidence_filosofi.png",
  },
  {
    id: "item-badge",
    title: "Polismärket",
    imageUrl: "/evidence/evidence_badge.png",
  },
];

export const POOL_ID = "pool";
export const SORT_KEY = "mystery-clue-sort";

// Facit: which character each clue actually belongs to.
export const CORRECT_OWNER_FOR_ITEM: Record<string, string> = {
  "item-gun": "seed-polisen",
  "item-badge": "seed-polisen",
  "item-knife": "seed-roliga",
  "item-clip": "seed-roliga",
  "item-snus": "seed-raggare1",
  "item-note": "seed-raggare2",
  "item-cigaretts": "seed-raggare3",
  "item-filosofi": "seed-raggare3",
};

export const INVESTIGATION_SECTIONS = ["kartan", "tidslinje", "evidence"];
