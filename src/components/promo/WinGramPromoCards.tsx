"use client";

import React, { useState, useEffect } from "react";
import { TelegramWebApp } from "@/types/telegram";
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
  ChevronRight,
  Sparkles,
  Check,
  X,
  Timer,
  RefreshCw,
  Zap,
} from "@/components/icons/KeylineIcons";

interface WinGramPromoCardsProps {
  onAddScore: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenTapVault?: () => void;
  tgApp: TelegramWebApp | null;
}

type ActiveGameModal = "none" | "wheel" | "word-flash" | "guess-faster" | "row5";

export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  onAddScore,
  onOpenDeposit,
  onOpenTapVault,
  tgApp,
}) => {
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeGameModal, setActiveGameModal] = useState<ActiveGameModal>("none");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [claimedHero, setClaimedHero] = useState(false);

  // -------------------------------------------------------------
  // GAME 1: 3D TURBINE / LUCKY WHEEL MODAL STATE
  // -------------------------------------------------------------
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // -------------------------------------------------------------
  // GAME 2: WORD FLASH GRID STATE
  // -------------------------------------------------------------
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

  const heroSlides = [
    {
      title: "Sports Free Bet $1,000",
      reward: 1000,
      badge: "HOT PROMO",
    },
    {
      title: "Vault Bonus up to $2,500",
      reward: 2500,
      badge: "VIP VAULT",
    },
    {
      title: "Daily Yield up to 15%",
      reward: 1500,
      badge: "EXCLUSIVE",
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHeroClick = () => {
    gameAudio.playTap();
    if (claimedHero) {
      if (onOpenTapVault) {
        onOpenTapVault();
      } else {
        showToast("Bonus already claimed! Tap Vault is active.");
      }
      return;
    }
    const amount = heroSlides[heroSlide].reward;
    onAddScore(amount);
    setClaimedHero(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    showToast(`Bonus Claimed! +${amount.toLocaleString()} PTS added!`);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setHeroSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setHeroSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  // --- Wheel Handlers ---
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const prizeValues = [100, 250, 50, 500, 150, 1000, 200, 300];
    const randomIndex = Math.floor(Math.random() * prizeValues.length);
    const wonPrize = prizeValues[randomIndex];

    const sectorAngle = 360 / prizeValues.length;
    const targetDeg = 1800 + randomIndex * sectorAngle + sectorAngle / 2;

    setWheelRotation((prev) => prev + targetDeg);
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.impactOccurred("heavy");
    } catch {}

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(wonPrize);
      onAddScore(wonPrize);
      gameAudio.playVictory();
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 3200);
  };

  // --- Word Flash Handlers ---
  const startWordGame = (item?: WordFlashItem) => {
    const target = item || WORD_FLASH_POOL[Math.floor(Math.random() * WORD_FLASH_POOL.length)];
    setCurrentWordItem(target);
    setIsWordVisible(true);
    setTappedIndices([]);
    setCurrentProgress([]);
    setWordGameWon(false);
    setShakeError(false);
    setChessboardTiles(generateChessboardGrid(target.word, 16));

    const flashTimer = setTimeout(() => {
      setIsWordVisible(false);
    }, 1500);

    return () => clearTimeout(flashTimer);
  };

  const handleTileTap = (tileId: number, char: string) => {
    if (wordGameWon || isWordVisible) return;
    if (tappedIndices.includes(tileId)) return;

    const nextCharIndex = currentProgress.length;
    const expectedChar = currentWordItem.word[nextCharIndex];

    if (char === expectedChar) {
      gameAudio.playCorrectChar();
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}

      const newProgress = [...currentProgress, char];
      const newTapped = [...tappedIndices, tileId];
      setCurrentProgress(newProgress);
      setTappedIndices(newTapped);

      onAddScore(1);

      if (newProgress.length === currentWordItem.word.length) {
        setWordGameWon(true);
        gameAudio.playWordComplete();
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
      setTimeout(() => setShakeError(false), 400);
    }
  };

  // --- Guess Faster Handlers ---
  const startGuessFaster = (idx: number = 0) => {
    const item = GUESS_FASTER_POOL[idx % GUESS_FASTER_POOL.length];
    setGuessIndex(idx);
    setGuessTappedIndices([]);
    setGuessProgress([]);
    setGuessWon(false);
    setGuessTimeUp(false);
    setGuessSecondsLeft(10);

    const chars = item.word.split("").map((c, i) => ({ id: i, char: c }));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setGuessShuffledChars(chars);
  };

  useEffect(() => {
    if (activeGameModal !== "guess-faster" || guessWon || guessTimeUp) return;
    const timer = setInterval(() => {
      setGuessSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGuessTimeUp(true);
          gameAudio.playWrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGameModal, guessWon, guessTimeUp, guessIndex]);

  const handleGuessCharTap = (id: number, char: string) => {
    if (guessWon || guessTimeUp) return;
    if (guessTappedIndices.includes(id)) return;

    const currentItem = GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length];
    const expected = currentItem.word[guessProgress.length];

    if (char === expected) {
      gameAudio.playCorrectChar();
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}

      const nextProg = [...guessProgress, char];
      const nextTapped = [...guessTappedIndices, id];
      setGuessProgress(nextProg);
      setGuessTappedIndices(nextTapped);

      if (nextProg.length === currentItem.word.length) {
        setGuessWon(true);
        const reward = currentItem.points;
        onAddScore(reward);
        gameAudio.playVictory();
        try {
          tgApp?.HapticFeedback?.notificationOccurred("success");
        } catch {}
      }
    } else {
      gameAudio.playWrong();
      try {
        tgApp?.HapticFeedback?.notificationOccurred("error");
      } catch {}
    }
  };

  // --- Tic Tac & Row 5 Handlers ---
  const startTicTac = () => {
    setTicTac(createInitialTicTac(0));
    setTicTacClaimed(false);
  };

  const startRow5 = () => {
    setRow5Board(Array(ROW5_SIZE * ROW5_SIZE).fill(null));
    setRow5Winner(null);
    setRow5WinningCells([]);
    setRow5Claimed(false);
  };

  const handleTicTacCellClick = (idx: number) => {
    if (ticTac.board[idx] || ticTac.winner) return;
    gameAudio.playTap();
    const nextUser = makeTicTacMove(ticTac, idx);
    setTicTac(nextUser);

    if (nextUser.winner) {
      if (nextUser.winner === "X" && !ticTacClaimed) {
        const reward = calculateTicTacReward(nextUser, 1.5);
        onAddScore(reward);
        setTicTacClaimed(true);
        gameAudio.playVictory();
        setCurrentCountryHintIdx((prev) => (prev + 1) % COUNTRY_HINTS_LIST.length);
      }
      return;
    }

    setTimeout(() => {
      const nextAI = makeTicTacAIMove(nextUser);
      setTicTac(nextAI);
      if (nextAI.winner === "X" && !ticTacClaimed) {
        const reward = calculateTicTacReward(nextAI, 1.5);
        onAddScore(reward);
        setTicTacClaimed(true);
        gameAudio.playVictory();
      } else if (nextAI.winner === "O") {
        gameAudio.playWrong();
      }
    }, 300);
  };

  const handleRow5CellClick = (idx: number) => {
    if (row5Board[idx] || row5Winner) return;
    gameAudio.playTap();

    const updated = [...row5Board];
    updated[idx] = "X";
    const winCheck = checkRow5Winner(updated, ROW5_SIZE);

    if (winCheck.winner) {
      setRow5Board(updated);
      setRow5Winner(winCheck.winner);
      setRow5WinningCells(winCheck.winningCells);
      if (winCheck.winner === "X" && !row5Claimed) {
        onAddScore(25);
        setRow5Claimed(true);
        gameAudio.playVictory();
        setCurrentCountryHintIdx((prev) => (prev + 1) % COUNTRY_HINTS_LIST.length);
      }
      return;
    }

    setRow5Board(updated);

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

  return (
    <div className="relative select-none font-sans w-full">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0098ea] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center gap-2 animate-fadeIn max-w-[90vw] truncate">
          <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Promo & Mini Game Cards Grid (Left Hero Banner + Right 2x2 Mini Game Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* 1. LARGE HERO PROMO BANNER (Sports Free Bet / Vault Bonus) */}
        {/* ======================================================== */}
        <div
          onClick={handleHeroClick}
          className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-4 text-white shadow-xs flex flex-col justify-between min-h-[175px] sm:min-h-[195px] border border-blue-400/30 cursor-pointer active:scale-98 transition-all hover:shadow-md group"
        >
          {/* Logo Watermark Mesh Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
          />

          {/* Top Left: Brand Wordmark + Short Single-Line Title */}
          <div className="relative z-10 space-y-1 max-w-[210px] sm:max-w-[250px]">
            <ShiliaiweiBrand variant="wordmark" height={15} colorScheme="white" />
            <h2 className="text-lg sm:text-xl font-black leading-tight tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
              {heroSlides[heroSlide].title}
            </h2>
            <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
              Vault Feature
            </span>
          </div>

          {/* 3D Mascot Character */}
          <div className="absolute right-0 sm:right-2 bottom-0 top-1 pointer-events-none flex items-center justify-end z-10">
            <svg
              viewBox="0 0 160 170"
              className="w-32 h-32 sm:w-38 sm:h-38 filter drop-shadow-xl"
            >
              <ellipse cx="80" cy="155" rx="55" ry="12" fill="#005580" opacity="0.6" />
              <ellipse cx="80" cy="154" rx="45" ry="8" fill="#00e5ff" opacity="0.3" />
              <rect x="58" y="115" width="8" height="28" rx="4" fill="#00334d" />
              <rect x="94" y="115" width="8" height="28" rx="4" fill="#00334d" />
              <path d="M48 138 Q56 136 68 140 L70 148 Q55 150 46 146 Z" fill="#ffffff" stroke="#0088cc" strokeWidth="2" />
              <path d="M46 142 Q52 140 64 142 L65 146 Q50 148 45 145 Z" fill="#0098ea" />
              <path d="M92 140 Q104 136 114 138 L116 146 Q106 150 90 148 Z" fill="#ffffff" stroke="#0088cc" strokeWidth="2" />
              <path d="M96 142 Q108 140 114 142 L115 145 Q106 148 94 146 Z" fill="#0098ea" />
              <polygon points="80,18 128,45 80,125 32,45" fill="url(#diamondGradBento)" stroke="#66d9ff" strokeWidth="2" />
              <polygon points="80,18 128,45 80,42" fill="#80e5ff" opacity="0.8" />
              <polygon points="80,18 32,45 80,42" fill="#33ccff" opacity="0.9" />
              <polygon points="80,42 128,45 80,125" fill="#0077b5" opacity="0.6" />
              <polygon points="80,42 32,45 80,125" fill="#0099e6" opacity="0.75" />
              <ellipse cx="68" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="92" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="70" cy="57" rx="5" ry="7" fill="#003366" />
              <ellipse cx="94" cy="57" rx="5" ry="7" fill="#003366" />
              <circle cx="72" cy="54" r="2.5" fill="#ffffff" />
              <circle cx="96" cy="54" r="2.5" fill="#ffffff" />
              <path d="M72 74 Q80 84 88 74" fill="#ff4081" stroke="#002233" strokeWidth="2" />
              <path d="M45 68 Q34 82 52 96" fill="none" stroke="#00334d" strokeWidth="7" strokeLinecap="round" />
              <circle cx="54" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <path d="M115 68 Q126 82 108 96" fill="none" stroke="#00334d" strokeWidth="7" strokeLinecap="round" />
              <circle cx="106" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <circle cx="80" cy="100" r="18" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <path d="M68 94 Q80 100 80 118" fill="none" stroke="#e11d48" strokeWidth="3" />
              <path d="M92 94 Q80 100 80 118" fill="none" stroke="#2563eb" strokeWidth="3" />
              <circle cx="80" cy="100" r="6" fill="#16a34a" />
              <defs>
                <linearGradient id="diamondGradBento" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#66d9ff" />
                  <stop offset="50%" stopColor="#0098ea" />
                  <stop offset="100%" stopColor="#005580" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Bar: Clean Status Tag + Carousel Pagination */}
          <div className="relative z-20 flex items-center justify-between pt-3 mt-auto">
            <span className="text-[11px] font-bold text-sky-100/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{claimedHero ? "Vault Active" : "Tap to Claim"}</span>
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous promo slide"
                className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next promo slide"
                className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 2x2 MINI GAME BLOCKS (No buttons! Tap to play games)  */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Card 1: Daily Spin (Fortune Wheel) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              gameAudio.playTap();
              setActiveGameModal("wheel");
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveGameModal("wheel")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Daily Spin
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Wheel of Fortune Graphic */}
            <div className="absolute right-0 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <circle cx="50" cy="50" r="44" fill="#ffd166" stroke="#f4a261" strokeWidth="3" />
                <path d="M50 50 L50 8 A42 42 0 0 1 80 20 Z" fill="#4361ee" />
                <path d="M50 50 L80 20 A42 42 0 0 1 92 50 Z" fill="#7209b7" />
                <path d="M50 50 L92 50 A42 42 0 0 1 80 80 Z" fill="#4cc9f0" />
                <path d="M50 50 L80 80 A42 42 0 0 1 50 92 Z" fill="#f72585" />
                <path d="M50 50 L50 92 A42 42 0 0 1 20 80 Z" fill="#4361ee" />
                <path d="M50 50 L20 80 A42 42 0 0 1 8 50 Z" fill="#7209b7" />
                <path d="M50 50 L8 50 A42 42 0 0 1 20 20 Z" fill="#4cc9f0" />
                <path d="M50 50 L20 20 A42 42 0 0 1 50 8 Z" fill="#f72585" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#f4a261" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#ffd166" />
                <polygon points="50,4 45,14 55,14" fill="#e63946" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 2: Word Flash (Game 1) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              gameAudio.playTap();
              startWordGame();
              setActiveGameModal("word-flash");
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveGameModal("word-flash")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Word Flash
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Word Tile Blocks Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <path d="M38 50 L64 50 L48 76 L40 76 L54 56 L38 56 Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 3: Guess Faster (Game 2) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              gameAudio.playTap();
              startGuessFaster(0);
              setActiveGameModal("guess-faster");
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveGameModal("guess-faster")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Guess Faster
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Clue Safe Vault Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <circle cx="50" cy="58" r="16" fill="#ffd166" stroke="#d97706" strokeWidth="2" />
                <circle cx="50" cy="58" r="10" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                <circle cx="50" cy="58" r="3" fill="#b45309" />
                <line x1="50" y1="52" x2="50" y2="48" stroke="#b45309" strokeWidth="2" />
                <line x1="50" y1="64" x2="50" y2="68" stroke="#b45309" strokeWidth="2" />
                <line x1="44" y1="58" x2="40" y2="58" stroke="#b45309" strokeWidth="2" />
                <line x1="56" y1="58" x2="60" y2="58" stroke="#b45309" strokeWidth="2" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 4: Row 5 Winner (Game 3) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              gameAudio.playTap();
              setSubGameType("tictac");
              startTicTac();
              setActiveGameModal("row5");
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveGameModal("row5")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Row 5 Winner
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Magnet with Diamond Crystals Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <path d="M40 30 C40 15, 75 15, 75 30 L75 60 C75 75, 40 75, 40 60 Z" fill="none" stroke="#f43f5e" strokeWidth="14" strokeLinecap="round" />
                <rect x="33" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                <rect x="68" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                <polygon points="58,22 64,28 58,40 52,28" fill="#0098ea" stroke="#ffffff" strokeWidth="1.5" />
                <polygon points="46,14 50,18 46,26 42,18" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <polygon points="70,16 74,20 70,28 66,20" fill="#00e5ff" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SPA MODAL 1: DAILY TURBINE (LUCKY WHEEL)                 */}
      {/* ======================================================== */}
      {activeGameModal === "wheel" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-200 relative text-slate-900 text-center">
            <button
              type="button"
              onClick={() => setActiveGameModal("none")}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#0098ea] uppercase block">
                DAILY BONUS WHEEL
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Daily Spin Wheel
              </h3>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute -top-3 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-red-600 filter drop-shadow-md" />
              <div
                className="w-56 h-56 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: wheelSpinning
                    ? "transform 3.2s cubic-bezier(0.15, 0.9, 0.25, 1)"
                    : "none",
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M100 100 L100 0 A100 100 0 0 1 170.7 29.3 Z" fill="#4361ee" />
                  <path d="M100 100 L170.7 29.3 A100 100 0 0 1 200 100 Z" fill="#7209b7" />
                  <path d="M100 100 L200 100 A100 100 0 0 1 170.7 170.7 Z" fill="#4cc9f0" />
                  <path d="M100 100 L170.7 170.7 A100 100 0 0 1 100 200 Z" fill="#f72585" />
                  <path d="M100 100 L100 200 A100 100 0 0 1 29.3 170.7 Z" fill="#4361ee" />
                  <path d="M100 100 L29.3 170.7 A100 100 0 0 1 0 100 Z" fill="#7209b7" />
                  <path d="M100 100 L0 100 A100 100 0 0 1 29.3 29.3 Z" fill="#4cc9f0" />
                  <path d="M100 100 L29.3 29.3 A100 100 0 0 1 100 0 Z" fill="#f72585" />
                  <text x="110" y="35" fill="#fff" fontSize="12" fontWeight="bold">100</text>
                  <text x="150" y="75" fill="#fff" fontSize="12" fontWeight="bold">250</text>
                  <text x="150" y="125" fill="#fff" fontSize="12" fontWeight="bold">50</text>
                  <text x="110" y="165" fill="#fff" fontSize="12" fontWeight="bold">500</text>
                  <text x="60" y="165" fill="#fff" fontSize="12" fontWeight="bold">150</text>
                  <text x="25" y="125" fill="#fff" fontSize="12" fontWeight="bold">1000</text>
                  <text x="25" y="75" fill="#fff" fontSize="12" fontWeight="bold">200</text>
                  <text x="60" y="35" fill="#fff" fontSize="12" fontWeight="bold">300</text>
                </svg>
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center font-black text-xs text-amber-600 shadow-md">
                  ★
                </div>
              </div>
            </div>

            {wheelResult !== null && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-sm animate-fadeIn">
                Won +{wheelResult} PTS! Claimed to Vault!
              </div>
            )}

            <button
              type="button"
              disabled={wheelSpinning}
              onClick={handleSpinWheel}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md min-h-[48px] ${
                wheelSpinning
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-[#0088cc] hover:bg-[#0077b5] text-white active:scale-98 cursor-pointer"
              }`}
            >
              {wheelSpinning ? "Spinning Wheel..." : "Spin Now!"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPA MODAL 2: WORD FLASH GRID GAME                        */}
      {/* ======================================================== */}
      {activeGameModal === "word-flash" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-200 relative text-slate-900">
            <button
              type="button"
              onClick={() => setActiveGameModal("none")}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
                  GAME 1 • WORD FLASH
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Chessboard Memory Grid
                </h3>
              </div>
              <button
                type="button"
                onClick={() => startWordGame()}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                title="New Word"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Flash Word Display */}
            <div className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-[#0098ea] p-3 text-white text-center shadow-xs">
              <span className="text-[9px] font-black uppercase tracking-widest text-sky-200 block">
                {isWordVisible ? "MEMORIZE FAST (1.5s)" : "TAP LETTERS IN CHESSBOARD"}
              </span>
              <div className="h-10 flex items-center justify-center mt-1">
                {isWordVisible ? (
                  <span className="text-2xl font-black tracking-widest animate-pulse font-mono">
                    {currentWordItem.word}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {currentWordItem.word.split("").map((c, i) => (
                      <span
                        key={i}
                        className={`w-7 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm border ${
                          currentProgress[i]
                            ? "bg-white text-[#0098ea] border-white shadow-xs"
                            : "bg-white/20 text-white/40 border-white/30"
                        }`}
                      >
                        {currentProgress[i] || "_"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4x4 Chessboard Grid */}
            <div
              className={`grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200 max-w-xs mx-auto ${
                shakeError ? "animate-shake border-rose-400 bg-rose-50" : ""
              }`}
            >
              {chessboardTiles.map((tile, idx) => {
                const isTapped = tappedIndices.includes(tile.id);
                const isEvenRow = Math.floor(idx / 4) % 2 === 0;
                const isChessDark = isEvenRow ? idx % 2 === 1 : idx % 2 === 0;

                return (
                  <button
                    key={tile.id}
                    type="button"
                    disabled={isTapped || wordGameWon || isWordVisible}
                    onClick={() => handleTileTap(tile.id, tile.char)}
                    className={`h-12 rounded-xl font-mono text-base font-black transition-all flex items-center justify-center active:scale-90 border shadow-2xs ${
                      isTapped
                        ? "bg-emerald-500 text-white border-emerald-600 scale-95 opacity-80"
                        : isChessDark
                        ? "bg-slate-200/90 text-slate-800 border-slate-300 hover:bg-sky-100"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-sky-50"
                    }`}
                  >
                    {tile.char}
                  </button>
                );
              })}
            </div>

            {wordGameWon && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">Word Completed!</span>
                  <span className="text-[11px] text-emerald-600">
                    +{currentWordItem.word.length} PTS claimed!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startWordGame()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Next Word &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPA MODAL 3: GUESS FASTER SPEED CHALLENGE                */}
      {/* ======================================================== */}
      {activeGameModal === "guess-faster" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-200 relative text-slate-900">
            <button
              type="button"
              onClick={() => setActiveGameModal("none")}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                  GAME 2 • GUESS FASTER
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Speed Clue Challenge
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Timer size={14} />
                <span>{guessSecondsLeft}s</span>
              </div>
            </div>

            {/* Clue Prompt */}
            <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                Clue #{guessIndex + 1}
              </span>
              <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">
                &quot;{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].clue}&quot;
              </p>
            </div>

            {/* Target Boxes */}
            <div className="flex items-center justify-center gap-2 py-1">
              {GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word.split("").map((c, i) => (
                <span
                  key={i}
                  className={`w-8 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base border ${
                    guessProgress[i]
                      ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  {guessProgress[i] || "?"}
                </span>
              ))}
            </div>

            {/* Shuffled Character Blocks */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs mx-auto">
              {guessShuffledChars.map((item) => {
                const isTapped = guessTappedIndices.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isTapped || guessWon || guessTimeUp}
                    onClick={() => handleGuessCharTap(item.id, item.char)}
                    className={`w-11 h-12 rounded-xl font-mono text-lg font-black border transition-all active:scale-90 ${
                      isTapped
                        ? "bg-slate-100 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed"
                        : "bg-white text-slate-900 border-slate-300 hover:border-amber-400 hover:bg-amber-50 shadow-2xs cursor-pointer"
                    }`}
                  >
                    {item.char}
                  </button>
                );
              })}
            </div>

            {guessWon && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">Correct Guess!</span>
                  <span className="text-[11px] text-emerald-600">
                    +{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].points} PTS claimed!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startGuessFaster(guessIndex + 1)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            {guessTimeUp && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">Time Expired!</span>
                  <span className="text-[11px] text-rose-600">
                    Answer: &quot;{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word}&quot;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startGuessFaster(guessIndex)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPA MODAL 4: TIC TAC TOE & ROW 5 WINNER                  */}
      {/* ======================================================== */}
      {activeGameModal === "row5" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-3.5 shadow-2xl border border-slate-200 relative text-slate-900">
            <button
              type="button"
              onClick={() => setActiveGameModal("none")}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
                  GAME 3 • STRATEGY
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Tic Tac & Row 5
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSubGameType("tictac");
                    startTicTac();
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    subGameType === "tictac" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  3x3
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubGameType("row5");
                    startRow5();
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    subGameType === "row5" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Row 5
                </button>
              </div>
            </div>

            {/* Country Clue (Starting with Cambodia) */}
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#0098ea] block">
                Country Clue • {COUNTRY_HINTS_LIST[currentCountryHintIdx].country}
              </span>
              <p className="text-[11px] font-medium text-slate-700 leading-snug mt-0.5">
                {COUNTRY_HINTS_LIST[currentCountryHintIdx].hint}
              </p>
            </div>

            {/* 3x3 Tic Tac */}
            {subGameType === "tictac" && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 w-56 h-56 mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200">
                  {ticTac.board.map((cell, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!cell || !!ticTac.winner}
                      onClick={() => handleTicTacCellClick(idx)}
                      className={`rounded-xl font-mono text-xl font-black flex items-center justify-center border transition-all ${
                        cell === "X"
                          ? "bg-[#0098ea] text-white border-blue-600"
                          : cell === "O"
                          ? "bg-rose-500 text-white border-rose-600"
                          : "bg-white text-slate-800 border-slate-200 hover:bg-sky-50"
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
                {(ticTac.winner || ticTac.isDraw) && (
                  <div className="text-center py-1">
                    <span className="text-xs font-black text-slate-900 block">
                      {ticTac.winner === "X"
                        ? "Victory! +15 PTS Claimed!"
                        : ticTac.isDraw
                        ? "Match Drawn!"
                        : "AI Wins Round!"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 8x8 Row 5 (Connect 5) */}
            {subGameType === "row5" && (
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-0.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-[280px] mx-auto aspect-square">
                  {row5Board.map((cell, idx) => {
                    const isWinning = row5WinningCells.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!!cell || !!row5Winner}
                        onClick={() => handleRow5CellClick(idx)}
                        className={`rounded font-mono text-[10px] font-black flex items-center justify-center border transition-all ${
                          isWinning
                            ? "bg-emerald-500 text-white border-emerald-600 animate-pulse"
                            : cell === "X"
                            ? "bg-[#0098ea] text-white border-blue-600"
                            : cell === "O"
                            ? "bg-rose-500 text-white border-rose-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-sky-50"
                        }`}
                      >
                        {cell}
                      </button>
                    );
                  })}
                </div>
                {row5Winner && (
                  <div className="text-center py-1">
                    <span className="text-xs font-black text-slate-900 block">
                      {row5Winner === "X" ? "Row 5 Champion! +25 PTS Claimed!" : "AI Connected 5 in a Row!"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
