import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { QUESTION_SETS } from "./data/questionSets";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

export const createGameSession = mutation({
  args: {},
  handler: async (ctx) => {
    const gameSessionId = await ctx.db.insert("gameSessions", {
      questions: [],
      createdAt: Date.now(),
      isStarted: false,
      selectedQuestionSet: undefined,
    });
    return gameSessionId;
  },
});

export const getGameSession = query({
  args: {
    gameSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate that the string is a valid gameSessions ID
    // v.id() validator will be applied through type checking
    const id = args.gameSessionId as Id<"gameSessions">;
    const gameSession = await ctx.db.get("gameSessions", id);
    if (!gameSession) {
      return null;
    }

    // Fetch teams for this game session
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_gameSession", (q) => q.eq("gameSessionId", id))
      .collect();

    return {
      ...gameSession,
      teams,
    };
  },
});

export const listGameSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gameSessions").collect();
  },
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    gameSessionId: v.id("gameSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("teams", {
      name: args.name,
      points: 0,
      gameSessionId: args.gameSessionId,
    });
  },
});

// Question sets are now loaded from CSV files via convex/data/questionSets.ts

export const getQuestionSets = query({
  args: {},
  handler: async () => {
    return QUESTION_SETS;
  },
});

export const selectQuestionSet = mutation({
  args: {
    gameSessionId: v.id("gameSessions"),
    questionSetId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameSessionId, {
      selectedQuestionSet: args.questionSetId,
    });
  },
});

export const getGameSetup = query({
  args: {
    gameSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = args.gameSessionId as Id<"gameSessions">;
    const gameSession = await ctx.db.get("gameSessions", id);
    if (!gameSession) {
      return null;
    }

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_gameSession", (q) => q.eq("gameSessionId", id))
      .collect();

    return {
      ...gameSession,
      teams,
    };
  },
});

export const startGame = mutation({
  args: {
    gameSessionId: v.id("gameSessions"),
  },
  handler: async (ctx, args) => {
    const gameSession = await ctx.db.get("gameSessions", args.gameSessionId);
    if (!gameSession) {
      throw new Error("Game session not found");
    }

    if (!gameSession.selectedQuestionSet) {
      throw new Error("Question set not selected");
    }

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_gameSession", (q) =>
        q.eq("gameSessionId", args.gameSessionId),
      )
      .collect();

    if (teams.length === 0) {
      throw new Error("At least one team is required");
    }

    const questionSet = QUESTION_SETS.find(
      (set) => set.id === gameSession.selectedQuestionSet,
    );

    if (!questionSet) {
      throw new Error("Question set not found");
    }

    const questionIds: Id<"questions">[] = [];

    for (const question of questionSet.questions) {
      const questionId = await ctx.db.insert("questions", {
        text: question.text,
        answer: question.answer,
        points: question.points,
        category: question.category,
        answeredByTeamId: undefined,
        selectedByTeamId: undefined,
        gameSessionId: args.gameSessionId,
      });
      questionIds.push(questionId);
    }

    await ctx.db.patch(args.gameSessionId, {
      questions: questionIds,
      isStarted: true,
    });
  },
});

export const getGameQuestions = query({
  args: {
    gameSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = args.gameSessionId as Id<"gameSessions">;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_gameSession", (q) => q.eq("gameSessionId", id))
      .collect();
    return questions;
  },
});

export const selectQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get("questions", args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    if (question.answeredByTeamId) {
      throw new Error("Question already answered");
    }

    if (question.selectedByTeamId) {
      throw new Error("Question already selected");
    }

    await ctx.db.patch(args.questionId, {
      selectedByTeamId: args.teamId,
    });
  },
});

export const submitAnswer = mutation({
  args: {
    questionId: v.id("questions"),
    teamId: v.id("teams"),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get("questions", args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    if (question.answeredByTeamId) {
      throw new Error("Question already answered");
    }

    if (question.selectedByTeamId !== args.teamId) {
      throw new Error("Question not selected by this team");
    }

    const team = await ctx.db.get("teams", args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    if (args.isCorrect) {
      // Add points and mark as answered
      await ctx.db.patch(args.questionId, {
        answeredByTeamId: args.teamId,
        selectedByTeamId: undefined,
      });
      await ctx.db.patch(args.teamId, {
        points: team.points + question.points,
      });
    } else {
      // Mark as answered (wrong answer) but no points, question cannot be selected again
      await ctx.db.patch(args.questionId, {
        answeredByTeamId: args.teamId,
        selectedByTeamId: undefined,
      });
    }
  },
});
