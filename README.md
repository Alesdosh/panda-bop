## Path Tracer - Interactive Drag & Trace Game

An engaging path-tracing puzzle game built for Reddit using Phaser.js and Devvit. Players must precisely drag interactive buttons along predefined paths to complete challenges.

## What is Path Tracer?

Path Tracer is a skill-based puzzle game where players drag circular buttons along various geometric paths. Each button must be traced from start to finish following the exact path shape - whether it's a heart, spiral, zigzag, or circle. The game combines precision, timing, and visual coordination to create an addictive gameplay experience.

## What Makes This Game Innovative?

- **Sequential Movement System**: Unlike typical drag games, Path Tracer enforces sequential movement - you can't skip ahead or jump around the path. You must follow the route step by step.
- **Dynamic Path Variety**: Features 8 different path types including hearts, spirals, zigzags, circles, S-curves, and more, each with unique tracing challenges.
- **Precision-Based Gameplay**: Advanced tolerance system that requires accuracy while still being forgiving enough for mobile play.
- **Visual Feedback System**: Real-time progress visualization with glowing effects, particle systems, and completion animations.
- **Adaptive Difficulty**: Configurable tolerance levels and failure timeouts allow for both casual and precision gameplay modes.
- **Responsive Design**: Fully mobile-optimized with touch controls and automatic scaling for all screen sizes.
- **Reddit Integration**: Seamlessly runs within Reddit posts, allowing for community challenges and leaderboards.

## How to Play

### Basic Controls
1. **Start**: Tap and hold the blue circular button at the green start point
2. **Trace**: Drag your finger/cursor along the white path line
3. **Stay on Path**: Keep within the path boundaries - straying too far will cause failure
4. **Complete**: Reach the red end point to successfully complete the path

### Game Rules
- **Sequential Movement**: You must follow the path in order - no skipping ahead
- **Tolerance Zone**: Stay within the invisible tolerance area around the path (varies by difficulty)
- **Failure Conditions**: 
  - Releasing your finger/cursor before completing the path
  - Staying off the path for too long (200-300ms timeout)
  - Moving too far backward along the path
- **Success**: Reach 98% completion of the path to trigger success effects

### Path Types You'll Encounter
- **Heart**: Romantic heart shape requiring smooth curved movements
- **Spiral**: Expanding circular motion from center outward
- **Zigzag**: Sharp angular movements testing direction changes
- **Circle**: Perfect circular tracing for steady hand control
- **S-Curve**: Flowing S-shaped path for fluid motion
- **Straight Line**: Simple horizontal movement (deceptively challenging)
- **Curved Up/Down**: Arcing paths testing smooth curve following

### Visual Indicators
- **Green Circle**: Start point - begin tracing here
- **Red Circle**: End point - your target destination  
- **White Path**: The route you must follow
- **Blue Progress**: Shows your completed portion of the path
- **Glowing Effects**: Indicate successful movement and completion

### Tips for Success
1. **Start Slow**: Begin with gentle, controlled movements
2. **Stay Centered**: Aim for the middle of the path line
3. **Smooth Motion**: Avoid jerky or rapid movements
4. **Mobile Users**: Use your finger tip, not thumb, for better precision
5. **Practice**: Each path type has its own rhythm - learn the patterns

## Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for immersive games
- [Phaser.js](https://phaser.io/): 2D game engine with WebGL rendering
- [Vite](https://vite.dev/): Fast build tool for client compilation
- [Express](https://expressjs.com/): Backend API server
- [TypeScript](https://www.typescriptlang.org/): Type-safe development

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=phaser`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

## Credits

Thanks to the Phaser team for [providing a great template](https://github.com/phaserjs/template-vite-ts)!
