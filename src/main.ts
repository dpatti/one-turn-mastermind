import { GameState, Code, PlayerCode, PlayerColor } from './types.js';
import { generateOptimalGuesses, generateAllPossibleGuesses } from './game-logic.js';
import { renderGame } from './renderer.js';

class Game {
  private state: GameState;
  private playerInputColors: PlayerCode;

  constructor() {
    this.state = this.initializeGame();
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

  private setupEventListeners(): void {
    const submitButton = document.getElementById('submit-button');
    const newGameButton = document.getElementById('new-game-button');

    submitButton?.addEventListener('click', () => this.submitGuess());
    newGameButton?.addEventListener('click', () => this.startNewGame());
  }

  private submitGuess(): void {
    if (this.state.gameEnded) return;

    // Check if all positions are filled
    if (this.playerInputColors.some(color => color === null)) {
      alert('Please select a color for all positions before submitting!');
      return;
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

  private startNewGame(): void {
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