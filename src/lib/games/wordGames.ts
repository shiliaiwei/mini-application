// Word Games & Five-in-a-Row Logic for Shiliaiwei Claim Points System

export interface WordFlashItem {
  word: string;
  category: string;
  charCount: number;
}

export const WORD_FLASH_POOL: WordFlashItem[] = [
  // 2 characters
  { word: "GO", category: "Action", charCount: 2 },
  { word: "UP", category: "Motion", charCount: 2 },
  { word: "ON", category: "State", charCount: 2 },
  { word: "HI", category: "Greeting", charCount: 2 },
  // 3 characters
  { word: "WIN", category: "Gaming", charCount: 3 },
  { word: "TON", category: "Crypto", charCount: 3 },
  { word: "YOU", category: "Player", charCount: 3 },
  { word: "GEM", category: "Reward", charCount: 3 },
  { word: "RUN", category: "Action", charCount: 3 },
  // 4 characters
  { word: "GOLD", category: "Treasure", charCount: 4 },
  { word: "COIN", category: "Points", charCount: 4 },
  { word: "MINE", category: "Mining", charCount: 4 },
  { word: "FAST", category: "Speed", charCount: 4 },
  { word: "RIEL", category: "Currency", charCount: 4 },
  { word: "SAFE", category: "Security", charCount: 4 },
  // 5 characters
  { word: "VAULT", category: "Web3 Safe", charCount: 5 },
  { word: "POINT", category: "Reward", charCount: 5 },
  { word: "POWER", category: "Boost", charCount: 5 },
  { word: "LUCKY", category: "Fortune", charCount: 5 },
  { word: "SMART", category: "Skills", charCount: 5 },
  // 6 characters
  { word: "CRYPTO", category: "Blockchain", charCount: 6 },
  { word: "REWARD", category: "Points", charCount: 6 },
  { word: "ENERGY", category: "Vitality", charCount: 6 },
  { word: "MINING", category: "Harvest", charCount: 6 },
  // 7 characters
  { word: "BALANCE", category: "Finance", charCount: 7 },
  { word: "DIAMOND", category: "Gemstone", charCount: 7 },
  { word: "DYNAMIC", category: "Energy", charCount: 7 },
  // 8 characters
  { word: "CAMBODIA", category: "Country", charCount: 8 },
  { word: "PLATINUM", category: "Prestige", charCount: 8 },
  { word: "CHAMPION", category: "Winner", charCount: 8 },
  { word: "TREASURE", category: "Fortune", charCount: 8 },
];

export interface GuessFasterItem {
  id: string;
  clue: string;
  word: string;
  points: number;
}

export const GUESS_FASTER_POOL: GuessFasterItem[] = [
  { id: "gf1", clue: "The person playing this mini app right now", word: "YOU", points: 5 },
  { id: "gf2", clue: "National currency of the Kingdom of Cambodia", word: "RIEL", points: 8 },
  { id: "gf3", clue: "The native blockchain ecosystem of Telegram", word: "TON", points: 6 },
  { id: "gf4", clue: "Secure digital safe storing your points", word: "VAULT", points: 10 },
  { id: "gf5", clue: "To score a victory in a challenge", word: "WIN", points: 5 },
  { id: "gf6", clue: "Precious blue or gold crystal reward", word: "GEM", points: 6 },
  { id: "gf7", clue: "Moving at maximum velocity without delay", word: "FAST", points: 7 },
  { id: "gf8", clue: "Kingdom of Wonder in Southeast Asia", word: "CAMBODIA", points: 15 },
];

export interface CountryHint {
  country: string;
  hint: string;
  bonusWord: string;
}

export const COUNTRY_HINTS_LIST: CountryHint[] = [
  {
    country: "CAMBODIA",
    hint: "Kingdom of Wonder in Southeast Asia, home to Angkor Wat and the Mekong River",
    bonusWord: "CAMBODIA",
  },
  {
    country: "CAMBODIA (PHNOM PENH)",
    hint: "Capital city of Cambodia situated at the confluence of four river branches",
    bonusWord: "PHNOMPENH",
  },
  {
    country: "CAMBODIA (ANGKOR)",
    hint: "World-famous UNESCO heritage ancient stone temple city in Siem Reap, Cambodia",
    bonusWord: "ANGKOR",
  },
  {
    country: "CAMBODIA (KULEN)",
    hint: "Sacred mountain range and national park in Siem Reap province, Cambodia",
    bonusWord: "KULEN",
  },
  {
    country: "CAMBODIA (KAMPOT)",
    hint: "Coastal river province famous for world-renowned pepper and Bokor mountain",
    bonusWord: "KAMPOT",
  },
];

// Helper to generate a 4x4 chessboard grid (16 tiles) containing target word characters + random distractors
export function generateChessboardGrid(targetWord: string, totalTiles: number = 16): { id: number; char: string; isTarget: boolean }[] {
  const letters = targetWord.toUpperCase().split("");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const tiles: { id: number; char: string; isTarget: boolean }[] = [];

  // Add target characters
  letters.forEach((char, i) => {
    tiles.push({ id: i, char, isTarget: true });
  });

  // Fill remaining slots with random letters
  while (tiles.length < totalTiles) {
    const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
    tiles.push({ id: tiles.length, char: randomChar, isTarget: false });
  }

  // Shuffle tiles (Fisher-Yates)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Re-index after shuffle
  return tiles.map((t, idx) => ({ ...t, id: idx }));
}

// 5-in-a-Row (Row 5 Winner / Gomoku) Checker on NxN grid
export function checkRow5Winner(
  board: (string | null)[],
  size: number = 8
): { winner: string | null; winningCells: number[] } {
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal down-right
    [1, -1], // Diagonal down-left
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      const player = board[idx];
      if (!player) continue;

      for (const [dr, dc] of directions) {
        const winningCells = [idx];
        let hasFive = true;

        for (let step = 1; step < 5; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
            hasFive = false;
            break;
          }
          const nIdx = nr * size + nc;
          if (board[nIdx] !== player) {
            hasFive = false;
            break;
          }
          winningCells.push(nIdx);
        }

        if (hasFive) {
          return { winner: player, winningCells };
        }
      }
    }
  }

  return { winner: null, winningCells: [] };
}

// Smart AI move for 5-in-a-row
export function getRow5AIMove(board: (string | null)[], size: number = 8): number | null {
  const emptyIndices: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) return null;

  // 1. Check if AI can win in 1 move
  for (const idx of emptyIndices) {
    board[idx] = "O";
    const winCheck = checkRow5Winner(board, size);
    board[idx] = null;
    if (winCheck.winner === "O") return idx;
  }

  // 2. Check if Human (X) has 4 in a row and block it
  for (const idx of emptyIndices) {
    board[idx] = "X";
    const winCheck = checkRow5Winner(board, size);
    board[idx] = null;
    if (winCheck.winner === "X") return idx;
  }

  // 3. Prefer center-adjacent tiles
  const centerR = Math.floor(size / 2);
  const centerC = Math.floor(size / 2);
  emptyIndices.sort((a, b) => {
    const ar = Math.floor(a / size);
    const ac = a % size;
    const br = Math.floor(b / size);
    const bc = b % size;
    const distA = Math.hypot(ar - centerR, ac - centerC);
    const distB = Math.hypot(br - centerR, bc - centerC);
    return distA - distB;
  });

  return emptyIndices[0];
}
