"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { LevelCircleProfile } from "@/components/common/LevelCircleProfile";
import { getUserLevelInfo } from "@/lib/games/levels";
import {
  generateMission,
  toggleMissionCell,
  calculateMissionReward,
  MissionState,
} from "@/lib/games/fillMission";
import {
  createInitialChessBoard,
  makeChessMove,
  makeAIMove,
  ChessGameState,
} from "@/lib/games/chess";
import {
  createInitialTicTac,
  makeTicTacMove,
  makeTicTacAIMove,
  calculateTicTacReward,
  TicTacState,
} from "@/lib/games/tictac";
import {
  KeylineGamepad,
  Grid2x2,
  Crown,
  Sparkles,
  RefreshCw,
  Check,
  ChevronRight,
} from "@/components/icons/KeylineIcons";

export type GameModeId = "fill" | "chess" | "tictac" | null;

interface GameCards3DViewProps {
  score: number;
  onAddScore: (amount: number) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const GameCards3DView: React.FC<GameCards3DViewProps> = ({
  score,
  onAddScore,
  user,
  tgApp,
}) => {
  const [activeMode, setActiveMode] = useState<GameModeId>(null);
  const levelInfo = getUserLevelInfo(score);

  // 1. Fill Mission Game State
  const [missionState, setMissionState] = useState<MissionState>(() => generateMission(4, 6));
  const [missionRewardClaimed, setMissionRewardClaimed] = useState(false);

  // 2. Chess Game State
  const [chessState, setChessState] = useState<ChessGameState>(() => createInitialChessBoard());

  // 3. TicTac Game State
  const [ticTacState, setTicTacState] = useState<TicTacState>(() => createInitialTicTac(0));
  const [ticTacRewardClaimed, setTicTacRewardClaimed] = useState(false);

  // Sound & Haptic triggers
  const triggerHaptic = (type: "light" | "medium" | "heavy" | "success" = "light") => {
    try {
      if (type === "success") {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } else {
        tgApp?.HapticFeedback?.impactOccurred(type);
      }
    } catch {}
  };

  // --- Handlers for Fill Mission ---
  const handleCellClick = (idx: number) => {
    if (missionState.isComplete || missionState.isFailed) return;
    triggerHaptic("light");
    const next = toggleMissionCell(missionState, idx);
    setMissionState(next);

    if (next.isComplete && !missionRewardClaimed) {
      triggerHaptic("success");
      const reward = calculateMissionReward(next, levelInfo.multiplier);
      onAddScore(reward);
      setMissionRewardClaimed(true);
    }
  };

  const handleResetMission = () => {
    triggerHaptic("medium");
    setMissionState(generateMission(4, 6));
    setMissionRewardClaimed(false);
  };

  // --- Handlers for Chess ---
  const handleChessSquareClick = (idx: number) => {
    if (chessState.winner) return;

    // 1. If clicking our own white piece -> select it
    const piece = chessState.board[idx];
    if (piece && piece.color === "w") {
      triggerHaptic("light");
      setChessState(makeChessMove(chessState, idx, idx));
      return;
    }

    // 2. If a piece was selected and clicking legal destination -> move it
    if (chessState.selectedSquare !== null && chessState.legalMovesForSelected.includes(idx)) {
      triggerHaptic("medium");
      const afterPlayerMove = makeChessMove(chessState, chessState.selectedSquare, idx);
      setChessState(afterPlayerMove);

      // Check player win
      if (afterPlayerMove.winner === "w") {
        triggerHaptic("success");
        const reward = Math.round(afterPlayerMove.baseReward * levelInfo.multiplier);
        onAddScore(reward);
        return;
      }

      // If Bot Turn -> AI replies after short delay
      if (!afterPlayerMove.winner && afterPlayerMove.turn === "b") {
        setTimeout(() => {
          setChessState((prev) => {
            const afterBotMove = makeAIMove(prev);
            if (afterBotMove.winner === "b") {
              triggerHaptic("heavy");
            }
            return afterBotMove;
          });
        }, 350);
      }
    }
  };

  const handleResetChess = () => {
    triggerHaptic("medium");
    setChessState(createInitialChessBoard());
  };

  // --- Handlers for TicTac ---
  const handleTicTacCellClick = (idx: number) => {
    if (ticTacState.winner || ticTacState.isDraw || ticTacState.board[idx] !== null) return;
    if (ticTacState.turn !== "X") return;

    triggerHaptic("light");
    const afterPlayer = makeTicTacMove(ticTacState, idx);
    setTicTacState(afterPlayer);

    // If Player Won
    if (afterPlayer.winner === "X" && !ticTacRewardClaimed) {
      triggerHaptic("success");
      const reward = calculateTicTacReward(afterPlayer, levelInfo.multiplier);
      onAddScore(reward);
      setTicTacRewardClaimed(true);
      return;
    }

    // If Draw
    if (afterPlayer.isDraw && !ticTacRewardClaimed) {
      const reward = calculateTicTacReward(afterPlayer, levelInfo.multiplier);
      onAddScore(reward);
      setTicTacRewardClaimed(true);
      return;
    }

    // AI move
    if (!afterPlayer.winner && !afterPlayer.isDraw && afterPlayer.turn === "O") {
      setTimeout(() => {
        setTicTacState((prev) => {
          const afterAI = makeTicTacAIMove(prev);
          if (afterAI.isDraw && !ticTacRewardClaimed) {
            const reward = calculateTicTacReward(afterAI, levelInfo.multiplier);
            onAddScore(reward);
            setTicTacRewardClaimed(true);
          }
          return afterAI;
        });
      }, 300);
    }
  };

  const handleResetTicTac = () => {
    triggerHaptic("medium");
    setTicTacState(createInitialTicTac(ticTacState.streak));
    setTicTacRewardClaimed(false);
  };

  return (
    <div className="space-y-4 pb-24 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* 1. Standard Level Game Profile Header */}
      <div className="liquid-glass p-4 border border-slate-200/90 shadow-sm">
        <LevelCircleProfile score={score} user={user} size="md" showDetails={true} />
      </div>

      {/* 2. 3D List Card Selection Menu */}
      {activeMode === null && (
        <div className="perspective-1000 space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-display">
              <KeylineGamepad size={18} className="text-[#0098ea]" />
              <span>3D Arcade Game Modes</span>
            </span>
            <span className="text-[11px] text-[#14532d] font-bold">
              Level Multiplier: {levelInfo.multiplier}x
            </span>
          </div>

          {/* 3D Card 1: Fill Mission - Unboxed Icon */}
          <div
            onClick={() => {
              triggerHaptic("medium");
              setActiveMode("fill");
            }}
            className="card-3d-item liquid-glass p-3.5 sm:p-4 border border-slate-200 hover:border-[#0098ea] cursor-pointer relative overflow-hidden group shadow-xs transition-all"
          >
            {/* Banknote Half-Circles Security Strip (10350116.webp) */}
            <div className="w-full h-2.5 border-strip-halfcircles opacity-70 mb-3 rounded-t-lg" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid2x2 size={24} className="text-[#0098ea] flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wide">
                      Fill Mission
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-50 text-[#0077b5] font-bold border border-sky-200">
                      PUZZLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Fill the highlighted matrix targets before moves run out.
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-black text-[#14532d] font-display block">
                    +75 – 150 PTS
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">
                    WIN REWARD
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          {/* 3D Card 2: Chess - Unboxed Icon */}
          <div
            onClick={() => {
              triggerHaptic("medium");
              setActiveMode("chess");
            }}
            className="card-3d-item liquid-glass p-3.5 sm:p-4 border border-slate-200 hover:border-amber-500 cursor-pointer relative overflow-hidden group shadow-xs transition-all"
          >
            {/* Banknote Half-Circles Security Strip (10350116.webp) */}
            <div className="w-full h-2.5 border-strip-halfcircles opacity-70 mb-3 rounded-t-lg" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown size={24} className="text-amber-500 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wide">
                      Chess Tactical
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      STRATEGY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Capture the opponent King in a 5x5 tactical endgame.
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-black text-[#14532d] font-display block">
                    +120 – 360 PTS
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">
                    WIN REWARD
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          {/* 3D Card 3: TicTac - Unboxed Icon */}
          <div
            onClick={() => {
              triggerHaptic("medium");
              setActiveMode("tictac");
            }}
            className="card-3d-item liquid-glass p-3.5 sm:p-4 border border-slate-200 hover:border-[#16a34a] cursor-pointer relative overflow-hidden group shadow-xs transition-all"
          >
            {/* Banknote Half-Circles Security Strip (10350116.webp) */}
            <div className="w-full h-2.5 border-strip-halfcircles opacity-70 mb-3 rounded-t-lg" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-[#16a34a] flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wide">
                      TicTac Arena
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      SPEED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Fast 3x3 Tic Tac Toe vs Bot with win streaks.
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-black text-[#14532d] font-display block">
                    +40 – 90 PTS
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">
                    WIN REWARD
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. ACTIVE GAME: MODE 1 - FILL MISSION */}
      {activeMode === "fill" && (
        <div className="liquid-glass p-5 space-y-4 border border-slate-200/90 shadow-sm">
          {/* Header & Controls */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-display block">
                Fill Mission Challenge
              </span>
              <span className="text-[11px] text-slate-500">
                Moves Remaining: <strong className="text-slate-900">{missionState.movesLeft}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetMission}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
                aria-label="Restart Mission"
                title="Restart Mission"
              >
                <RefreshCw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setActiveMode(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-xs min-h-[36px]"
              >
                Back
              </button>
            </div>
          </div>

          {/* 4x4 Grid Board */}
          <div className="max-w-[280px] mx-auto grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200">
            {Array.from({ length: 16 }, (_, i) => {
              const isTarget = missionState.targetCells.includes(i);
              const isFilled = missionState.filledCells.includes(i);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCellClick(i)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
                    isFilled && isTarget
                      ? "bg-[#16a34a] border-[#16a34a] text-white shadow-md shadow-[#16a34a]/30"
                      : isFilled && !isTarget
                      ? "bg-rose-500 border-rose-500 text-white"
                      : isTarget
                      ? "bg-white border-[#0098ea] text-[#0098ea]"
                      : "bg-white/80 border-slate-200 text-slate-400"
                  }`}
                >
                  {isFilled && isTarget ? (
                    <Check size={20} className="text-white" />
                  ) : isTarget ? (
                    <span className="w-3 h-3 rounded-full bg-[#0098ea]" />
                  ) : (
                    ""
                  )}
                </button>
              );
            })}
          </div>

          {/* Victory / Defeat Status Banner */}
          {missionState.isComplete && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <span className="text-xs font-black text-[#16a34a] uppercase tracking-wider block font-display">
                Mission Accomplished!
              </span>
              <p className="text-xs text-slate-800">
                Earned +{calculateMissionReward(missionState, levelInfo.multiplier)} Points to Vault!
              </p>
              <button
                type="button"
                onClick={handleResetMission}
                className="mt-1 px-4 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs uppercase shadow-sm"
              >
                Next Mission
              </button>
            </div>
          )}

          {missionState.isFailed && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
              <span className="text-xs font-bold text-rose-600 block">Out of Moves</span>
              <button
                type="button"
                onClick={handleResetMission}
                className="mt-1 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIVE GAME: MODE 2 - CHESS */}
      {activeMode === "chess" && (
        <div className="liquid-glass p-5 space-y-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-display block">
                Tactical 5x5 Mini Chess
              </span>
              <span className="text-[11px] text-slate-500">
                Turn: <strong className={chessState.turn === "w" ? "text-slate-900" : "text-rose-600"}>
                  {chessState.turn === "w" ? "Your Turn (White)" : "Bot Moving..."}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetChess}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
                aria-label="Reset Chess"
                title="Reset Chess"
              >
                <RefreshCw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setActiveMode(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-xs min-h-[36px]"
              >
                Back
              </button>
            </div>
          </div>

          {/* 5x5 Chess Board */}
          <div className="max-w-[300px] mx-auto p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <div className="grid grid-cols-5 gap-1">
              {chessState.board.map((piece, idx) => {
                const isSelected = chessState.selectedSquare === idx;
                const isLegalTarget = chessState.legalMovesForSelected.includes(idx);
                const row = Math.floor(idx / 5);
                const col = idx % 5;
                const isDarkSquare = (row + col) % 2 === 1;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChessSquareClick(idx)}
                    className={`w-13 h-13 rounded-lg flex items-center justify-center text-lg font-black transition-all relative ${
                      isSelected
                        ? "bg-[#0098ea] text-white shadow-md ring-2 ring-[#0098ea]"
                        : isLegalTarget
                        ? "bg-emerald-100 border border-[#16a34a]"
                        : isDarkSquare
                        ? "bg-slate-200/80 text-slate-900"
                        : "bg-white text-slate-900"
                    }`}
                  >
                    {piece && (
                      <span
                        className={`text-xl font-bold select-none ${
                          piece.color === "w" ? "text-slate-900" : "text-rose-600"
                        }`}
                      >
                        {piece.type === "k" && "K"}
                        {piece.type === "q" && "Q"}
                        {piece.type === "n" && "N"}
                        {piece.type === "p" && "P"}
                      </span>
                    )}

                    {isLegalTarget && !piece && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Winner Banner */}
          {chessState.winner === "w" && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <span className="text-xs font-black text-[#16a34a] uppercase tracking-wider block font-display">
                Checkmate! You Defeated Opponent!
              </span>
              <p className="text-xs text-slate-800">
                Earned +{Math.round(chessState.baseReward * levelInfo.multiplier)} Points!
              </p>
              <button
                type="button"
                onClick={handleResetChess}
                className="mt-1 px-4 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs uppercase shadow-sm"
              >
                Play Again
              </button>
            </div>
          )}

          {chessState.winner === "b" && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
              <span className="text-xs font-bold text-rose-600 block">Checkmate! Black Won</span>
              <button
                type="button"
                onClick={handleResetChess}
                className="mt-1 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm"
              >
                Rematch
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. ACTIVE GAME: MODE 3 - TICTAC */}
      {activeMode === "tictac" && (
        <div className="liquid-glass p-5 space-y-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-display block">
                TicTac Arena (Player X vs Bot O)
              </span>
              <span className="text-[11px] text-slate-500">
                Win Streak: <strong className="text-[#0098ea]">{ticTacState.streak} Wins</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetTicTac}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
                aria-label="Reset TicTac"
                title="Reset TicTac"
              >
                <RefreshCw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setActiveMode(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-xs min-h-[36px]"
              >
                Back
              </button>
            </div>
          </div>

          {/* 3x3 TicTac Board */}
          <div className="max-w-[260px] mx-auto p-2 rounded-2xl bg-slate-100 border border-slate-200">
            <div className="grid grid-cols-3 gap-2">
              {ticTacState.board.map((cell, idx) => {
                const isWinningSquare = ticTacState.winningLine?.includes(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTicTacCellClick(idx)}
                    className={`w-18 h-18 rounded-xl border flex items-center justify-center text-3xl font-black transition-all active:scale-90 ${
                      isWinningSquare
                        ? "bg-[#16a34a] border-[#16a34a] text-white shadow-lg shadow-[#16a34a]/30"
                        : cell === "X"
                        ? "bg-white border-[#0098ea] text-[#0098ea] shadow-sm"
                        : cell === "O"
                        ? "bg-white border-rose-500 text-rose-500 shadow-sm"
                        : "bg-white/80 border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Victory / Draw Banner */}
          {ticTacState.winner === "X" && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <span className="text-xs font-black text-[#16a34a] uppercase tracking-wider block font-display">
                Victory! 3 in a Row!
              </span>
              <p className="text-xs text-slate-800">
                Earned +{calculateTicTacReward(ticTacState, levelInfo.multiplier)} Points to Vault!
              </p>
              <button
                type="button"
                onClick={handleResetTicTac}
                className="mt-1 px-4 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs uppercase shadow-sm"
              >
                Next Match
              </button>
            </div>
          )}

          {ticTacState.winner === "O" && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
              <span className="text-xs font-bold text-rose-600 block">Bot Won This Round</span>
              <button
                type="button"
                onClick={handleResetTicTac}
                className="mt-1 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm"
              >
                Play Again
              </button>
            </div>
          )}

          {ticTacState.isDraw && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-xs font-bold text-amber-700 block">Match Drawn!</span>
              <p className="text-xs text-slate-800">
                Earned +{calculateTicTacReward(ticTacState, levelInfo.multiplier)} Tie Bonus!
              </p>
              <button
                type="button"
                onClick={handleResetTicTac}
                className="mt-1 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
