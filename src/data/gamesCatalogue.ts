export type GameCategory = "ALL" | "CARDS" | "REFLEX" | "TACTICS";

export interface GameItem {
  id: string;
  titleEn: string;
  titleKm: string;
  category: "CARDS" | "REFLEX" | "TACTICS";
  categoryLabel: string;
  tag: string;
  rewardWei: number;
  description: string;
  isCardGame?: boolean;
  accentColor: string;
}

export const GAMES_CATALOGUE: GameItem[] = [
  {
    id: "card_flip_duel",
    titleEn: "Flip Cards & Dual Deck",
    titleKm: "ល្បែងបៀបើកផ្គូផ្គង និងប្រយុទ្ធកាត",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "Featured Card Game",
    rewardWei: 500,
    description: "High-speed card flip memory matching with combo multipliers and dual deck card battles.",
    isCardGame: true,
    accentColor: "from-[#ec4899] to-[#be185d]",
  },
  {
    id: "card_solitaire_tripeaks",
    titleEn: "Card Solitaire Tri-Peaks",
    titleKm: "បៀសូលីទែរត្រីកំពូល",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "Card Cascade",
    rewardWei: 750,
    description: "Classic tactile card cascade with rapid ascending and descending sequence clears.",
    isCardGame: true,
    accentColor: "from-[#8b5cf6] to-[#6d28d9]",
  },
  {
    id: "card_road_sign_deck",
    titleEn: "Road Sign Card Deck",
    titleKm: "កាតសញ្ញាចរាចរណ៍កម្ពុជា",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "247 Signs Deck",
    rewardWei: 600,
    description: "Tactical flashcard duel deck matching authentic road sign graphics to defensive driving rules.",
    isCardGame: true,
    accentColor: "from-[#0098ea] to-[#0070aa]",
  },
  {
    id: "lucky_wheel",
    titleEn: "Lucky Wheel of Fortune",
    titleKm: "រង្វង់សំណាងប្រចាំថ្ងៃ",
    category: "TACTICS",
    categoryLabel: "Daily Chance",
    tag: "Daily Spin",
    rewardWei: 2500,
    description: "Daily fortune wheel with multiplier slices, jackpot vaults, and golden ticket respins.",
    accentColor: "from-[#f59e0b] to-[#b45309]",
  },
  {
    id: "word_flash",
    titleEn: "Word Flash Reflex",
    titleKm: "ពាក្យរហ័សឆ្លុះបញ្ចាំង",
    category: "REFLEX",
    categoryLabel: "Speed & Reflex",
    tag: "High Reflex",
    rewardWei: 350,
    description: "Fast reflex recognition of Khmer and English safety and crypto keywords before time expires.",
    accentColor: "from-[#06b6d4] to-[#0e7490]",
  },
  {
    id: "guess_faster",
    titleEn: "Guess Faster Quiz",
    titleKm: "ទាយល្បឿនលឿន",
    category: "REFLEX",
    categoryLabel: "Speed & Reflex",
    tag: "3s Rapid Quiz",
    rewardWei: 400,
    description: "Rapid-fire challenge testing road priority rules, speed regulations, and priority signs.",
    accentColor: "from-[#10b981] to-[#047857]",
  },
  {
    id: "row_5_gomoku",
    titleEn: "Row 5 Gomoku Tactics",
    titleKm: "ហ្គោម៉ូគុ ៥ គ្រាប់យុទ្ធសាស្ត្រ",
    category: "TACTICS",
    categoryLabel: "Tactical Strategy",
    tag: "Board Strategy",
    rewardWei: 600,
    description: "Strategic 5-in-a-row board combat on a digital stone grid against AI and peer players.",
    accentColor: "from-[#6366f1] to-[#4338ca]",
  },
  {
    id: "number_match",
    titleEn: "Number Match Grid",
    titleKm: "ផ្គូផ្គងលេខឡូជីខល",
    category: "REFLEX",
    categoryLabel: "Logic Puzzle",
    tag: "Pattern Solver",
    rewardWei: 300,
    description: "Numerical pattern matching, sliding sum grids, and crypto sequence logic puzzles.",
    accentColor: "from-[#f97316] to-[#c2410c]",
  },
];
