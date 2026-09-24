export type PieceColor = "w" | "b";
export type PieceType = "p" | "n" | "q" | "k" | "r";

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export interface ChessGameState {
  board: Array<ChessPiece | null>; // 25 squares (5x5 grid)
  selectedSquare: number | null;
  legalMovesForSelected: number[];
  turn: PieceColor;
  winner: PieceColor | "draw" | null;
  moveHistory: Array<{ from: number; to: number; piece: ChessPiece }>;
  baseReward: number;
}

// 5x5 Grid indices:
// 00 01 02 03 04 (Rank 5 - Black backline)
// 05 06 07 08 09 (Rank 4)
// 10 11 12 13 14 (Rank 3)
// 15 16 17 18 19 (Rank 2)
// 20 21 22 23 24 (Rank 1 - White backline)

export function createInitialChessBoard(): ChessGameState {
  const board: Array<ChessPiece | null> = Array(25).fill(null);

  // Black pieces (top)
  board[2] = { color: "b", type: "k" }; // Black King at 2 (C5)
  board[1] = { color: "b", type: "p" }; // Black Pawn at 1
  board[3] = { color: "b", type: "p" }; // Black Pawn at 3

  // White pieces (bottom)
  board[22] = { color: "w", type: "k" }; // White King at 22 (C1)
  board[20] = { color: "w", type: "n" }; // White Knight at 20 (A1)
  board[24] = { color: "w", type: "q" }; // White Queen at 24 (E1)
  board[17] = { color: "w", type: "p" }; // White Pawn at 17 (C2)

  return {
    board,
    selectedSquare: null,
    legalMovesForSelected: [],
    turn: "w",
    winner: null,
    moveHistory: [],
    baseReward: 120,
  };
}

export function getLegalMoves(board: Array<ChessPiece | null>, from: number): number[] {
  const piece = board[from];
  if (!piece) return [];

  const moves: number[] = [];
  const row = Math.floor(from / 5);
  const col = from % 5;

  const isValid = (r: number, c: number) => r >= 0 && r < 5 && c >= 0 && c < 5;

  if (piece.type === "p") {
    // Pawn moves
    const dir = piece.color === "w" ? -1 : 1;
    const nextRow = row + dir;

    // Forward 1 step
    if (isValid(nextRow, col) && board[nextRow * 5 + col] === null) {
      moves.push(nextRow * 5 + col);
    }
    // Diagonal captures
    for (const dCol of [-1, 1]) {
      const targetCol = col + dCol;
      if (isValid(nextRow, targetCol)) {
        const target = board[nextRow * 5 + targetCol];
        if (target && target.color !== piece.color) {
          moves.push(nextRow * 5 + targetCol);
        }
      }
    }
  } else if (piece.type === "n") {
    // Knight moves
    const deltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of deltas) {
      const nr = row + dr;
      const nc = col + dc;
      if (isValid(nr, nc)) {
        const target = board[nr * 5 + nc];
        if (!target || target.color !== piece.color) {
          moves.push(nr * 5 + nc);
        }
      }
    }
  } else if (piece.type === "q") {
    // Queen moves (orthogonal + diagonal)
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    for (const [dr, dc] of directions) {
      let step = 1;
      while (true) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        if (!isValid(nr, nc)) break;
        const target = board[nr * 5 + nc];
        if (!target) {
          moves.push(nr * 5 + nc);
        } else {
          if (target.color !== piece.color) {
            moves.push(nr * 5 + nc);
          }
          break;
        }
        step++;
      }
    }
  } else if (piece.type === "k") {
    // King moves (1 step all directions)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (isValid(nr, nc)) {
          const target = board[nr * 5 + nc];
          if (!target || target.color !== piece.color) {
            moves.push(nr * 5 + nc);
          }
        }
      }
    }
  }

  return moves;
}

export function makeChessMove(state: ChessGameState, from: number, to: number): ChessGameState {
  if (state.winner) return state;

  const piece = state.board[from];
  if (!piece || piece.color !== state.turn) return state;

  const legal = getLegalMoves(state.board, from);
  if (!legal.includes(to)) return state;

  const nextBoard = [...state.board];
  const capturedPiece = nextBoard[to];
  nextBoard[to] = piece;
  nextBoard[from] = null;

  // Pawn promotion (reaches opposite end)
  if (piece.type === "p") {
    const endRow = piece.color === "w" ? 0 : 4;
    if (Math.floor(to / 5) === endRow) {
      nextBoard[to] = { color: piece.color, type: "q" };
    }
  }

  // Check victory condition (Black King captured)
  let winner: PieceColor | "draw" | null = state.winner;
  if (capturedPiece?.type === "k") {
    winner = piece.color;
  }

  const nextTurn: PieceColor = state.turn === "w" ? "b" : "w";

  return {
    ...state,
    board: nextBoard,
    selectedSquare: null,
    legalMovesForSelected: [],
    turn: nextTurn,
    winner,
    moveHistory: [...state.moveHistory, { from, to, piece }],
  };
}

// Simple AI response for black in mini-chess
export function makeAIMove(state: ChessGameState): ChessGameState {
  if (state.winner || state.turn !== "b") return state;

  // Find all black pieces
  const blackMoves: Array<{ from: number; to: number; score: number }> = [];

  state.board.forEach((piece, from) => {
    if (piece && piece.color === "b") {
      const legals = getLegalMoves(state.board, from);
      legals.forEach((to) => {
        const target = state.board[to];
        let score = 0;
        if (target) {
          if (target.type === "k") score = 1000;
          else if (target.type === "q") score = 90;
          else if (target.type === "n") score = 30;
          else if (target.type === "p") score = 10;
        }
        blackMoves.push({ from, to, score });
      });
    }
  });

  if (blackMoves.length === 0) {
    // Black has no moves, White wins
    return { ...state, winner: "w" };
  }

  // Pick highest scoring move or random
  blackMoves.sort((a, b) => b.score - a.score);
  const bestMove = blackMoves[0];

  return makeChessMove(state, bestMove.from, bestMove.to);
}
