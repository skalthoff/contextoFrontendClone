# Contexto Frontend Clone

A fully functional clone of the Contexto word game that uses the original Contexto API endpoints.

## Features

- Complete gameplay matching the original Contexto
- Uses official Contexto API (https://api.contexto.me)
- Local state persistence
- Daily game tracking
- Tip system
- Guess history with visual feedback
- Responsive design

## How to Run

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to:
   ```
   http://localhost:3000
   ```

## How to Play

- Type a word and press Enter to make a guess
- The closer your word is to the secret word, the lower the number
- The secret word is #0
- Words are ranked by semantic similarity using AI
- You have unlimited guesses
- Use tips if you get stuck

## API Integration

This clone uses the official Contexto API endpoints:
- Game initialization: `https://api.contexto.me/machado/en/game/{gameId}`
- Word checking: `https://api.contexto.me/machado/en/game/{gameId}/{word}`
- Tips: `https://api.contexto.me/machado/en/tip/{gameId}`

## Notes

- Game ID is calculated based on days since February 23, 2022
- Progress is saved to localStorage
- The game resets daily automatically
