"use client";

import React, { useState, useEffect, useRef } from "react";
import { TelegramWebApp } from "@/types/telegram";
import {
  WORD_FLASH_POOL,
  GUESS_FASTER_POOL,
  COUNTRY_HINTS_LIST,
  generateChessboardGrid,
  checkRow5Winner,
  getRow5AIMove,
  WordFlashItem,
  GuessFasterItem,
} from "@/lib/games/wordGames";
import {
  createInitialTicTac,
  makeTicTacMove,
  makeTicTacAIMove,
  calculateTicTacReward,
  TicTacState,
} from "@/lib/games/tictac";
import { gameAudio } from "@/lib/audio/gameAudio";
import {
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  X,
  Timer,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "@/components/icons/KeylineIcons";

interface ClaimPointsGameHubProps {
  score: number;
  onAddScore: (amount: number) => void;
  tgApp: TelegramWebApp | null;
}

type ActiveGameMode = "hub" | "word-flash" | "guess-faster" | "tictac-row5";

export const ClaimPointsGameHub: React.FC<ClaimPointsGameHubProps> = ({
  score,
  onAddScore,
  tgApp,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameMode>("hub");
  const [sessionClaimedPoints, setSessionClaimedPoints] = useState(0);

  // -------------------------------------------------------------
  // GAME 1: WORD FLASH (Flash 2-8 letter word, tap chessboard grid)
  // -------------------------------------------------------------
  const [currentWordItem, setCurrentWordItem] = useState<WordFlashItem>(WORD_FLASH_POOL[0]);
  const [isWordVisible, setIsWordVisible] = useState(true);
  const [flashCountdown, setFlashCountdown] = useState(1.5);
  const [chessboardTiles, setChessboardTiles] = useState<{ id: number; char: string; isTarget: boolean }[]>([]);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [currentProgress, setCurrentProgress] = useState<string[]>([]);
  const [wordGameWon, setWordGameWon] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const startWordGame = (item?: WordFlashItem) => {
    const target = item || WORD_FLASH_POOL[Math.floor(Math.random() * WORD_FLASH_POOL.length)];
    setCurrentWordItem(target);
    setIsWordVisible(true);
    setFlashCountdown(1.5);
    setTappedIndices([]);
    setCurrentProgress([]);
    setWordGameWon(false);
    setShakeError(false);
    setChessboardTiles(generateChessboardGrid(target.word, 16));

    // Flash countdown
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
      // Correct character
      gameAudio.playCorrectChar();
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}

      const newProgress = [...currentProgress, char];
      const newTapped = [...tappedIndices, tileId];
      setCurrentProgress(newProgress);
      setTappedIndices(newTapped);

      // Award +1 point per character
      onAddScore(1);
      setSessionClaimedPoints((prev) => prev + 1);

      // Check if word completed
      if (newProgress.length === currentWordItem.word.length) {
        setWordGameWon(true);
        gameAudio.playWordComplete();
        try {
          tgApp?.HapticFeedback?.notificationOccurred("success");
        } catch {}
      }
    } else {
      // Wrong character
      gameAudio.playWrong();
      try {
        tgApp?.HapticFeedback?.notificationOccurred("error");
      } catch {}
      setShakeError(true);
      setTimeout(() => setShakeError(false), 400);
    }
  };

  // -------------------------------------------------------------
  // GAME 2: GUESS FASTER (Speed word guessing in separate blocks)
  // -------------------------------------------------------------
  const [guessIndex, setGuessIndex] = useState(0);
  const [guessShuffledChars, setGuessShuffledChars] = useState<{ id: number; char: string }[]>([]);
  const [guessTappedIndices, setGuessTappedIndices] = useState<number[]>([]);
  const [guessProgress, setGuessProgress] = useState<string[]>([]);
  const [guessSecondsLeft, setGuessSecondsLeft] = useState(10);
  const [guessWon, setGuessWon] = useState(false);
  const [guessTimeUp, setGuessTimeUp] = useState(false);

  const startGuessFaster = (idx: number = 0) => {
    const item = GUESS_FASTER_POOL[idx % GUESS_FASTER_POOL.length];
    setGuessIndex(idx);
    setGuessTappedIndices([]);
    setGuessProgress([]);
    setGuessWon(false);
    setGuessTimeUp(false);
    setGuessSecondsLeft(10);

    // Shuffle characters into separate blocks
    const chars = item.word.split("").map((c, i) => ({ id: i, char: c }));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setGuessShuffledChars(chars);
  };

  useEffect(() => {
    if (activeGame !== "guess-faster" || guessWon || guessTimeUp) return;
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
  }, [activeGame, guessWon, guessTimeUp, guessIndex]);

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
        setSessionClaimedPoints((prev) => prev + reward);
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

  // -------------------------------------------------------------
  // GAME 3: TIC TAC TOE & ROW 5 WINNER (With Cambodia Hints)
  // -------------------------------------------------------------
  const [subGameType, setSubGameType] = useState<"tictac" | "row5">("tictac");
  const [ticTac, setTicTac] = useState<TicTacState>(() => createInitialTicTac(0));
  const [ticTacClaimed, setTicTacClaimed] = useState(false);

  // Row 5 (Gomoku) on 8x8 Grid
  const ROW5_SIZE = 8;
  const [row5Board, setRow5Board] = useState<(string | null)[]>(() => Array(ROW5_SIZE * ROW5_SIZE).fill(null));
  const [row5Winner, setRow5Winner] = useState<string | null>(null);
  const [row5WinningCells, setRow5WinningCells] = useState<number[]>([]);
  const [row5Claimed, setRow5Claimed] = useState(false);
  const [currentCountryHintIdx, setCurrentCountryHintIdx] = useState(0);

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
        setSessionClaimedPoints((prev) => prev + reward);
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
        setSessionClaimedPoints((prev) => prev + reward);
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
        setSessionClaimedPoints((prev) => prev + 25);
        setRow5Claimed(true);
        gameAudio.playVictory();
        setCurrentCountryHintIdx((prev) => (prev + 1) % COUNTRY_HINTS_LIST.length);
      }
      return;
    }

    setRow5Board(updated);

    // AI move
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
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 select-none font-sans space-y-4">
      {/* Card Header & Points Counter */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0098ea]">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              Claim Points Mini Games
            </h3>
            <span className="text-[11px] text-slate-500 block">
              Play challenges & claim verified point rewards
            </span>
          </div>
        </div>

        {/* Claimed in session badge */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
          <span>+{sessionClaimedPoints}</span>
          <span className="text-[10px] font-sans">CLAIMED</span>
        </div>
      </div>

      {/* VIEW: HUB OPTIONS */}
      {activeGame === "hub" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Word Game */}
          <div
            onClick={() => {
              setActiveGame("word-flash");
              startWordGame();
              gameAudio.playTap();
            }}
            className="group relative rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-sky-50/40 hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between min-h-[130px] active:scale-98"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/80 text-[#0098ea] border border-blue-200">
                  Game 1
                </span>
                <span className="text-[10px] font-extrabold text-[#16a34a] font-mono">
                  +1 PT / Letter
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-2 group-hover:text-[#0098ea] transition-colors">
                Word Flash Grid
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Word flashes quickly then vanishes. Tap chessboard blocks in order!
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
              <span className="text-[10px] font-bold text-slate-400">2–8 characters</span>
              <span className="text-xs font-black text-[#0098ea] flex items-center gap-0.5">
                Play <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Card 2: Guess Faster */}
          <div
            onClick={() => {
              setActiveGame("guess-faster");
              startGuessFaster(0);
              gameAudio.playTap();
            }}
            className="group relative rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-amber-50/40 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between min-h-[130px] active:scale-98"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-700 border border-amber-200">
                  Game 2
                </span>
                <span className="text-[10px] font-extrabold text-amber-700 font-mono">
                  Up to +15 PTS
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-2 group-hover:text-amber-700 transition-colors">
                Guess Faster
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Crack the clue (e.g. &quot;YOU&quot;) and tap separate blocks against time!
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
              <span className="text-[10px] font-bold text-slate-400">Speed Challenge</span>
              <span className="text-xs font-black text-amber-700 flex items-center gap-0.5">
                Play <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Card 3: Tic Tac Toe & Row 5 Winner */}
          <div
            onClick={() => {
              setActiveGame("tictac-row5");
              setSubGameType("tictac");
              startTicTac();
              gameAudio.playTap();
            }}
            className="group relative rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between min-h-[130px] active:scale-98"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                  Game 3
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 font-mono">
                  +25 PTS Win
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">
                Tic Tac & Row 5
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Connect 5 or 3x3 victory against AI. Country hints featuring Cambodia!
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
              <span className="text-[10px] font-bold text-slate-400">Cambodia Clues</span>
              <span className="text-xs font-black text-emerald-700 flex items-center gap-0.5">
                Play <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: GAME 1 - WORD FLASH GRID */}
      {activeGame === "word-flash" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveGame("hub")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              &larr; Back to Game Options
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">
                {currentWordItem.charCount} Letters
              </span>
              <button
                type="button"
                onClick={() => startWordGame()}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                title="New Word"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Flash Word Display Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-[#0098ea] p-4 text-white text-center shadow-xs relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 block">
              {isWordVisible ? "MEMORIZE THE WORD FAST" : "RECALL & TAP IN CHESSBOARD"}
            </span>
            <div className="h-10 flex items-center justify-center mt-1">
              {isWordVisible ? (
                <span className="text-2xl sm:text-3xl font-black tracking-widest animate-pulse font-mono">
                  {currentWordItem.word}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {currentWordItem.word.split("").map((c, i) => (
                    <span
                      key={i}
                      className={`w-7 h-8 rounded-lg flex items-center justify-center font-mono font-black text-base border ${
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
            {isWordVisible && (
              <span className="text-[10px] text-sky-100 font-mono mt-1 block">
                Vanishing in 1.5s...
              </span>
            )}
          </div>

          {/* 4x4 Chessboard Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>Chessboard Letter Grid</span>
              <span className="text-[#16a34a] font-mono">
                Progress: {currentProgress.length} / {currentWordItem.word.length} (+{currentProgress.length} PTS)
              </span>
            </div>

            <div
              className={`grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-xs mx-auto ${
                shakeError ? "animate-shake border-rose-400 bg-rose-50" : ""
              }`}
            >
              {chessboardTiles.map((tile, idx) => {
                const isTapped = tappedIndices.includes(tile.id);
                // Chessboard alternating background pattern
                const isEvenRow = Math.floor(idx / 4) % 2 === 0;
                const isChessDark = isEvenRow ? idx % 2 === 1 : idx % 2 === 0;

                return (
                  <button
                    key={tile.id}
                    type="button"
                    disabled={isTapped || wordGameWon || isWordVisible}
                    onClick={() => handleTileTap(tile.id, tile.char)}
                    className={`h-14 sm:h-16 rounded-xl font-mono text-lg font-black transition-all flex items-center justify-center active:scale-90 border shadow-2xs ${
                      isTapped
                        ? "bg-emerald-500 text-white border-emerald-600 scale-95 opacity-80"
                        : isChessDark
                        ? "bg-slate-200/90 text-slate-800 border-slate-300 hover:bg-sky-100 hover:border-sky-300"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-sky-50 hover:border-sky-300"
                    }`}
                  >
                    {tile.char}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Victory Modal or Banner */}
          {wordGameWon && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black block">Word Completed!</span>
                <span className="text-[11px] text-emerald-600">
                  +{currentWordItem.word.length} PTS claimed to your vault!
                </span>
              </div>
              <button
                type="button"
                onClick={() => startWordGame()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Next Word &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: GAME 2 - GUESS FASTER */}
      {activeGame === "guess-faster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveGame("hub")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              &larr; Back to Game Options
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">
                Clue #{guessIndex + 1}
              </span>
              <button
                type="button"
                onClick={() => startGuessFaster(guessIndex + 1)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                title="Next Clue"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Clue Card */}
          <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Guess the Word
              </span>
              <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-800">
                <Timer size={14} />
                <span>{guessSecondsLeft}s left</span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-snug">
              &quot;{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].clue}&quot;
            </p>
          </div>

          {/* Word Progress Boxes */}
          <div className="flex items-center justify-center gap-2 py-2">
            {GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word.split("").map((c, i) => (
              <span
                key={i}
                className={`w-9 h-11 rounded-xl flex items-center justify-center font-mono font-black text-lg border ${
                  guessProgress[i]
                    ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                {guessProgress[i] || "?"}
              </span>
            ))}
          </div>

          {/* Separate Character Blocks to Tap */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-sm mx-auto">
            {guessShuffledChars.map((item) => {
              const isTapped = guessTappedIndices.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isTapped || guessWon || guessTimeUp}
                  onClick={() => handleGuessCharTap(item.id, item.char)}
                  className={`w-12 h-14 rounded-xl font-mono text-xl font-black border transition-all active:scale-90 ${
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

          {/* Result States */}
          {guessWon && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black block">Correct Guess!</span>
                <span className="text-[11px] text-emerald-600">
                  +{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].points} PTS claimed!
                </span>
              </div>
              <button
                type="button"
                onClick={() => startGuessFaster(guessIndex + 1)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Next Word &rarr;
              </button>
            </div>
          )}

          {guessTimeUp && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black block">Time Expired!</span>
                <span className="text-[11px] text-rose-600">
                  The word was &quot;{GUESS_FASTER_POOL[guessIndex % GUESS_FASTER_POOL.length].word}&quot;.
                </span>
              </div>
              <button
                type="button"
                onClick={() => startGuessFaster(guessIndex)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: GAME 3 - TIC TAC TOE & ROW 5 WINNER */}
      {activeGame === "tictac-row5" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveGame("hub")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              &larr; Back to Game Options
            </button>
            {/* Toggle Sub Game */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSubGameType("tictac");
                  startTicTac();
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  subGameType === "tictac"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tic Tac (3x3)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubGameType("row5");
                  startRow5();
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  subGameType === "row5"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Row 5 (Gomoku)
              </button>
            </div>
          </div>

          {/* Next Game Country Hint (Starting with Cambodia) */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0098ea]">
                Next Game Hint • Country Clue
              </span>
              <span className="text-[10px] font-bold text-sky-700 font-mono">
                {COUNTRY_HINTS_LIST[currentCountryHintIdx].country}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-snug">
              {COUNTRY_HINTS_LIST[currentCountryHintIdx].hint}
            </p>
          </div>

          {/* Subgame 1: Tic Tac Toe (3x3) */}
          {subGameType === "tictac" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <span>Player: X (You) vs O (AI)</span>
                <button
                  type="button"
                  onClick={startTicTac}
                  className="text-[#0098ea] hover:underline"
                >
                  Restart Round
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200">
                {ticTac.board.map((cell, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!!cell || !!ticTac.winner}
                    onClick={() => handleTicTacCellClick(idx)}
                    className={`rounded-xl font-mono text-2xl font-black flex items-center justify-center transition-all border ${
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
                <div className="text-center py-2">
                  <span className="text-sm font-black text-slate-900 block">
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

          {/* Subgame 2: Row 5 Winner (Gomoku 8x8) */}
          {subGameType === "row5" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <span>5 in a Row: Connect 5 tiles horizontally, vertically, or diagonally!</span>
                <button
                  type="button"
                  onClick={startRow5}
                  className="text-[#0098ea] hover:underline"
                >
                  Restart
                </button>
              </div>

              <div
                className="grid grid-cols-8 gap-1 p-2 rounded-2xl bg-slate-100 border border-slate-200 max-w-[320px] sm:max-w-[340px] mx-auto"
                style={{ aspectRatio: "1/1" }}
              >
                {row5Board.map((cell, idx) => {
                  const isWinning = row5WinningCells.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!!cell || !!row5Winner}
                      onClick={() => handleRow5CellClick(idx)}
                      className={`rounded-md font-mono text-xs font-black flex items-center justify-center transition-all border ${
                        isWinning
                          ? "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300 animate-pulse"
                          : cell === "X"
                          ? "bg-[#0098ea] text-white border-blue-600"
                          : cell === "O"
                          ? "bg-rose-500 text-white border-rose-600"
                          : "bg-white text-slate-700 border-slate-200/90 hover:bg-sky-50"
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>

              {row5Winner && (
                <div className="text-center py-2">
                  <span className="text-sm font-black text-slate-900 block">
                    {row5Winner === "X"
                      ? "Row 5 Champion! +25 PTS Claimed!"
                      : "AI Connected 5 in a Row!"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
