import Home from "./inner";
import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

export default async function ServerPage() {
  const preloaded = await preloadQuery(api.myFunctions.listGameSessions, {
  });

  return (
    <main className="p-8 flex flex-col gap-6 mx-auto max-w-2xl">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <Image src="/cute-santa.png" alt="Convex Logo" width={48} height={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">
          Christmas Jeopardy
        </h1>
      </div>
      <div className="flex flex-col gap-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Non-reactive server-loaded data
        </h2>
        <code className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-300 dark:border-slate-600 overflow-x-auto">
          <pre className="text-sm text-slate-700 dark:text-slate-300">
            {JSON.stringify(preloaded, null, 2)}
          </pre>
        </code>
      </div>
      <Home preloaded={preloaded} />
    </main>
  );
}
