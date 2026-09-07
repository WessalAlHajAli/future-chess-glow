# Radiant Chess

Create a complete functional 3D AI Chess web game using React, TypeScript, Three.js or React Three Fiber, and chess.js.

I want you to build the actual working application, not just a visual mockup.

The main visual style should be inspired by the attached reference images:

- Premium dark futuristic interface

- Realistic 3D chess pieces

- Polished black metallic pieces

- Ivory/white pieces

- Soft golden glow behind the chess pieces and around the board

- Cinematic premium gaming atmosphere

- Minimal and elegant UI

IMPORTANT CHESSBOARD REQUIREMENT:

The chessboard MUST be perfectly straight and front-facing.

Do NOT use:

- Tilted perspective

- Diagonal board

- Isometric perspective

- Rotated board

- Slanted board

The board must look like a normal square chessboard viewed directly from the front/top, while still having realistic 3D depth and 3D chess pieces.

Create an 8x8 chessboard with:

- Dark charcoal squares

- Warm ivory/gold squares

- Premium beveled frame

- Subtle glowing golden border

- Soft ambient glow behind the board

- Realistic shadows and reflections

3D CHESS PIECES:

Use realistic 3D chess pieces with polished materials.

The pieces should have:

- Realistic 3D geometry

- Smooth surfaces

- Metallic or glossy materials

- Soft shadows

- Subtle rim lighting

- A soft glow around the pieces without making them look neon

The black pieces should be dark metallic charcoal.

The white pieces should be ivory/pearl white with subtle warm reflections.

APPLICATION FEATURES:

Build a real playable chess game against an AI opponent.

Implement:

- Click-to-select pieces

- Legal move validation

- Valid move indicators

- Smooth piece movement animations

- Capturing pieces

- Check detection

- Checkmate detection

- Stalemate detection

- Castling

- En passant

- Pawn promotion

- Move history

- Undo

- New Game

- Resign

- Restart game

AI OPPONENT:

Add difficulty levels:

- Easy

- Medium

- Hard

- Master

The AI should make a move after the player moves.

Use a modular AI system so a chess engine such as Stockfish can be integrated later.

If Stockfish is possible in the browser, implement it using a Web Worker to avoid blocking the UI.

USER INTERFACE:

Create a premium responsive layout.

Desktop:

- Large centered straight chessboard

- Player information on the left

- AI opponent information on the right

- Game controls below the board

Player panel:

- Avatar

- Name: You

- ELO rating

- Chess clock

- Current turn

AI panel:

- AI avatar

- Name: AI Master

- ELO rating

- Chess clock

- Difficulty

Additional panels:

- Move history

- Captured pieces

- Game information

- Evaluation score

Bottom controls:

- New Game

- Undo

- Hint

- Settings

- Resign

VISUAL DESIGN:

Use a dark premium theme:

- Deep charcoal background

- Black glassmorphism panels

- Champagne gold primary accent

- Very subtle blue/violet atmospheric glow

- Warm white typography

- Soft gray secondary text

Use:

- Glassmorphism

- Subtle borders

- Premium spacing

- Rounded corners

- Smooth animations

- Hover states

- Micro-interactions

RESPONSIVE DESIGN:

On mobile:

- Keep the chessboard perfectly square

- Keep the board as the main focus

- Move side panels into collapsible sections or bottom sheets

- Make all controls touch-friendly

TECHNICAL REQUIREMENTS:

Use:

- React

- TypeScript

- Three.js or React Three Fiber

- chess.js

- CSS or Tailwind CSS

- Modular reusable components

Create components such as:

- ChessGame

- ChessBoard

- ChessPiece3D

- PlayerPanel

- AIOpponentPanel

- MoveHistory

- CapturedPieces

- GameControls

- SettingsModal

Start by building the complete working application and make sure the chess game is functional before adding advanced visual polish.

Prioritize:

1. Functional chess gameplay

2. Straight front-facing 3D chessboard

3. High-quality 3D chess pieces

4. Soft glow behind the pieces and board

5. Premium dark futuristic UI

6. Responsive design

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://future-chess-glow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/876dcc1c-5df2-4c30-9be7-301d417b4089).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
