import { GameState, Code, PlayerCode, PlayerColor, CandidateCode, Color } from './types.js';
import { generateOptimalGuesses, generateAllPossibleGuesses } from './game-logic.js';
import { renderGame } from './renderer.js';
import { serializePuzzle, deserializePuzzle, getCurrentPuzzleData } from './puzzle-serializer.js';

class Game {
  private state: GameState;
  private playerInputColors: PlayerCode;
  private candidateColors: CandidateCode;
  private advancedMode: boolean;

  constructor() {
    this.state = this.initializeGameFromURL();
    this.playerInputColors = [null, null, null, null];
    this.candidateColors = [new Set(), new Set(), new Set(), new Set()];
    this.advancedMode = this.loadAdvancedModeSetting();
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
      const deserializedPuzzle = deserializePuzzle(puzzleParam);
      if (deserializedPuzzle) {
        const { puzzleData, validationWarning } = deserializedPuzzle;
        console.log('Loaded puzzle from URL:', puzzleData);

        if (validationWarning) {
          this.showWarning(validationWarning);
        } else {
          this.clearWarning();
        }

        return {
          secret: puzzleData.secret,
          pastGuesses: puzzleData.pastGuesses,
          playerGuess: null,
          gameEnded: false,
          playerWon: false
        };
      } else {
        this.showWarning('Invalid puzzle URL: The puzzle data is corrupted or in an unrecognized format. A new puzzle has been generated instead.');
      }
    }

    // Fallback to generating a new puzzle
    return this.initializeGame();
  }

  private setupEventListeners(): void {
    const submitButton = document.getElementById('submit-button');
    const newGameButton = document.getElementById('new-game-button');
    const shareLink = document.getElementById('share-link');

    submitButton?.addEventListener('click', () => this.submitGuess());
    newGameButton?.addEventListener('click', () => this.startNewGame());
    shareLink?.addEventListener('click', (e) => this.handleShareLinkClick(e));
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

  private async handleShareLinkClick(e: MouseEvent): Promise<void> {
    // Only handle left clicks (button 0), let right-click and middle-click work normally
    if (e.button !== 0) return;

    // Prevent default link navigation for left clicks only
    e.preventDefault();

    const shareLink = e.target as HTMLAnchorElement;
    const shareUrl = shareLink.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show temporary feedback
      const originalText = shareLink.textContent;
      shareLink.textContent = 'Copied!';
      shareLink.style.background = '#4CAF50';
      setTimeout(() => {
        shareLink.textContent = originalText;
        shareLink.style.background = '#FF9800';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: show the URL in an alert
      alert(`Copy this URL to share the puzzle: ${shareUrl}`);
    }
  }

  private updateShareLink(): void {
    const puzzleData = getCurrentPuzzleData(this.state.secret, this.state.pastGuesses);
    const serialized = serializePuzzle(puzzleData);
    const url = new URL(window.location.href);
    url.searchParams.set('puzzle', serialized);
    const shareUrl = url.toString();

    const shareLink = document.getElementById('share-link') as HTMLAnchorElement;
    if (shareLink) {
      shareLink.href = shareUrl;
    }
  }

  private startNewGame(): void {
    // Clear URL params and generate new puzzle
    window.history.pushState({}, '', window.location.pathname);
    this.state = this.initializeGame();
    this.playerInputColors = [null, null, null, null];
    this.candidateColors = [new Set(), new Set(), new Set(), new Set()];
    this.clearWarning();
    // Keep the current advanced mode setting instead of resetting to false
    this.render();
  }

  private loadAdvancedModeSetting(): boolean {
    const saved = localStorage.getItem('mastermind-advanced-mode');
    return saved === 'true';
  }

  private saveAdvancedModeSetting(): void {
    localStorage.setItem('mastermind-advanced-mode', this.advancedMode.toString());
  }

  private toggleAdvancedMode(): void {
    this.advancedMode = !this.advancedMode;
    this.saveAdvancedModeSetting();
    this.render();
  }

  private updateCandidates(index: number, color: Color, checked: boolean): void {
    if (checked) {
      this.candidateColors[index].add(color);
    } else {
      this.candidateColors[index].delete(color);
    }

    // Only set a selection when exactly one candidate is selected
    if (this.candidateColors[index].size === 1) {
      this.playerInputColors[index] = Array.from(this.candidateColors[index])[0];
    } else {
      // Clear selection if 0 or more than 1 candidates
      this.playerInputColors[index] = null;
    }

    this.render();
  }

  private showWarning(message: string): void {
    let warningDiv = document.getElementById('warning');
    if (!warningDiv) {
      warningDiv = document.createElement('div');
      warningDiv.id = 'warning';
      warningDiv.className = 'warning';
      const gameContainer = document.querySelector('.game-container');
      const gameBoard = document.getElementById('game-board');
      gameContainer?.insertBefore(warningDiv, gameBoard);
    }
    warningDiv.textContent = message;
    warningDiv.style.display = 'block';
  }

  private clearWarning(): void {
    const warningDiv = document.getElementById('warning');
    if (warningDiv) {
      warningDiv.style.display = 'none';
    }
  }

  private render(): void {
    renderGame(
      this.state,
      this.playerInputColors,
      this.candidateColors,
      this.advancedMode,
      (index: number, color: PlayerColor) => {
        this.playerInputColors[index] = color;
        // Update candidates when dropdown changes
        if (color !== null) {
          this.candidateColors[index].clear();
          this.candidateColors[index].add(color);
        } else {
          this.candidateColors[index].clear();
        }
        this.render();
      },
      (index: number, color: Color, checked: boolean) => {
        this.updateCandidates(index, color, checked);
      },
      () => this.toggleAdvancedMode()
    );

    // Update the share link with current puzzle state
    this.updateShareLink();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});