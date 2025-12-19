"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GameSession({
  params,
}: {
  params: Promise<{ gameSessionId: string }>;
}) {
  const { gameSessionId } = use(params);
  const router = useRouter();
  const gameSession = useQuery(api.myFunctions.getGameSetup, {
    gameSessionId,
  });
  const questionSets = useQuery(api.myFunctions.getQuestionSets);
  const createTeam = useMutation(api.myFunctions.createTeam);
  const selectQuestionSet = useMutation(api.myFunctions.selectQuestionSet);
  const startGame = useMutation(api.myFunctions.startGame);
  const [teamName, setTeamName] = useState("");

  const handleCreateTeam = async () => {
    if (!gameSession || !teamName.trim()) return;
    await createTeam({
      name: teamName.trim(),
      gameSessionId: gameSession._id,
    });
    setTeamName("");
  };

  const handleSelectQuestionSet = async (questionSetId: Id<"questionSets">) => {
    if (!gameSession) return;
    await selectQuestionSet({
      gameSessionId: gameSession._id,
      questionSetId: questionSetId,
    });
  };

  const handleStartGame = async () => {
    if (!gameSession) return;
    try {
      await startGame({ gameSessionId: gameSession._id });
      router.push(`/game-session/${gameSessionId}/play`);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert(
        "Failed to start game. Make sure you have at least one team and a question set selected.",
      );
    }
  };

  // Redirect to play page if game has already started
  useEffect(() => {
    if (gameSession?.isStarted) {
      router.push(`/game-session/${gameSessionId}/play`);
    }
  }, [gameSession?.isStarted, router, gameSessionId]);

  if (gameSession === undefined || questionSets === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-festive-red rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-festive-gold rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div
            className="w-3 h-3 bg-festive-green rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <p className="ml-3 text-neutral-600 dark:text-neutral-400 font-medium">
            Loading game session...
          </p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card bg-card-bg text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Game Not Found
          </h1>
        </div>
      </div>
    );
  }

  // Show loading/redirecting state if game has started
  if (gameSession.isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-festive-red rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-festive-gold rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div
            className="w-3 h-3 bg-festive-green rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <p className="ml-3 text-neutral-600 dark:text-neutral-400 font-medium">
            Redirecting to game...
          </p>
        </div>
      </div>
    );
  }

  const hasTeams = gameSession.teams && gameSession.teams.length > 0;
  const hasQuestionSet =
    gameSession.questionsSet !== undefined && gameSession.questionsSet !== null;
  const canStartGame = hasTeams && hasQuestionSet;

  return (
    <div className="h-screen flex flex-col ">
      {/* Header */}
      <header className="sticky shrink-0 flex flex-row justify-between items-center top-0 z-10 bg-card-bg/95 backdrop-blur-md border-b border-card-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 w-full">
          <h1 className="text-3xl font-bold">🎄</h1>
          <h1 className="text-3xl font-bold bg-linear-to-r from-festive-red via-festive-gold to-festive-green bg-clip-text text-transparent">
            Game Setup
          </h1>
          <h1 className="text-3xl font-bold">🎉</h1>
        </div>
        <button className="btn-primary ml-4" onClick={() => router.push(`/`)}>
          Home
        </button>
      </header>

      {/* Main Content */}
      <main className=" mx-auto pt-100">
        <div className="flex flex-col gap-8">
          {/* Setup Progress Card */}
          <div className="card bg-linear-to-br from-warm-cream to-warm-beige dark:from-neutral-800 dark:to-neutral-700 border-festive-gold/20">
            <h2 className="text-xl font-bold text-background mb-4 dark:text-neutral-300">
              Setup Progress
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {hasTeams ? (
                  <span className="text-2xl">✅</span>
                ) : (
                  <span className="text-2xl">⏳</span>
                )}
                <span className="text-neutral-700 dark:text-neutral-300">
                  {hasTeams ? "Teams created" : "Create at least one team"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasQuestionSet ? (
                  <span className="text-2xl">✅</span>
                ) : (
                  <span className="text-2xl">⏳</span>
                )}
                <span className="text-neutral-700 dark:text-neutral-300">
                  {hasQuestionSet
                    ? "Question set selected"
                    : "Select a question set"}
                </span>
              </div>
            </div>
          </div>

          {/* Teams Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="text-festive-gold">⭐</span>
              Teams
            </h2>

            {gameSession?.teams && gameSession.teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameSession.teams.map((team, index) => (
                  <div
                    key={team._id}
                    className="group relative overflow-hidden rounded-lg border-2 border-card-border bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-5 hover:border-festive-gold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-festive-gold/10 dark:bg-festive-gold/20 rounded-bl-full"></div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-festive-red to-festive-gold flex items-center justify-center text-white font-bold shadow-md">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-bold text-foreground dark:text-neutral-300 group-hover:text-festive-red transition-colors">
                        {team.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-card-border rounded-lg">
                <p className="text-neutral-500 dark:text-neutral-800 text-lg mb-2">
                  No teams yet
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-800">
                  Create your first team below!
                </p>
              </div>
            )}
          </div>

          {/* Question Set Selection */}
          <div className="card">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="text-festive-gold">📚</span>
              Select Question Set
            </h2>
            <div className="flex flex-col gap-3">
              {questionSets.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-800 text-lg mb-2">
                  No question sets found
                </p>
              ) : (
                questionSets.map((set) => (
                  <button
                    key={set._id}
                    onClick={() => handleSelectQuestionSet(set._id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all duration-200 dark:bg-neutral-100 ${
                      gameSession.questionsSet === set._id
                        ? "border-festive-gold bg-festive-gold/10 dark:bg-festive-gold/20"
                        : "border-card-border hover:border-festive-gold/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:dark:text-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{set.name}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                          {set.questions.length} questions
                        </p>
                      </div>
                      {gameSession.questionsSet === set._id && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Create Team Section */}
          <div className="card bg-linear-to-br from-festive-red/5 via-festive-gold/5 to-festive-green/5 dark:from-festive-red/10 dark:via-festive-gold/10 dark:to-festive-green/10 border-festive-gold/30">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="text-festive-red">➕</span>
              Create New Team
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTeam();
                  }
                }}
                className="input flex-1"
              />
              <button
                onClick={handleCreateTeam}
                disabled={!teamName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
              >
                Create Team 🎯
              </button>
            </div>
          </div>

          {/* Start Game Button */}
          <div className="card bg-linear-to-br from-festive-green/10 via-festive-gold/10 to-festive-red/10 dark:from-festive-green/20 dark:via-festive-gold/20 dark:to-festive-red/20 border-festive-green/30">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                Ready to Start?
              </h2>
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                🚀 Start Game
              </button>
              {!canStartGame && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Complete setup above to start the game
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
