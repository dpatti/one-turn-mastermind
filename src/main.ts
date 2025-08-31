import { GameState, Code, PlayerCode, PlayerColor } from './types.js';
import { generateOptimalGuesses, generateAllPossibleGuesses } from './game-logic.js';
import { renderGame } from './renderer.js';
import { serializePuzzle, deserializePuzzle, getCurrentPuzzleData } from './puzzle-serializer.js';

class Game {
  private state: GameState;
  private playerInputColors: PlayerCode;

  constructor() {
    this.state = this.initializeGameFromURL();
    this.playerInputColors = [null, null, null, null];
    this.setupEventListeners();
    this.render();
  }

  private initializeGame(): GameState {
    const allPossibleGuesses = generateAllPossibleGuesses();
    const secret = allPossibleGuesses[Math.floor(Math.random() * allPossibleGuesses.length)];
    const pastGuesses = generateOptimalGuesses(secret);

    return {
      secret,
      pastGuesses,
      playerGuess: null,
      gameEnded: false,
      playerWon: false
    };
  }

  private initializeGameFromURL(): GameState {
    const urlParams = new URLSearchParams(window.location.search);
    const puzzleParam = urlParams.get('puzzle');

    if (puzzleParam) {
      const puzzleData = deserializePuzzle(puzzleParam);
      if (puzzleData) {
        console.log('Loaded puzzle from URL:', puzzleData);
        return {
          secret: puzzleData.secret,
          pastGuesses: puzzleData.pastGuesses,
          playerGuess: null,
          gameEnded: false,
          playerWon: false
        };
      }
    }

    // Fallback to generating a new puzzle
    return this.initializeGame();
  }

  private setupEventListeners(): void {
    const submitButton = document.getElementById('submit-button');
    const newGameButton = document.getElementById('new-game-button');
    const shareButton = document.getElementById('share-button');

    submitButton?.addEventListener('click', () => this.submitGuess());
    newGameButton?.addEventListener('click', () => this.startNewGame());
    shareButton?.addEventListener('click', () => this.sharePuzzle());
  }

  private submitGuess(): void {
    if (this.state.gameEnded) return;

    // Check if all positions are filled
    if (this.playerInputColors.some(color => color === null)) {
      return; // Button should be disabled, so this shouldn't happen
    }

    // Convert PlayerCode to Code for submission
    const playerGuess = this.playerInputColors as Code;
    this.state.playerGuess = [...playerGuess];
    this.state.gameEnded = true;

    const isCorrect = playerGuess.every((color, index) =>
      color === this.state.secret[index]
    );

    this.state.playerWon = isCorrect;
    this.render();
  }

  private async sharePuzzle(): Promise<void> {
    const puzzleData = getCurrentPuzzleData(this.state.secret, this.state.pastGuesses);
    const serialized = serializePuzzle(puzzleData);
    const url = new URL(window.location.href);
    url.searchParams.set('puzzle', serialized);
    const shareUrl = url.toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show temporary feedback
      const shareButton = document.getElementById('share-button') as HTMLButtonElement;
      if (shareButton) {
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Copied!';
        shareButton.style.background = '#4CAF50';
        setTimeout(() => {
          shareButton.textContent = originalText;
          shareButton.style.background = '#FF9800';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: show the URL in an alert
      alert(`Copy this URL to share the puzzle: ${shareUrl}`);
    }
  }

  private startNewGame(): void {
    // Clear URL params and generate new puzzle
    window.history.pushState({}, '', window.location.pathname);
    this.state = this.initializeGame();
    this.playerInputColors = [null, null, null, null];
    this.render();
  }

  private render(): void {
    renderGame(this.state, this.playerInputColors, (index: number, color: PlayerColor) => {
      this.playerInputColors[index] = color;
      this.render();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});