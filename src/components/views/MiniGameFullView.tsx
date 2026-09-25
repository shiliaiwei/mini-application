"use client";

import React, { useState, useEffect } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { gameAudio } from "@/lib/audio/gameAudio";
import {
  WORD_FLASH_POOL,
  GUESS_FASTER_POOL,
  COUNTRY_HINTS_LIST,
  generateChessboardGrid,
  checkRow5Winner,
  getRow5AIMove,
  WordFlashItem,
} from "@/lib/games/wordGames";
import {
  createInitialTicTac,
  makeTicTacMove,
  makeTicTacAIMove,
  calculateTicTacReward,
  TicTacState,
} from "@/lib/games/tictac";
import {
  ChevronLeft,
  Sparkles,
  Timer,
  RefreshCw,
  Coins,
} from "@/components/icons/KeylineIcons";

export type MiniGameType = "wheel" | "word-flash" | "guess-faster" | "row5" | "number-match" | "flip-card";

interface MiniGameFullViewProps {
  game: MiniGameType;
  score: number;
  onAddScore: (amount: number) => void;
  onBack: () => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const MiniGameFullView: React.FC<MiniGameFullViewProps> = ({
  game,
  score,
  onAddScore,
  onBack,
  user,
  tgApp,
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameType>(game);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // GAME 1: 3D TURBINE / LUCKY WHEEL STATE
  // -------------------------------------------------------------
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinHistory, setSpinHistory] = useState<number[]>([]);

  // -------------------------------------------------------------
  // GAME 2: WORD FLASH GRID STATE
  // -------------------------------------------------------------
  const [wordPoolIndex, setWordPoolIndex] = useState(0);
  const [currentWordItem, setCurrentWordItem] = useState<WordFlashItem>(WORD_FLASH_POOL[0]);
  const [isWordVisible, setIsWordVisible] = useState(true);
  const [chessboardTiles, setChessboardTiles] = useState<{ id: number; char: string; isTarget: boolean }[]>([]);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [currentProgress, setCurrentProgress] = useState<string[]>([]);
  const [wordGameWon, setWordGameWon] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // -------------------------------------------------------------
  // GAME 3: GUESS FASTER STATE
  // -------------------------------------------------------------
  const [guessIndex, setGuessIndex] = useState(0);
  const [guessShuffledChars, setGuessShuffledChars] = useState<{ id: number; char: string }[]>([]);
  const [guessTappedIndices, setGuessTappedIndices] = useState<number[]>([]);
  const [guessProgress, setGuessProgress] = useState<string[]>([]);
  const [guessSecondsLeft, setGuessSecondsLeft] = useState(10);
  const [guessWon, setGuessWon] = useState(false);
  const [guessTimeUp, setGuessTimeUp] = useState(false);

  // -------------------------------------------------------------
  // GAME 4: TIC TAC TOE & ROW 5 WINNER STATE
  // -------------------------------------------------------------
  const [subGameType, setSubGameType] = useState<"tictac" | "row5">("tictac");
  const [ticTac, setTicTac] = useState<TicTacState>(() => createInitialTicTac(0));
  const [ticTacClaimed, setTicTacClaimed] = useState(false);
  const ROW5_SIZE = 8;
  const [row5Board, setRow5Board] = useState<(string | null)[]>(() => Array(ROW5_SIZE * ROW5_SIZE).fill(null));
  const [row5Winner, setRow5Winner] = useState<string | null>(null);
  const [row5WinningCells, setRow5WinningCells] = useState<number[]>([]);
  const [row5Claimed, setRow5Claimed] = useState(false);
  const [currentCountryHintIdx, setCurrentCountryHintIdx] = useState(0);

  // -------------------------------------------------------------
  // GAME 5: NUMBER MATCH STATE
  // -------------------------------------------------------------
  const NM_PAIRS = 8; // 8 pairs = 16 tiles
  const generateNMTiles = () => {
    const nums = Array.from({ length: NM_PAIRS }, (_, i) => i + 1);
    const doubled = [...nums, ...nums];
    for (let i = doubled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
    }
    return doubled.map((v, i) => ({ id: i, value: v, matched: false, flipped: false }));
  };
  type NMTile = { id: number; value: number; matched: boolean; flipped: boolean };
  const [nmTiles, setNmTiles] = useState<NMTile[]>(generateNMTiles);
  const [nmSelected, setNmSelected] = useState<number[]>([]);
  const [nmMatched, setNmMatched] = useState(0);
  const [nmLocked, setNmLocked] = useState(false);
  const [nmWon, setNmWon] = useState(false);

  // -------------------------------------------------------------
  // GAME 6: FLIP CARD MEMORY STATE
  // -------------------------------------------------------------
  const FC_SYMBOLS = ["★", "♦", "♠", "♥", "▲", "●", "■", "✿"];
  type FCCard = { id: number; symbol: string; matched: boolean; flipped: boolean };
  const generateFCCards = () => {
    const pairs = [...FC_SYMBOLS, ...FC_SYMBOLS];
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs.map((s, i) => ({ id: i, symbol: s, matched: false, flipped: false }));
  };
  const [fcCards, setFcCards] = useState<FCCard[]>(generateFCCards);
  const [fcSelected, setFcSelected] = useState<number[]>([]);
  const [fcMatched, setFcMatched] = useState(0);
  const [fcLocked, setFcLocked] = useState(false);
  const [fcWon, setFcWon] = useState(false);

  // Track per-game earnings into localStorage for the bar chart
  const GAME_KEY_MAP: Record<MiniGameType, string> = {
    "wheel": "Spin",
    "word-flash": "Word",
    "guess-faster": "Guess",
    "row5": "Row5",
    "number-match": "NMatch",
    "flip-card": "Flip",
  };
  const trackGameEarning = (game: MiniGameType, pts: number) => {
    try {
      const raw = localStorage.getItem("shi_game_breakdown");
      const data: Record<string, number> = raw ? JSON.parse(raw) : {};
      const key = GAME_KEY_MAP[game] || "Other";
      data[key] = (data[key] || 0) + pts;
      localStorage.setItem("shi_game_breakdown", JSON.stringify(data));
    } catch {}
    onAddScore(pts);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync tab with props and trigger style-based game start sound
  useEffect(() => {
    setActiveTab(game);
    gameAudio.playGameStart(game);
  }, [game]);

  // Init Game 2: Word Flash
  const startWordGame = (targetIndex = 0) => {
    const word = WORD_FLASH_POOL[targetIndex % WORD_FLASH_POOL.length];
    setCurrentWordItem(word);
    setIsWordVisible(true);
    setTappedIndices([]);
    setCurrentProgress([]);
    setWordGameWon(false);
    setShakeError(false);
    gameAudio.playGameStart("word-flash");

    const tiles = generateChessboardGrid(word.word);
    setChessboardTiles(tiles);

    setTimeout(() => {
      setIsWordVisible(false);
    }, 3500);
  };

  // Init Game 3: Guess Faster
  const startGuessFaster = (index = 0) => {
    const item = GUESS_FASTER_POOL[index % GUESS_FASTER_POOL.length];
    setGuessIndex(index);
    setGuessTappedIndices([]);
    setGuessProgress([]);
    setGuessWon(false);
    setGuessTimeUp(false);
    setGuessSecondsLeft(10);
    gameAudio.playGameStart("guess-faster");

    const chars = item.word.split("").map((c: string, i: number) => ({ id: i, char: c }));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setGuessShuffledChars(chars);
  };

  // Guess Faster Timer countdown
  useEffect(() => {
    if (activeTab !== "guess-faster" || guessWon || guessTimeUp) return;
    if (guessSecondsLeft <= 0) {
      setGuessTimeUp(true);
      gameAudio.playWrong();
      return;
    }
    const timer = setInterval(() => {
      setGuessSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGuessTimeUp(true);
          gameAudio.playWrong();
          return 0;
        }
        gameAudio.playClockTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, guessWon, guessTimeUp, guessSecondsLeft]);

  // Init Game 4: Tic Tac
  const startTicTac = () => {
    setTicTac(createInitialTicTac(0));
    setTicTacClaimed(false);
  };

  // Init Game 4: Row 5
  const startRow5 = () => {
    setRow5Board(Array(ROW5_SIZE * ROW5_SIZE).fill(null));
    setRow5Winner(null);
    setRow5WinningCells([]);
    setRow5Claimed(false);
    setCurrentCountryHintIdx((prev) => (prev + 1) % COUNTRY_HINTS_LIST.length);
  };

  // Init Game 5: Number Match
  const startNumberMatch = () => {
    setNmTiles(generateNMTiles());
    setNmSelected([]);
    setNmMatched(0);
    setNmLocked(false);
    setNmWon(false);
    gameAudio.playGameStart("number-match" as MiniGameType);
  };

  // Init Game 6: Flip Card
  const startFlipCard = () => {
    setFcCards(generateFCCards());
    setFcSelected([]);
    setFcMatched(0);
    setFcLocked(false);
    setFcWon(false);
    gameAudio.playGameStart("flip-card" as MiniGameType);
  };

  // Lifecycle on mount / tab change
  useEffect(() => {
    if (activeTab === "word-flash") {
      startWordGame(0);
    } else if (activeTab === "guess-faster") {
      startGuessFaster(0);
    } else if (activeTab === "row5") {
      startTicTac();
    } else if (activeTab === "number-match") {
      startNumberMatch();
    } else if (activeTab === "flip-card") {
      startFlipCard();
    }
  }, [activeTab]);

  // -------------------------------------------------------------
  // WHEEL ACTIONS
  // -------------------------------------------------------------
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    gameAudio.playWheelSpin();
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}

    setWheelSpinning(true);
    setWheelResult(null);

    const rewards = [50, 100, 150, 200, 300, 500];
    const pickedReward = rewards[Math.floor(Math.random() * rewards.length)];
    const additionalDeg = 1440 + Math.floor(Math.random() * 360);
    const newRot = wheelRotation + additionalDeg;
    setWheelRotation(newRot);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(pickedReward);
      setSpinHistory((prev) => [pickedReward, ...prev.slice(0, 4)]);
      trackGameEarning("wheel", pickedReward);
      gameAudio.playVictory();
      showToast(`Won +${pickedReward} Vault Points!`);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 3800);
  };

  // -------------------------------------------------------------
  // WORD FLASH ACTIONS
  // -------------------------------------------------------------
  const handleWordTileTap = (tileIndex: number) => {
    if (wordGameWon || isWordVisible || tappedIndices.includes(tileIndex)) return;
    const tile = chessboardTiles[tileIndex];
    const targetWord = currentWordItem.word;
    const expectedChar = targetWord[currentProgress.length];

    if (tile.char === expectedChar) {
      gameAudio.playTap();
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}

      const nextProg = [...currentProgress, tile.char];
      setCurrentProgress(nextProg);
      setTappedIndices([...tappedIndices, tileIndex]);

      if (nextProg.length === targetWord.length) {
        setWordGameWon(true);
        const reward = currentWordItem.charCount;
        trackGameEarning("word-flash", reward);
        gameAudio.playVictory();
        showToast(`Solved "${targetWord}"! Claimed +${reward} PTS!`);
        try {
          tgApp?.HapticFeedback?.notificationOccurred("success");
        } catch {}
      }
    } else {
      gameAudio.playWrong();
      try {
        tgApp?.HapticFeedback?.notificationOccurred("error");
      } catch {}
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  // -------------------------------------------------------------
  // GUESS FASTER ACTIONS
  // -------------------------------------------------------------
  const handleGuessCharTap = (charObj: { id: number; char: string }, idx: number) => {
    if (guessWon || guessTimeUp || guessTappedIndices.includes(idx)) return;
    const item = GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length];
    const nextProg = [...guessProgress, charObj.char];
    const nextTapped = [...guessTappedIndices, idx];

    gameAudio.playTap();
    setGuessProgress(nextProg);
    setGuessTappedIndices(nextTapped);

    if (nextProg.join("") === item.word) {
      setGuessWon(true);
      const reward = item.points;
      trackGameEarning("guess-faster", reward);
      gameAudio.playVictory();
      showToast(`Faster! Claimed +${reward} PTS!`);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    } else if (nextProg.length === item.word.length) {
      gameAudio.playWrong();
      showToast("Incorrect combination. Try again!");
      setTimeout(() => {
        setGuessProgress([]);
        setGuessTappedIndices([]);
      }, 500);
    }
  };

  // -------------------------------------------------------------
  // TIC TAC ACTIONS
  // -------------------------------------------------------------
  const handleTicTacCellClick = (idx: number) => {
    if (ticTac.board[idx] || ticTac.winner || ticTacClaimed) return;
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}

    const playerMoveState = makeTicTacMove(ticTac, idx);
    setTicTac(playerMoveState);

    if (playerMoveState.winner === "X" && !ticTacClaimed) {
      setTicTacClaimed(true);
      const reward = calculateTicTacReward(playerMoveState);
      trackGameEarning("row5", reward);
      gameAudio.playVictory();
      showToast(`Tic Tac Victory! +${reward} PTS Claimed!`);
      return;
    }

    if (!playerMoveState.winner && !playerMoveState.isDraw) {
      setTimeout(() => {
        const aiMoveState = makeTicTacAIMove(playerMoveState);
        setTicTac(aiMoveState);
        if (aiMoveState.winner === "O") {
          gameAudio.playWrong();
        }
      }, 300);
    }
  };

  // -------------------------------------------------------------
  // ROW 5 ACTIONS
  // -------------------------------------------------------------
  const handleRow5CellClick = (idx: number) => {
    if (row5Board[idx] || row5Winner || row5Claimed) return;
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}

    const updated = [...row5Board];
    updated[idx] = "X";
    const winCheck = checkRow5Winner(updated, ROW5_SIZE);
    setRow5Board(updated);

    if (winCheck.winner === "X" && !row5Claimed) {
      setRow5Winner("X");
      setRow5WinningCells(winCheck.winningCells);
      setRow5Claimed(true);
      trackGameEarning("row5", 25);
      gameAudio.playVictory();
      showToast("Row 5 Champion! +25 PTS Claimed!");
      return;
    }

    setTimeout(() => {
      const aiIdx = getRow5AIMove(updated, ROW5_SIZE);
      if (aiIdx !== null) {
        updated[aiIdx] = "O";
        const aiWinCheck = checkRow5Winner(updated, ROW5_SIZE);
        setRow5Board([...updated]);
        if (aiWinCheck.winner) {
          setRow5Winner(aiWinCheck.winner);
          setRow5WinningCells(aiWinCheck.winningCells);
          if (aiWinCheck.winner === "O") {
            gameAudio.playWrong();
          }
        }
      }
    }, 250);
  };

  // -------------------------------------------------------------
  // NUMBER MATCH ACTIONS
  // -------------------------------------------------------------
  const handleNMTileTap = (idx: number) => {
    if (nmLocked || nmTiles[idx].matched || nmTiles[idx].flipped) return;
    gameAudio.playTap();
    try { tgApp?.HapticFeedback?.impactOccurred("light"); } catch {}

    const newTiles = nmTiles.map((t, i) => i === idx ? { ...t, flipped: true } : t);
    const newSelected = [...nmSelected, idx];
    setNmTiles(newTiles);
    setNmSelected(newSelected);

    if (newSelected.length === 2) {
      setNmLocked(true);
      const [a, b] = newSelected;
      if (newTiles[a].value === newTiles[b].value) {
        // Match!
        const matched = newTiles.map((t, i) =>
          i === a || i === b ? { ...t, matched: true } : t
        );
        setNmTiles(matched);
        setNmSelected([]);
        setNmLocked(false);
        const newCount = nmMatched + 1;
        setNmMatched(newCount);
        gameAudio.playVictory();
        if (newCount === NM_PAIRS) {
          setNmWon(true);
          trackGameEarning("number-match", 50);
          showToast("Number Match Complete! +50 PTS Claimed!");
          try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
        }
      } else {
        // No match — flip back after 900ms
        gameAudio.playWrong();
        setTimeout(() => {
          setNmTiles(prev => prev.map((t, i) =>
            i === a || i === b ? { ...t, flipped: false } : t
          ));
          setNmSelected([]);
          setNmLocked(false);
        }, 900);
      }
    }
  };

  // -------------------------------------------------------------
  // FLIP CARD ACTIONS
  // -------------------------------------------------------------
  const handleFCCardTap = (idx: number) => {
    if (fcLocked || fcCards[idx].matched || fcCards[idx].flipped) return;
    gameAudio.playTap();
    try { tgApp?.HapticFeedback?.impactOccurred("light"); } catch {}

    const newCards = fcCards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newSelected = [...fcSelected, idx];
    setFcCards(newCards);
    setFcSelected(newSelected);

    if (newSelected.length === 2) {
      setFcLocked(true);
      const [a, b] = newSelected;
      if (newCards[a].symbol === newCards[b].symbol) {
        const matched = newCards.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        );
        setFcCards(matched);
        setFcSelected([]);
        setFcLocked(false);
        const newCount = fcMatched + 1;
        setFcMatched(newCount);
        gameAudio.playVictory();
        if (newCount === FC_SYMBOLS.length) {
          setFcWon(true);
          trackGameEarning("flip-card", 60);
          showToast("Flip Card Master! +60 PTS Claimed!");
          try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
        }
      } else {
        gameAudio.playWrong();
        setTimeout(() => {
          setFcCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setFcSelected([]);
          setFcLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-2 px-3 sm:px-4 max-w-xl mx-auto font-sans select-none animate-fadeIn">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0098ea] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center gap-2 animate-fadeIn max-w-[90vw] truncate">
          <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Back Button + Game Title + Points Badge */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-3.5">
        <button
          type="button"
          onClick={() => {
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} className="text-[#0098ea]" />
          <span>Back</span>
        </button>

        {/* Brand & Active Game Name */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <ShiliaiweiBrand variant="mark" height={12} colorScheme="blue" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              SHILIAIWEI SPA
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            {activeTab === "wheel" && "Daily Spin Wheel"}
            {activeTab === "word-flash" && "Word Flash Memory"}
            {activeTab === "guess-faster" && "Guess Faster Challenge"}
            {activeTab === "row5" && "Row 5 & Tic Tac"}
            {activeTab === "number-match" && "Number Match"}
            {activeTab === "flip-card" && "Flip Card Memory"}
          </h1>
        </div>

        {/* Live Score Display */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0098ea] font-extrabold text-xs shadow-2xs">
          <Coins size={14} />
          <span>{score.toLocaleString()}</span>
        </div>
      </div>

      {/* TOP TAB SWITCHER: Direct SPA Links to all 6 games (2 rows x 3) */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-2xl text-center">
          {([
            { key: "wheel", label: "Daily Spin" },
            { key: "word-flash", label: "Word Flash" },
            { key: "guess-faster", label: "Guess Faster" },
          ] as { key: MiniGameType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); gameAudio.playGameStart(key); }}
              className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                activeTab === key ? "bg-white text-[#0098ea] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-2xl text-center">
          {([
            { key: "row5", label: "Row 5" },
            { key: "number-match", label: "Num Match" },
            { key: "flip-card", label: "Flip Card" },
          ] as { key: MiniGameType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); gameAudio.playGameStart(key); }}
              className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                activeTab === key ? "bg-white text-[#0098ea] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. FULL PAGE: DAILY SPIN WHEEL                          */}
      {/* ======================================================== */}
      {activeTab === "wheel" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-center space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
              LUCKY FORTUNE TURBINE
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Spin daily to win guaranteed Vault points and reward multipliers.
            </p>
          </div>

          {/* 3D Wheel SVG */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <div
              className="w-full h-full transition-transform duration-[3800ms] ease-out"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xl">
                <circle cx="50" cy="50" r="46" fill="#ffd166" stroke="#f4a261" strokeWidth="3" />
                <path d="M50 50 L50 4 A46 46 0 0 1 82 17 Z" fill="#0088cc" />
                <path d="M50 50 L82 17 A46 46 0 0 1 96 50 Z" fill="#7209b7" />
                <path d="M50 50 L96 50 A46 46 0 0 1 82 83 Z" fill="#00b4d8" />
                <path d="M50 50 L82 83 A46 46 0 0 1 50 96 Z" fill="#f72585" />
                <path d="M50 50 L50 96 A46 46 0 0 1 18 83 Z" fill="#4361ee" />
                <path d="M50 50 L18 83 A46 46 0 0 1 4 50 Z" fill="#e76f51" />
                <path d="M50 50 L4 50 A46 46 0 0 1 18 17 Z" fill="#2a9d8f" />
                <path d="M50 50 L18 17 A46 46 0 0 1 50 4 Z" fill="#f4a261" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#f4a261" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="8" fill="#ffd166" />
              </svg>
            </div>
            {/* Top Indicator Arrow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-4 h-5 bg-rose-600 clip-triangle shadow-md" />
            </div>
          </div>

          {/* Reward Display */}
          {wheelResult !== null && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fadeIn">
              <span className="text-xs font-bold text-emerald-800 block">
                Congratulations! Won +{wheelResult} PTS!
              </span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={wheelSpinning}
            onClick={handleSpinWheel}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all cursor-pointer ${
              wheelSpinning
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0088cc] via-[#0098ea] to-[#00a8ff] text-white active:scale-98 shadow-blue-500/25"
            }`}
          >
            {wheelSpinning ? "Spinning..." : "SPIN LUCKY WHEEL"}
          </button>

          {/* Spin Rewards History */}
          {spinHistory.length > 0 && (
            <div className="pt-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recent Rewards
              </span>
              <div className="flex items-center gap-2">
                {spinHistory.map((pts, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200"
                  >
                    +{pts} PTS
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FULL PAGE: WORD FLASH MEMORY CHESSBOARD GRID          */}
      {/* ======================================================== */}
      {activeTab === "word-flash" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                WORD FLASH • 4x4 CHESSBOARD
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Remember target word, then tap letters in correct sequence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextIdx = wordPoolIndex + 1;
                setWordPoolIndex(nextIdx);
                startWordGame(nextIdx);
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="New Word"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Flash Clue Box */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/70 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0098ea] block mb-1">
              Category: {currentWordItem.category} ({currentWordItem.charCount} Letters)
            </span>
            <div className="min-h-[38px] flex items-center justify-center">
              {isWordVisible ? (
                <span className="text-2xl font-black tracking-widest text-slate-900 animate-pulse">
                  {currentWordItem.word}
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  {currentWordItem.word.split("").map((_, i) => (
                    <span
                      key={i}
                      className={`w-7 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border ${
                        currentProgress[i]
                          ? "bg-[#0098ea] text-white border-blue-600"
                          : "bg-white text-slate-400 border-dashed border-slate-300"
                      }`}
                    >
                      {currentProgress[i] || "_"}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Tap all {currentWordItem.charCount} letters in exact order on the chessboard!
            </p>
          </div>

          {/* 4x4 Chessboard Grid */}
          <div
            className={`grid grid-cols-4 gap-2 max-w-[280px] mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200 ${
              shakeError ? "animate-shake" : ""
            }`}
          >
            {chessboardTiles.map((tile, idx) => {
              const isTapped = tappedIndices.includes(idx);
              const isDarkSquare = (Math.floor(idx / 4) + (idx % 4)) % 2 === 1;
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isTapped || wordGameWon || isWordVisible}
                  onClick={() => handleWordTileTap(idx)}
                  className={`aspect-square rounded-xl font-mono text-base font-black flex items-center justify-center border transition-all cursor-pointer ${
                    isTapped
                      ? "bg-slate-200 text-slate-400 border-slate-300 opacity-60"
                      : isDarkSquare
                      ? "bg-white text-slate-900 border-slate-300 hover:bg-sky-50 active:scale-95"
                      : "bg-sky-50/80 text-sky-950 border-sky-200 hover:bg-sky-100 active:scale-95"
                  }`}
                >
                  {tile.char}
                </button>
              );
            })}
          </div>

          {/* Victory & Next Word */}
          {wordGameWon && (
            <div className="text-center space-y-2 pt-2 animate-fadeIn">
              <span className="text-sm font-black text-emerald-600 block">
                Solved! +{currentWordItem.charCount} Points Claimed!
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextIdx = wordPoolIndex + 1;
                  setWordPoolIndex(nextIdx);
                  startWordGame(nextIdx);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#0098ea] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                NEXT WORD PUZZLE
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FULL PAGE: GUESS FASTER SPEED CHALLENGE               */}
      {/* ======================================================== */}
      {activeTab === "guess-faster" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          {/* Header with Timer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                SPEED CLUE CHALLENGE
              </span>
              <h2 className="text-base font-black text-slate-900">Guess Faster</h2>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs border ${
                guessSecondsLeft <= 3
                  ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Timer size={14} />
              <span>{guessSecondsLeft}s</span>
            </div>
          </div>

          {/* Clue Prompt */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
              Clue #{guessIndex + 1} • {GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].points} Points
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
              {GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].clue}
            </p>
          </div>

          {/* Answer Preview Slots */}
          <div className="flex items-center justify-center gap-1.5 min-h-[44px]">
            {GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word
              .split("")
              .map((_: string, i: number) => (
                <div
                  key={i}
                  className={`w-9 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base border ${
                    guessProgress[i]
                      ? "bg-[#0098ea] text-white border-blue-600"
                      : "bg-slate-50 text-slate-300 border-dashed border-slate-300"
                  }`}
                >
                  {guessProgress[i] || ""}
                </div>
              ))}
          </div>

          {/* Scrambled Character Buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {guessShuffledChars.map((charObj, idx) => {
              const isTapped = guessTappedIndices.includes(idx);
              return (
                <button
                  key={charObj.id}
                  type="button"
                  disabled={isTapped || guessWon || guessTimeUp}
                  onClick={() => handleGuessCharTap(charObj, idx)}
                  className={`w-11 h-12 rounded-xl font-mono text-base font-black border transition-all cursor-pointer ${
                    isTapped
                      ? "bg-slate-100 text-slate-300 border-slate-200 opacity-50"
                      : "bg-white text-slate-800 border-slate-200 shadow-2xs hover:bg-sky-50 active:scale-95"
                  }`}
                >
                  {charObj.char}
                </button>
              );
            })}
          </div>

          {/* Outcome & Advance */}
          {guessWon && (
            <div className="text-center space-y-2 pt-2 animate-fadeIn">
              <span className="text-sm font-black text-emerald-600 block">
                Solved in Time! +{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].points} PTS Claimed!
              </span>
              <button
                type="button"
                onClick={() => startGuessFaster(guessIndex + 1)}
                className="px-5 py-2.5 rounded-2xl bg-[#0098ea] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                NEXT CLUE CHALLENGE
              </button>
            </div>
          )}

          {guessTimeUp && !guessWon && (
            <div className="text-center space-y-2 pt-2 animate-fadeIn">
              <span className="text-xs font-black text-rose-600 block">
                Time Expired! The word was "{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word}".
              </span>
              <button
                type="button"
                onClick={() => startGuessFaster(guessIndex)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs active:scale-95 cursor-pointer"
              >
                RETRY PUZZLE
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FULL PAGE: ROW 5 WINNER & TIC TAC TOE STRATEGY         */}
      {/* ======================================================== */}
      {activeTab === "row5" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          {/* Subgame Mode Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                STRATEGY AI BATTLE
              </span>
              <h2 className="text-base font-black text-slate-900">
                {subGameType === "tictac" ? "3x3 Tic Tac Toe" : "8x8 Row 5 Gomoku"}
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSubGameType("tictac");
                  startTicTac();
                }}
                className={`text-xs font-extrabold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  subGameType === "tictac"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                3x3 Grid
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubGameType("row5");
                  startRow5();
                }}
                className={`text-xs font-extrabold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  subGameType === "row5"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Row 5
              </button>
            </div>
          </div>

          {/* Cambodia Clue Hint */}
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-left">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#0098ea] block">
              Cambodia Cultural Clue • {COUNTRY_HINTS_LIST[currentCountryHintIdx].country}
            </span>
            <p className="text-xs font-medium text-slate-700 leading-snug mt-0.5">
              {COUNTRY_HINTS_LIST[currentCountryHintIdx].hint}
            </p>
          </div>

          {/* 3x3 Tic Tac Board */}
          {subGameType === "tictac" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5 w-64 h-64 mx-auto p-2.5 rounded-3xl bg-slate-100 border border-slate-200 shadow-inner">
                {ticTac.board.map((cell, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!!cell || !!ticTac.winner}
                    onClick={() => handleTicTacCellClick(idx)}
                    className={`rounded-2xl font-mono text-2xl font-black flex items-center justify-center border transition-all cursor-pointer ${
                      cell === "X"
                        ? "bg-[#0098ea] text-white border-blue-600 shadow-sm"
                        : cell === "O"
                        ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-sky-50 active:scale-95"
                    }`}
                  >
                    {cell}
                  </button>
                ))}
              </div>

              {(ticTac.winner || ticTac.isDraw) && (
                <div className="text-center space-y-2 pt-1 animate-fadeIn">
                  <span className="text-sm font-black text-slate-900 block">
                    {ticTac.winner === "X"
                      ? "Victory! Points Claimed!"
                      : ticTac.isDraw
                      ? "Match Drawn!"
                      : "AI Wins Round!"}
                  </span>
                  <button
                    type="button"
                    onClick={startTicTac}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs active:scale-95 cursor-pointer"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8x8 Row 5 Board */}
          {subGameType === "row5" && (
            <div className="space-y-3">
              <div className="grid grid-cols-8 gap-1 p-2 rounded-3xl bg-slate-100 border border-slate-200 max-w-[320px] mx-auto aspect-square shadow-inner">
                {row5Board.map((cell, idx) => {
                  const isWinning = row5WinningCells.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!cell || !!row5Winner}
                      onClick={() => handleRow5CellClick(idx)}
                      className={`rounded-lg font-mono text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${
                        isWinning
                          ? "bg-emerald-500 text-white border-emerald-600 animate-pulse shadow-sm"
                          : cell === "X"
                          ? "bg-[#0098ea] text-white border-blue-600"
                          : cell === "O"
                          ? "bg-rose-500 text-white border-rose-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-sky-50 active:scale-90"
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>

              {row5Winner && (
                <div className="text-center space-y-2 pt-1 animate-fadeIn">
                  <span className="text-sm font-black text-slate-900 block">
                    {row5Winner === "X" ? "Row 5 Champion! +25 PTS Claimed!" : "AI Connected 5 in a Row!"}
                  </span>
                  <button
                    type="button"
                    onClick={startRow5}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs active:scale-95 cursor-pointer"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FULL PAGE: NUMBER MATCH                               */}
      {/* ======================================================== */}
      {activeTab === "number-match" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                PAIR MEMORY GRID
              </span>
              <h2 className="text-base font-black text-slate-900">Number Match</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{nmMatched}/{NM_PAIRS} pairs</span>
              <button
                type="button"
                onClick={startNumberMatch}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Tap tiles to reveal numbers. Match all 8 pairs to claim +50 PTS.
          </p>

          {/* 4x4 Number Grid */}
          <div className="grid grid-cols-4 gap-2 max-w-[300px] mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200">
            {nmTiles.map((tile, idx) => (
              <button
                key={tile.id}
                type="button"
                disabled={tile.matched || nmLocked}
                onClick={() => handleNMTileTap(idx)}
                className={`aspect-square rounded-xl font-mono text-base font-black flex items-center justify-center border transition-all cursor-pointer ${
                  tile.matched
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                    : tile.flipped
                    ? "bg-[#0098ea] text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-300 border-slate-200 hover:bg-sky-50 active:scale-95"
                }`}
              >
                {tile.flipped || tile.matched ? tile.value : "?"}
              </button>
            ))}
          </div>

          {nmWon && (
            <div className="text-center space-y-2 pt-1 animate-fadeIn">
              <span className="text-sm font-black text-emerald-600 block">All Pairs Found! +50 PTS Claimed!</span>
              <button
                type="button"
                onClick={startNumberMatch}
                className="px-5 py-2.5 rounded-2xl bg-[#0098ea] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FULL PAGE: FLIP CARD MEMORY                           */}
      {/* ======================================================== */}
      {activeTab === "flip-card" && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                SYMBOL PAIR FLIP
              </span>
              <h2 className="text-base font-black text-slate-900">Flip Card Memory</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{fcMatched}/{FC_SYMBOLS.length} pairs</span>
              <button
                type="button"
                onClick={startFlipCard}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Flip cards to find matching symbol pairs. Complete all 8 pairs to claim +60 PTS.
          </p>

          {/* 4x4 Flip Card Grid */}
          <div className="grid grid-cols-4 gap-2 max-w-[300px] mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200">
            {fcCards.map((card, idx) => (
              <button
                key={card.id}
                type="button"
                disabled={card.matched || fcLocked}
                onClick={() => handleFCCardTap(idx)}
                className={`aspect-square rounded-xl text-xl font-black flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                  card.matched
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                    : card.flipped
                    ? "bg-[#0098ea] text-white border-blue-600 shadow-sm scale-105"
                    : "bg-gradient-to-br from-slate-700 to-slate-900 text-slate-700 border-slate-600 hover:from-slate-600 active:scale-95"
                }`}
              >
                {card.flipped || card.matched ? card.symbol : ""}
              </button>
            ))}
          </div>

          {fcWon && (
            <div className="text-center space-y-2 pt-1 animate-fadeIn">
              <span className="text-sm font-black text-emerald-600 block">Memory Master! +60 PTS Claimed!</span>
              <button
                type="button"
                onClick={startFlipCard}
                className="px-5 py-2.5 rounded-2xl bg-[#0098ea] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM ACTION BAR: Clean back to home */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            onBack();
          }}
          className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs shadow-2xs active:scale-98 transition-all cursor-pointer"
        >
          Exit to Home View
        </button>
      </div>
    </div>
  );
};
