"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Doc, Id } from "../convex/_generated/dataModel";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/cute-santa.png"
              alt="Convex Logo"
              width={32}
              height={32}
            />
          </div>
          <h1 className="font-semibold text-slate-800 dark:text-slate-200">
            Jeopardy
          </h1>
        </div>
      </header>
      <main className="p-8 flex flex-col gap-8">
        <Content />
      </main>
    </>
  );
}

function Content() {
  const router = useRouter();
  const gameSessions = useQuery(api.myFunctions.listGameSessions);
  const createGameSession = useMutation(api.myFunctions.createGameSession);

  const handleCreateGameSession = async () => {
    await createGameSession({}).then((gameSessionId) => {
      router.push(`/game-session/${gameSessionId}`);
    });
  };

  const handleGameSessionClick = (gameSessionId: string) => {
    router.push(`/game-session/${gameSessionId}`);
  };

  if (gameSessions === undefined) {
    return (
      <div className="mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <p className="ml-2 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto pt-60">
      <div className="flex flex-col gap-2 card min-w-100">
        <h2 className="font-bold text-xl text-slate-800 dark:text-slate-200">
          Velkommen!
        </h2>
        <p className="text-slate-600 font-semibold dark:text-slate-100 mt-2">
          No guts, no glory.
        </p>
      </div>

      <div className="card flex flex-col gap-2">
        <button className="btn-green" onClick={handleCreateGameSession}>
          Opprett spill
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {gameSessions.length === 0 ? (
          <div className="card flex flex-col gap-2 items-center justify-center">
            <p className="text-slate-600 font-semibold dark:text-slate-100">
              No game sessions found
            </p>
          </div>
        ) : (
          gameSessions.map((gameSession) => (
            <GameSessionCard
              key={gameSession._id}
              gameSession={gameSession}
              onClick={() => handleGameSessionClick(gameSession._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

type GameSessionWithPopulatedQuestionsSet = Omit<
  Doc<"gameSessions">,
  "questionsSet"
> & {
  questionsSet?:
    | (Doc<"questionSets"> & { name: string, questions: Doc<"questions">[] })
    | null;
};

function GameSessionCard({
  gameSession,
  onClick,
}: {
  gameSession: GameSessionWithPopulatedQuestionsSet;
  onClick: () => void;
}) {
  const questionCount = gameSession.questionsSet?.questions?.length ?? 0;
  const isStarted = gameSession.isStarted;
  const questionSetName = gameSession.questionsSet?.name ?? "No Question Set Selected";

  return (
    <button
      className="group relative overflow-hidden card bg-card-bg hover:bg-warm-beige/30 dark:hover:bg-neutral-800/80 border-2 border-card-border hover:border-festive-gold/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer text-left"
      onClick={() => onClick()}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-festive-gold/10 dark:bg-festive-gold/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex flex-col gap-3 p-5">
        {/* Header with question set name */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-foreground dark:text-neutral-800 group-hover:text-festive-gold transition-colors flex-1 line-clamp-2">
            {questionSetName}
          </h3>
          {/* Status badge */}
          <span
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
              isStarted
                ? "bg-festive-green dark:bg-festive-green text-festive-green dark:text-accent-green-light"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-700"
            }`}
          >
            {isStarted ? "▶ Started" : "○ Not Started"}
          </span>
        </div>

        {/* Question count with icon */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">❓</span>
          <span className="text-base font-semibold text-neutral-800 dark:text-neutral-700">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-600">
          <span>📅</span>
          <span>{new Date(gameSession.createdAt).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}</span>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-festive-red via-festive-gold to-festive-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </button>
  );
}
