import test from "node:test";
import assert from "node:assert/strict";

import { getUserLevelInfo, LEVEL_TIERS } from "../src/lib/games/levels";
import {
  generateMission,
  toggleMissionCell,
  checkMissionVictory,
  calculateMissionReward,
} from "../src/lib/games/fillMission";
import {
  createInitialChessBoard,
  getLegalMoves,
  makeChessMove,
  makeAIMove,
} from "../src/lib/games/chess";
import {
  createInitialTicTac,
  makeTicTacMove,
  checkTicTacResult,
  makeTicTacAIMove,
  calculateTicTacReward,
} from "../src/lib/games/tictac";

test("Level System: correctly assigns tiers and multipliers based on score", () => {
  const lvl1 = getUserLevelInfo(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.title, "Bronze Cadet");
  assert.equal(lvl1.multiplier, 1.0);
  assert.equal(lvl1.progressPercent, 0);

  const lvl1Mid = getUserLevelInfo(250);
  assert.equal(lvl1Mid.level, 1);
  assert.equal(lvl1Mid.progressPercent, 50);

  const lvl2 = getUserLevelInfo(500);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.title, "Silver Scout");
  assert.equal(lvl2.multiplier, 1.2);

  const lvl3 = getUserLevelInfo(2000);
  assert.equal(lvl3.level, 3);
  assert.equal(lvl3.title, "Gold Master");

  const lvl4 = getUserLevelInfo(10000);
  assert.equal(lvl4.level, 4);
  assert.equal(lvl4.title, "Platinum Champion");

  const lvl5 = getUserLevelInfo(55000);
  assert.equal(lvl5.level, 5);
  assert.equal(lvl5.title, "Diamond Legend");
  assert.equal(lvl5.multiplier, 3.0);
});

test("Fill Mission: correctly handles grid generation, clicks, and victory", () => {
  const mission = generateMission(4, 5);
  assert.equal(mission.gridSize, 4);
  assert.equal(mission.targetCells.length, 5);
  assert.equal(mission.isComplete, false);
  assert.equal(mission.isFailed, false);

  // Toggle first target cell
  const firstTarget = mission.targetCells[0];
  const step1 = toggleMissionCell(mission, firstTarget);
  assert.equal(step1.filledCells.includes(firstTarget), true);
  assert.equal(step1.movesLeft, mission.movesLeft - 1);

  // Fill all targets to verify victory
  let state = mission;
  for (const target of mission.targetCells) {
    state = toggleMissionCell(state, target);
  }

  assert.equal(state.isComplete, true);
  assert.equal(state.isFailed, false);

  const reward = calculateMissionReward(state, 1.5);
  assert.ok(reward > 75);
});

test("Mini Chess: validates legal moves, piece interaction, and capture", () => {
  const initial = createInitialChessBoard();
  assert.equal(initial.turn, "w");
  assert.equal(initial.winner, null);

  // White Knight at 20 should have legal moves
  const knightMoves = getLegalMoves(initial.board, 20);
  assert.ok(knightMoves.length > 0);
  // (row 4, col 0) can jump to (row 2, col 1 = 11) or (row 3, col 2 = 17 - occupied by white pawn, so blocked)
  assert.ok(knightMoves.includes(11));

  // Move White Knight from 20 to 11
  const afterKnight = makeChessMove(initial, 20, 11);
  assert.equal(afterKnight.turn, "b");
  assert.equal(afterKnight.board[11]?.type, "n");
  assert.equal(afterKnight.board[20], null);

  // AI responds for Black
  const afterAI = makeAIMove(afterKnight);
  assert.equal(afterAI.turn, "w");
  assert.ok(afterAI.moveHistory.length >= 2);
});

test("TicTac: detects line wins, AI defense blocks, and rewards", () => {
  const game = createInitialTicTac(0);
  assert.equal(game.turn, "X");
  assert.equal(game.board.every((c) => c === null), true);

  // Test victory detection: top row [0, 1, 2]
  const winBoard = ["X", "X", "X", null, "O", "O", null, null, null];
  const winResult = checkTicTacResult(winBoard as any);
  assert.equal(winResult.winner, "X");
  assert.deepEqual(winResult.winningLine, [0, 1, 2]);

  // Test AI defensive block:
  // Player has 0 and 1, AI should block index 2
  let simState = createInitialTicTac(0);
  simState = makeTicTacMove(simState, 0); // X moves 0
  simState.turn = "X"; // force set for testing player moves
  simState = makeTicTacMove(simState, 1); // X moves 1
  simState.turn = "O"; // AI turn

  const aiBlocked = makeTicTacAIMove(simState);
  assert.equal(aiBlocked.board[2], "O");

  // Reward calculation
  const victoryState = { ...simState, winner: "X" as const, streak: 3 };
  const reward = calculateTicTacReward(victoryState, 2.0);
  assert.ok(reward > 0);
});

test("Word Games: verifies 2-8 char words, chessboard grid, and Cambodia hints", async () => {
  const {
    WORD_FLASH_POOL,
    GUESS_FASTER_POOL,
    COUNTRY_HINTS_LIST,
    generateChessboardGrid,
    checkRow5Winner,
    getRow5AIMove,
  } = await import("../src/lib/games/wordGames.js");

  // Verify pool has words with lengths spanning 2 to 8
  const lengths = new Set(WORD_FLASH_POOL.map((w) => w.charCount));
  for (let len = 2; len <= 8; len++) {
    assert.ok(lengths.has(len), `Missing word length ${len}`);
  }

  // Verify chessboard grid generation
  const grid = generateChessboardGrid("CAMBODIA", 16);
  assert.equal(grid.length, 16);
  const chars = grid.map((t) => t.char);
  for (const c of "CAMBODIA") {
    assert.ok(chars.includes(c));
  }

  // Verify Guess Faster pool includes "YOU"
  const hasYou = GUESS_FASTER_POOL.some((item) => item.word === "YOU");
  assert.ok(hasYou, "Guess Faster pool must include word 'YOU'");

  // Verify Country Hints start with Cambodia
  assert.equal(COUNTRY_HINTS_LIST[0].country, "CAMBODIA");
  assert.ok(COUNTRY_HINTS_LIST[0].hint.includes("Angkor Wat"));

  // Verify 5-in-a-row (Row 5 Winner) detection
  const board = Array(64).fill(null);
  // Horizontal 5-in-a-row on row 2: indices 16, 17, 18, 19, 20
  [16, 17, 18, 19, 20].forEach((idx) => {
    board[idx] = "X";
  });
  const winCheck = checkRow5Winner(board, 8);
  assert.equal(winCheck.winner, "X");
  assert.equal(winCheck.winningCells.length, 5);

  // Verify AI blocks 4-in-a-row
  const blockBoard = Array(64).fill(null);
  [0, 1, 2, 3].forEach((idx) => {
    blockBoard[idx] = "X";
  });
  const aiMove = getRow5AIMove(blockBoard, 8);
  assert.equal(aiMove, 4, "AI should block 5th cell at index 4");
});

