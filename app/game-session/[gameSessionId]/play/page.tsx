"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export default function PlayPage({
  params,
}: {
  params: Promise<{ gameSessionId: string }>;
}) {
  const { gameSessionId } = use(params);
  const router = useRouter();
  const gameSession = useQuery(api.myFunctions.getGameSession, {
    gameSessionId,
  });
  const questions = useQuery(api.myFunctions.getGameQuestions, {
    gameSessionId,
  });
  const selectQuestion = useMutation(api.myFunctions.selectQuestion);
  const submitAnswer = useMutation(api.myFunctions.submitAnswer);

  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] =
    useState<Id<"questions"> | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Organize questions by category
  const questionsByCategory = useMemo(() => {
    if (!questions) return {};

    const grouped: Record<string, Doc<"questions">[]> = {};
    questions.forEach((q) => {
      if (!grouped[q.category]) {
        grouped[q.category] = [];
      }
      grouped[q.category].push(q);
    });

    // Sort each category by points
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.points - b.points);
    });

    return grouped;
  }, [questions]);

  const categories = useMemo(() => {
    return Object.keys(questionsByCategory).sort();
  }, [questionsByCategory]);

  // Helper function to check if a question is answered by any team
  const isQuestionAnswered = useMemo(() => {
    if (!gameSession?.teams || !questions) return () => false;
    const answeredQuestionIds = new Set<Id<"questions">>();
    gameSession.teams.forEach((team) => {
      team.answeredQuestions.forEach((qId) => answeredQuestionIds.add(qId));
    });
    return (questionId: Id<"questions">) => answeredQuestionIds.has(questionId);
  }, [gameSession?.teams, questions]);

  // Helper function to check if a question is selected by any team
  const isQuestionSelected = useMemo(() => {
    if (!gameSession?.teams || !questions) return () => false;
    const selectedQuestionIds = new Set<Id<"questions">>();
    gameSession.teams.forEach((team) => {
      team.selectedQuestions.forEach((qId) => selectedQuestionIds.add(qId));
    });
    return (questionId: Id<"questions">) => selectedQuestionIds.has(questionId);
  }, [gameSession?.teams, questions]);

  // Check if all questions have been answered
  const isGameOver = useMemo(() => {
    if (!questions || questions.length === 0) return false;
    const checkAnswered = isQuestionAnswered;
    return questions.every((q) => checkAnswered(q._id));
  }, [questions, isQuestionAnswered]);

  // Sort teams by points for leaderboard
  const sortedTeams = useMemo(() => {
    if (!gameSession?.teams) return [];
    return [...gameSession.teams].sort((a, b) => b.points - a.points);
  }, [gameSession?.teams]);

  const currentTeam = gameSession?.teams?.sort((a, b) =>
    a._id.localeCompare(b._id),
  )[currentTeamIndex];

  const handleQuestionClick = async (questionId: Id<"questions">) => {
    if (!currentTeam) return;

    const question = questions?.find((q) => q._id === questionId);
    if (!question) return;

    const checkAnswered = isQuestionAnswered;
    const checkSelected = isQuestionSelected;
    if (checkAnswered(questionId) || checkSelected(questionId)) {
      return;
    }

    try {
      await selectQuestion({
        questionId,
        teamId: currentTeam._id,
      });
      setSelectedQuestionId(questionId);
      setShowAnswer(false);
    } catch (error) {
      console.error("Failed to select question:", error);
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswerSubmit = async (isCorrect: boolean) => {
    if (!selectedQuestionId || !currentTeam) return;

    try {
      await submitAnswer({
        questionId: selectedQuestionId,
        teamId: currentTeam._id,
        isCorrect,
      });

      // Move to next team
      if (gameSession?.teams) {
        setCurrentTeamIndex((prev) => (prev + 1) % gameSession.teams.length);
      }

      // Close modal
      setSelectedQuestionId(null);
      setShowAnswer(false);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const selectedQuestion = selectedQuestionId
    ? questions?.find((q) => q._id === selectedQuestionId)
    : null;

  if (gameSession === undefined || questions === undefined) {
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
            Laster spill...
          </p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="card bg-card-bg text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Spill ikke funnet
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Spillet du leter etter finnes ikke.
          </p>
        </div>
      </div>
    );
  }

  const pointValues = [100, 200, 300, 400, 500];

  // Show game over screen if all questions are answered
  if (isGameOver) {
    return (
      <div className="min-h-screen flex flex-col bg-[url('/the-last-supper.png')] bg-cover bg-center bg-no-repeat">
        {/* Header */}
        <header className="shrink-0 flex flex-row justify-between items-center top-0 z-10 bg-card-bg/95 backdrop-blur-md border-b border-card-border shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 w-full">
            <h1 className="text-3xl font-bold">🎮</h1>
            <h1 className="text-3xl font-bold bg-linear-to-r from-festive-red via-festive-gold to-festive-green bg-clip-text text-transparent">
              Jeopardy!
            </h1>
            <h1 className="text-3xl font-bold">🎯</h1>
            <div />
            <button
              className="btn-primary ml-4"
              onClick={() => router.push(`/`)}
            >
              Hjem
            </button>
          </div>
        </header>

        {/* Game Over Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl w-full">
            <div className="card text-center mb-8">
              <h1 className="text-5xl font-bold text-foreground mb-4">
                🎉 Spillet er over! 🎉
              </h1>
              <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-900">
                Gratulerer med seieren:{" "}
                <span className="text-festive-gold">{sortedTeams[0].name}</span>
              </p>
            </div>

            {/* Final Leaderboard */}
            <div className="card">
              <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center justify-center gap-2">
                <span className="text-festive-gold">🏆</span>
                Sluttresultat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTeams.map((team, index) => (
                  <div
                    key={team._id}
                    className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all duration-300 ${
                      index === 0
                        ? "border-festive-gold bg-festive-gold/20 dark:bg-festive-gold/30 scale-105"
                        : "border-card-border bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700"
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute top-2 right-2 text-3xl">👑</div>
                    )}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-festive-gold/10 dark:bg-festive-gold/20 rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md text-lg ${
                            index === 0
                              ? "bg-festive-gold"
                              : index === 1
                                ? "bg-festive-red"
                                : index === 2
                                  ? "bg-festive-green"
                                  : index === 3
                                    ? "bg-festive-navy"
                                    : "bg-neutral-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <h3
                          className={`text-xl font-bold ${index === 0 ? "text-neutral-900" : "text-neutral-600 dark:text-neutral-400"}`}
                        >
                          {team.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-start gap-2 mt-4">
                        <span
                          className={`text-sm font-semibold text-neutral-600 ${index === 0 ? "text-neutral-900" : "text-neutral-600 dark:text-neutral-400"}`}
                        >
                          Poeng:
                        </span>
                        <span
                          className={`text-4xl font-bold ${
                            index === 0
                              ? "text-festive-gold"
                              : "text-festive-gold/80"
                          }`}
                        >
                          {team.points}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[url('/the-last-supper.png')] bg-cover bg-center bg-no-repeat">
      {/* Header */}
      <header className="shrink-0 flex flex-row justify-between items-center top-0 z-10 bg-card-bg/95 backdrop-blur-md border-b border-card-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 w-full">
          <h1 className="text-3xl font-bold">🎮</h1>
          <h1 className="text-3xl font-bold bg-linear-to-r from-festive-red via-festive-gold to-festive-green bg-clip-text text-transparent">
            Jeopardy!
          </h1>
          <h1 className="text-3xl font-bold">🎯</h1>
          <div />
          <button className="btn-primary ml-4" onClick={() => router.push(`/`)}>
            Hjem
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col max-w-7xl mx-auto px-6 py-8 h-full min-h-fit">
        <div className="flex flex-col gap-8 h-full">
          {/* Teams Leaderboard */}
          {gameSession.teams && gameSession.teams.length > 0 && (
            <div className="card">
              <div className="flex flex-row gap-2">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="text-festive-gold">🏆</span>
                  Poengtavle
                </h2>
                {currentTeam && (
                  <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-festive-gold/20 dark:bg-festive-gold/30 rounded-lg border-2 border-festive-gold">
                    <span className="text-sm text-foreground">
                      Nåværende tur:
                    </span>
                    <span className="font-bold text-foreground">
                      {currentTeam.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameSession.teams.map((team, index) => (
                  <div
                    key={team._id}
                    className={`group relative overflow-hidden rounded-lg border-2 p-5 transition-all duration-300 ${
                      team._id === currentTeam?._id
                        ? "border-festive-gold bg-festive-gold/10 dark:bg-festive-gold/70 text-foreground dark:text-foreground"
                        : "border-card-border bg-linear-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 text-background dark:text-neutral-300"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-festive-gold/10 dark:bg-festive-gold/20 rounded-bl-full"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                            index === 0
                              ? "bg-purple-600"
                              : index === 1
                                ? "bg-festive-red"
                                : index === 2
                                  ? "bg-festive-green"
                                  : index === 3
                                    ? "bg-festive-navy"
                                    : "bg-neutral-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold">{team.name}</h3>
                      </div>
                      <div className="flex font-semibold items-center gap-2 mt-3">
                        <span className="text">Poeng:</span>
                        <span className="text-2xl font-bold text-festive-gold">
                          {team.points}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Board */}
          {categories.length > 0 && (
            <div className="card h-full min-h-fit">
              <div className="min-w-full h-full min-h-fit">
                <table className="w-full border-collapse h-full min-h-fit table-fixed">
                  <thead>
                    <tr>
                      {categories.map((category) => (
                        <th
                          key={category}
                          className="p-4 text-center font-bold text-foreground dark:text-neutral-300 bg-festive-gold/10 dark:bg-festive-gold/20 border-2 border-card-border min-h-fit w-[calc(100%/6)]"
                        >
                          <div className="text-xl dark:text-foreground wrap-break-word">
                            {category}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="h-full">
                    {pointValues.map((points) => (
                      <tr key={points}>
                        {categories.map((category) => {
                          const question = questionsByCategory[category]?.find(
                            (q) => q.points === points,
                          );
                          return (
                            <td
                              key={`${category}-${points}`}
                              className="p-1 border-2 border-card-border w-[calc(100%/6)]"
                            >
                              {question ? (
                                <QuestionCard
                                  question={question}
                                  isAnswered={isQuestionAnswered(question._id)}
                                  isSelected={isQuestionSelected(question._id)}
                                  onClick={() =>
                                    handleQuestionClick(question._id)
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          showAnswer={showAnswer}
          onRevealAnswer={handleRevealAnswer}
          onAnswerSubmit={handleAnswerSubmit}
          onClose={() => {
            setSelectedQuestionId(null);
            setShowAnswer(false);
          }}
        />
      )}
    </div>
  );
}

function QuestionCard({
  question,
  isAnswered,
  isSelected,
  onClick,
}: {
  question: Doc<"questions">;
  isAnswered: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isFlipped = isSelected || isAnswered;

  return (
    <button
      className={`card-flip-container ${isAnswered ? "cursor-default" : "cursor-pointer"} flex items-center justify-center ${isAnswered ? "opacity-60" : ""}`}
      onClick={isAnswered ? undefined : onClick}
      disabled={isAnswered}
    >
      <div
        className={`card-flip h-full flex items-center justify-center ${isFlipped ? "flipped" : ""}`}
      >
        <div className="card-front h-full flex items-center justify-center">
          <div className="w-full h-full bg-linear-to-br from-festive-gold to-festive-red flex items-center justify-center rounded-lg border-2 border-festive-gold hover:scale-105 transition-transform">
            <span className="text-2xl font-bold text-white">
              {question.points}
            </span>
          </div>
        </div>
        <div className="card-back h-full flex items-center justify-center">
          <div className="w-full h-full bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center rounded-lg border-2 border-card-border p-2">
            <span className="text-xs text-center text-foreground dark:text-neutral-300">
              {question.text}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function QuestionModal({
  question,
  showAnswer,
  onRevealAnswer,
  onAnswerSubmit,
  onClose,
}: {
  question: Doc<"questions">;
  showAnswer: boolean;
  onRevealAnswer: () => void;
  onAnswerSubmit: (isCorrect: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="border border-card-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 max-w-2xl w-full bg-card-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground dark:text-neutral-800">
              {question.points} - {question.category}
            </h2>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-lg border border-card-border">
            <p className=" text-2xl font-semibold text-foreground flex items-center justify-center dark:text-neutral-300">
              {question.text}
            </p>

            {showAnswer && (
              <div className="mt-4 pt-4 border-t border-card-border">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  Svar:
                </p>
                <p className="text-xl font-bold text-foreground dark:text-neutral-100">
                  {question.answer}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!showAnswer ? (
              <button onClick={onRevealAnswer} className="btn-primary flex-1">
                Se svaret
              </button>
            ) : (
              <>
                <button
                  onClick={() => onAnswerSubmit(true)}
                  className="btn-green dark:btn-green flex-1"
                >
                  Riktig ✅
                </button>
                <button
                  onClick={() => onAnswerSubmit(false)}
                  className="btn-primary flex-1 bg-festive-red hover:bg-festive-red/80"
                >
                  Feil ❌
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
