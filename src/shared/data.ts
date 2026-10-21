import {
  Fingerprint,
  Footprints,
  HelpCircle,
  Info,
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
  { id: "fallet", label: "Om fallet", icon: Info },
  { id: "detektiven", label: "Detektiven", icon: Fingerprint },
  { id: "offret", label: "Offret", icon: Skull },
  { id: "de-misstankta", label: "De misstänkta", icon: Users },
  { id: "vittnen", label: "Vittnen", icon: Eye },
  { id: "kartan", label: "Kartan", icon: MapPin },
  { id: "tidslinje", label: "Tidslinje", icon: History },
  { id: "ledtradar", label: "Ledtrådar", icon: Search },
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

// The section id of a location on Kartan (see useMapLocations); each has its
// own hint and skip.
export const mapSectionId = (characterId: string) => `kartan:${characterId}`;

export const INVESTIGATION_SECTIONS = ["kartan", "tidslinje", "evidence"];
