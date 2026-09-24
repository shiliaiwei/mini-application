export interface MissionState {
  gridSize: number; // 4 for 4x4
  targetCells: number[]; // indices of cells required to fill
  filledCells: number[]; // indices user has filled
  movesLeft: number;
  maxMoves: number;
  isComplete: boolean;
  isFailed: boolean;
  baseReward: number;
}

export function generateMission(gridSize = 4, targetCount = 6): MissionState {
  const totalCells = gridSize * gridSize;
  const indices: number[] = Array.from({ length: totalCells }, (_, i) => i);
  // Shuffle indices deterministically or randomly
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const targetCells = indices.slice(0, Math.min(targetCount, totalCells)).sort((a, b) => a - b);
  const maxMoves = targetCount + 5;

  return {
    gridSize,
    targetCells,
    filledCells: [],
    movesLeft: maxMoves,
    maxMoves,
    isComplete: false,
    isFailed: false,
    baseReward: 75,
  };
}

export function toggleMissionCell(state: MissionState, cellIndex: number): MissionState {
  if (state.isComplete || state.isFailed || state.movesLeft <= 0) {
    return state;
  }

  const isAlreadyFilled = state.filledCells.includes(cellIndex);
  const nextFilled = isAlreadyFilled
    ? state.filledCells.filter((i) => i !== cellIndex)
    : [...state.filledCells, cellIndex];

  const movesLeft = state.movesLeft - 1;
  const isComplete = checkMissionVictory({ ...state, filledCells: nextFilled });
  const isFailed = !isComplete && movesLeft <= 0;

  return {
    ...state,
    filledCells: nextFilled,
    movesLeft,
    isComplete,
    isFailed,
  };
}

export function checkMissionVictory(state: MissionState): boolean {
  if (state.targetCells.length === 0) return false;
  return state.targetCells.every((cell) => state.filledCells.includes(cell));
}

export function calculateMissionReward(state: MissionState, multiplier = 1.0): number {
  if (!state.isComplete) return 0;
  const bonus = state.movesLeft * 5;
  return Math.round((state.baseReward + bonus) * multiplier);
}
