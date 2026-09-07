# Future Chess Glow

Future Chess Glow is a premium 3D AI-powered chess web application that combines classic chess gameplay with a futuristic, cinematic gaming experience. The application features a straight front-facing 3D chessboard, realistic polished chess pieces, smooth animations, and a dark glassmorphism interface enhanced with subtle golden and atmospheric lighting.

The project focuses on combining functional chess gameplay with high-quality 3D visuals and a modern responsive user experience.

## Key Features

* Fully playable chess game against an AI opponent
* Multiple AI difficulty levels: Easy, Medium, Hard, and Master
* Legal move validation and chess game-state management
* Check, checkmate, and stalemate detection
* Castling, en passant, and pawn promotion
* Move history and captured pieces
* Undo, restart, new game, hint, and resign controls
* Chess clocks for the player and AI
* Evaluation score and game information
* Smooth piece movement and capture animations
* Realistic 3D chess pieces with metallic and ivory materials
* Straight, front-facing 8×8 chessboard
* Responsive desktop and mobile interface

## Design

The visual direction is inspired by premium futuristic gaming interfaces, combining:

* Deep charcoal backgrounds
* Black glassmorphism panels
* Champagne-gold accents
* Dark metallic chess pieces
* Ivory and pearl-white pieces
* Soft golden glow
* Subtle blue and violet atmospheric lighting
* Realistic shadows and reflections
* Minimal typography and elegant spacing
* Smooth transitions and micro-interactions

A major visual requirement of the project is keeping the chessboard perfectly straight and front-facing. The board does not use tilted, diagonal, isometric, rotated, or slanted perspectives, while the pieces and board still maintain realistic 3D depth.

## Technology

The application is built using:

* React
* TypeScript
* Three.js / React Three Fiber
* chess.js
* CSS / Tailwind CSS
* Web Workers
* Stockfish-ready modular AI architecture

The application uses a modular component structure to separate chess logic, 3D rendering, AI behavior, and interface components.

## Responsive Experience

The interface adapts to desktop, tablet, and mobile screens. On mobile devices, the chessboard remains the main focus and stays perfectly square, while player information, game details, and controls can be organized into collapsible sections or bottom sheets.

## AI Architecture

The AI system is designed to support different difficulty levels and future chess-engine integration. Stockfish can be integrated through a Web Worker so that AI calculations do not block the main interface or affect the smoothness of the 3D experience.

## Project Links

**Live Application:** https://future-chess-glow.lovable.app

## Getting Started

### Installation

```bash
git clone <this-repository-url>
cd <repository-name>
npm install
```

### Development

```bash
npm run dev
```

The application can be developed locally using Node.js and npm.

