# Jeopardy Game Flow Documentation

## Overview

This Jeopardy game application allows users to create game sessions, set up teams, select question sets, and play a festive trivia game perfect for Christmas and New Year parties. The application uses a two-phase approach: **Setup** and **Play**.

## Game Flow

```
┌─────────────────────┐
│   Home Page         │
│   Create Session    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Setup Page        │
│   /game-session/[id]│
│                     │
│   1. Create Teams   │
│   2. Select Q Set   │
│   3. Start Game      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Play Page         │
│   /game-session/    │
│   [id]/play         │
│                     │
│   (Gameplay UI)     │
└─────────────────────┘
```

## Detailed Flow

### Phase 1: Setup (`/game-session/[gameSessionId]`)

The setup page allows the game host to configure the game before starting.

#### Step 1: Create Teams

- Users can create multiple teams by entering team names
- Each team starts with 0 points
- Teams are displayed in a card grid with their current points
- At least one team must be created before the game can start

#### Step 2: Select Question Set

- Three question sets are available:
  - **Christmas Set**: Festive Christmas-themed questions
  - **New Year Set**: New Year celebration questions
  - **General Knowledge Set**: General trivia questions
- Each set contains 5 questions with point values: 100, 200, 300, 400, 500
- Only one question set can be selected per game session
- Selected set is highlighted with a checkmark

#### Step 3: Start Game

- "Start Game" button is enabled only when:
  - ✅ At least one team exists
  - ✅ A question set is selected
- When clicked:
  - Creates question documents in the database
  - Links questions to the game session
  - Sets `isStarted: true` on the game session
  - Navigates to the play page

### Phase 2: Play (`/game-session/[gameSessionId]/play`)

The play page is where the actual game takes place (currently a placeholder).

**Current Features:**

- Displays game status
- Shows teams leaderboard sorted by points
- Displays question count

**Future Features (To Be Implemented):**

- Question board display
- Question selection by teams
- Answer submission
- Score tracking
- Question state management

## Database Schema

### `gameSessions` Table

```typescript
{
  _id: Id<"gameSessions">
  createdAt: number
  questions: Id<"questions">[]  // Array of question IDs
  isStarted: boolean              // Whether game has started
  selectedQuestionSet?: string    // ID of selected question set
}
```

### `teams` Table

```typescript
{
  _id: Id<"teams">;
  name: string;
  points: number;
  gameSessionId: Id<"gameSessions">;
}
```

- Index: `by_gameSession` on `["gameSessionId"]`

### `questions` Table

```typescript
{
  _id: Id<"questions">
  text: string                    // Question text
  answer: string                 // Correct answer
  points: 100 | 200 | 300 | 400 | 500
  answeredByTeamId?: Id<"teams"> // Team that answered correctly
  selectedByTeamId?: Id<"teams"> // Team that selected/buzzed in
  gameSessionId: Id<"gameSessions">
}
```

- Index: `by_gameSession` on `["gameSessionId"]`

## API Functions

### Queries

#### `getQuestionSets`

Returns available question sets for selection.

- **Returns**: Array of question set objects
- **Question Set Structure**:
  ```typescript
  {
    id: string;
    name: string;
    description: string;
    questions: Array<{
      text: string;
      answer: string;
      points: 100 | 200 | 300 | 400 | 500;
    }>;
  }
  ```

#### `getGameSetup`

Retrieves setup data for a game session.

- **Args**: `{ gameSessionId: string }`
- **Returns**: Game session with teams array
- **Use Case**: Setup page to display current configuration

#### `getGameSession`

Retrieves full game session data including teams.

- **Args**: `{ gameSessionId: string }`
- **Returns**: Game session with teams array
- **Use Case**: Play page to display game state

#### `listGameSessions`

Lists all game sessions.

- **Returns**: Array of all game sessions
- **Use Case**: Home page to display available sessions

### Mutations

#### `createGameSession`

Creates a new game session.

- **Returns**: `gameSessionId`
- **Initial State**:
  - `isStarted: false`
  - `questions: []`
  - `selectedQuestionSet: undefined`

#### `createTeam`

Creates a new team for a game session.

- **Args**: `{ name: string, gameSessionId: Id<"gameSessions"> }`
- **Initial State**: `points: 0`

#### `selectQuestionSet`

Selects a question set for the game session.

- **Args**: `{ gameSessionId: Id<"gameSessions">, questionSetId: string }`
- **Updates**: `selectedQuestionSet` field

#### `startGame`

Starts the game by creating question documents.

- **Args**: `{ gameSessionId: Id<"gameSessions"> }`
- **Validations**:
  - At least one team must exist
  - Question set must be selected
- **Actions**:
  - Creates question documents from selected set
  - Links questions to game session
  - Sets `isStarted: true`
  - Updates `questions` array with question IDs

## Routes and Pages

### `/` - Home Page

- Lists all game sessions
- Button to create new game session
- Navigates to setup page after creation

### `/game-session/[gameSessionId]` - Setup Page

- **Purpose**: Configure game before starting
- **Features**:
  - Team creation interface
  - Question set selection
  - Setup progress indicators
  - Start game button
- **Redirects**: Automatically redirects to play page if game already started

### `/game-session/[gameSessionId]/play` - Play Page

- **Purpose**: Gameplay interface (placeholder)
- **Current Features**:
  - Game status display
  - Teams leaderboard
- **Future**: Full gameplay functionality

## Question Sets

### Available Sets

1. **Christmas Set** (`id: "christmas"`)
   - 5 Christmas-themed questions
   - Point values: 100, 200, 300, 400, 500

2. **New Year Set** (`id: "new-year"`)
   - 5 New Year celebration questions
   - Point values: 100, 200, 300, 400, 500

3. **General Knowledge Set** (`id: "general"`)
   - 5 general trivia questions
   - Point values: 100, 200, 300, 400, 500

### Question Structure

Each question follows the standard Jeopardy format:

- **Points**: 100 (easiest) to 500 (hardest)
- **Text**: The question/answer prompt
- **Answer**: The correct response

## State Management

### Game Session States

1. **Setup State** (`isStarted: false`)
   - Teams can be created
   - Question set can be selected
   - Game cannot be played yet

2. **Active State** (`isStarted: true`)
   - Questions are created
   - Game is ready to play
   - Setup page redirects to play page

### Question States (Future Implementation)

- **Available**: `selectedByTeamId: null, answeredByTeamId: null`
- **Selected**: `selectedByTeamId: <teamId>, answeredByTeamId: null`
- **Answered**: `answeredByTeamId: <teamId>`

## Future Gameplay Features

The following features are planned but not yet implemented:

### Question Selection

- Teams select questions from the board
- `selectQuestion` mutation will track selection
- Prevents multiple teams from selecting same question simultaneously

### Answer Submission

- Teams submit answers to selected questions
- `submitAnswer` mutation will:
  - Validate answer correctness
  - Update team points
  - Mark question as answered
  - Handle incorrect answers (allow other teams to try)

### Game Board Display

- Visual representation of questions
- Organized by point values (100-500)
- Color-coded by availability/status

### Real-time Updates

- Live score updates
- Question state changes
- Team turn management

## Error Handling

### Setup Validation

- **No Teams**: Cannot start game without at least one team
- **No Question Set**: Cannot start game without selected question set
- **Already Started**: Setup page redirects if game already started

### Game Session Errors

- **Not Found**: Play page shows error if session doesn't exist
- **Invalid State**: Appropriate error messages for invalid operations

## Design System

The application uses a cozy festive design system with:

- Warm color palette (creams, beiges, festive reds/greens/golds)
- Card-based layouts
- Smooth transitions and hover effects
- Dark mode support

See `DESIGN_SYSTEM.md` for detailed design tokens and usage guidelines.

## Development Notes

### Schema Migrations

When updating the schema:

1. Update `convex/schema.ts`
2. Run `npx convex dev` to regenerate types
3. Update any affected queries/mutations

### Adding Question Sets

To add new question sets:

1. Add to `QUESTION_SETS` array in `convex/myFunctions.ts`
2. Follow the existing structure
3. Ensure all point values (100-500) are represented

### Testing Flow

1. Create game session from home page
2. Navigate to setup page
3. Create at least one team
4. Select a question set
5. Click "Start Game"
6. Verify redirect to play page
7. Check that questions are created in database
