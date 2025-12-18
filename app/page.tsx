"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Doc } from "../convex/_generated/dataModel";

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
            Christmas Jeopardy
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
        <button
          className="btn-green"
          onClick={handleCreateGameSession}
        >
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

function GameSessionCard({
  gameSession,
  onClick,
}: {
  gameSession: Doc<"gameSessions">;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-5 rounded-xl h-36 overflow-auto border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
      onClick={() => onClick()}
    >
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
        {gameSession.questions.length} questions
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {new Date(gameSession.createdAt).toLocaleDateString()}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {gameSession.isStarted ? "Started" : "Not Started"}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {gameSession.selectedQuestionSet
          ? gameSession.selectedQuestionSet
          : "No Question Set Selected"}
      </p>
    </button>
  );
}
