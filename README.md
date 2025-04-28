# Shanghai Darts Scorer - Verbier Edition

A web-based scoring application for the dart game Shanghai, with customizable handicap features. Perfect for tracking scores during your Shanghai darts games.

## Features

- **Handicap System**: Set different required points (1-3) per player
- **Real-time Scoring**: Easy-to-use interface for quick score entry
- **Score Tracking**: Visual representation of scores with tally marks
- **Special Wins**: 
  - Shanghai instant win (hitting Single, Double, and Triple in one turn)
  - First to complete all numbers with required points
- **Undo Function**: Mistake recovery with one-click undo
- **Fullscreen Mode**: Toggle between fullscreen and windowed mode
- **Mobile Friendly**: Responsive design works on all devices

## How to Play

1. **Setup**:
   - Add players and set their required points (1-3)
   - Required points determine how many marks needed before moving to next number
   - Default setting is 3 points required

2. **Gameplay**:
   - Players take turns throwing 3 darts
   - Starting at 20, progress through: 20, 19, 18, 17, 16, 15, BULL
   - Must achieve required points before moving to next number
   - Score options:
     - Single (1 point)
     - Double (2 points)
     - Triple (3 points)
     - Miss (0 points)

3. **Winning**:
   - First player to complete all numbers wins
   - Instant win if player hits Single, Double, and Triple in one turn (Shanghai)
   - Game ends immediately when a player completes their BULL requirement

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- No external dependencies
- Fully client-side (no server required)
- Persistent fullscreen state between pages
- Mobile-first responsive design

## Installation

1. Clone the repository: