export type TicTacMark = "X" | "O";

export interface TicTacState {
  board: Array<TicTacMark | null>; // 9 cells (3x3 grid)
  turn: TicTacMark;
  winner: TicTacMark | null;
  winningLine: number[] | null;
  isDraw: boolean;
  baseReward: number;
  streak: number;
}

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

export function createInitialTicTac(streak = 0): TicTacState {
  return {
    board: Array(9).fill(null),
    turn: "X",
    winner: null,
    winningLine: null,
    isDraw: false,
    baseReward: 40,
    streak,
  };
}

export function checkTicTacResult(board: Array<TicTacMark | null>): {
  winner: TicTacMark | null;
  winningLine: number[] | null;
  isDraw: boolean;
} {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line, isDraw: false };
    }
  }

  const isFull = board.every((cell) => cell !== null);
  return { winner: null, winningLine: null, isDraw: isFull };
}

export function makeTicTacMove(state: TicTacState, cellIndex: number): TicTacState {
  if (state.winner || state.isDraw || state.board[cellIndex] !== null) {
    return state;
  }

  const nextBoard = [...state.board];
  nextBoard[cellIndex] = state.turn;

  const result = checkTicTacResult(nextBoard);
  const nextTurn: TicTacMark = state.turn === "X" ? "O" : "X";
  const nextStreak = result.winner === "X" ? state.streak + 1 : result.winner === "O" ? 0 : state.streak;

  return {
    ...state,
    board: nextBoard,
    turn: nextTurn,
    winner: result.winner,
    winningLine: result.winningLine,
    isDraw: result.isDraw,
    streak: nextStreak,
  };
}

export function makeTicTacAIMove(state: TicTacState): TicTacState {
  if (state.winner || state.isDraw || state.turn !== "O") {
    return state;
  }

  const emptyIndices = state.board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (emptyIndices.length === 0) return state;

  // 1. Can AI ("O") win immediately in this move?
  for (const idx of emptyIndices) {
    const testBoard = [...state.board];
    testBoard[idx] = "O";
    if (checkTicTacResult(testBoard).winner === "O") {
      return makeTicTacMove(state, idx);
    }
  }

  // 2. Can Player ("X") win next turn? Block it!
  for (const idx of emptyIndices) {
    const testBoard = [...state.board];
    testBoard[idx] = "X";
    if (checkTicTacResult(testBoard).winner === "X") {
      return makeTicTacMove(state, idx);
    }
  }

  // 3. Take Center if open
  if (state.board[4] === null) {
    return makeTicTacMove(state, 4);
  }

  // 4. Take Corners
  const corners = [0, 2, 6, 8].filter((i) => state.board[i] === null);
  if (corners.length > 0) {
    const chosenCorner = corners[Math.floor(Math.random() * corners.length)];
    return makeTicTacMove(state, chosenCorner);
  }

  // 5. Random empty cell
  const randomCell = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  return makeTicTacMove(state, randomCell);
}

export function calculateTicTacReward(state: TicTacState, multiplier = 1.0): number {
  if (state.winner === "X") {
    const streakBonus = Math.min(5, state.streak) * 10;
    return Math.round((state.baseReward + streakBonus) * multiplier);
  }
  if (state.isDraw) {
    return Math.round(15 * multiplier);
  }
  return 0;
}
