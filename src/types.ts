export type Color = 'R' | 'G' | 'B' | 'Y' | 'O' | 'P';

export type PlayerColor = Color | null;

export type Code = [Color, Color, Color, Color];

export type PlayerCode = [PlayerColor, PlayerColor, PlayerColor, PlayerColor];

export type CandidateColors = Set<Color>;
export type CandidateCode = [CandidateColors, CandidateColors, CandidateColors, CandidateColors];

export interface Feedback {
  black: number;
  white: number;
}

export interface GuessWithFeedback {
  guess: Code;
  feedback: Feedback;
}

export interface GameState {
  secret: Code;
  pastGuesses: GuessWithFeedback[];
  playerGuess: Code | null;
  gameEnded: boolean;
  playerWon: boolean;
}

export interface PuzzleData {
  secret: Code;
  pastGuesses: GuessWithFeedback[];
}

export const COLORS: Color[] = ['R', 'G', 'B', 'Y', 'O', 'P'];

export const COLOR_NAMES: Record<Color, string> = {
  R: 'Red',
  G: 'Green',
  B: 'Blue',
  Y: 'Yellow',
  O: 'Orange',
  P: 'Purple'
};

export const COLOR_STYLES: Record<Color, string> = {
  R: '#f44336',
  G: '#4CAF50',
  B: '#2196F3',
  Y: '#FFEB3B',
  O: '#FF9800',
  P: '#9C27B0'
};