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

// The sections a player has to complete (or skip) before guessing the
// killer, in checklist order. Ids match the backend's section_hints rows.
export const MYSTERY_SECTIONS = [
  { id: "kartan", label: "Kartan" },
  { id: "tidslinje", label: "Tidslinjen" },
  { id: "ledtradar", label: "Ledtrådar" },
  { id: "detektiven", label: "Detektiven" },
  { id: "offret", label: "Offret" },
  { id: "de-misstankta", label: "De misstänkta" },
  { id: "vittnen", label: "Vittnen" },
];

export const POOL_ID = "pool";

export const INVESTIGATION_SECTIONS = ["kartan", "tidslinje", "evidence"];
