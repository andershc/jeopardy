import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

export const createGameSession = mutation({
  args: {},
  handler: async (ctx) => {
    const gameSessionId = await ctx.db.insert("gameSessions", {
      questionsSet: undefined,
      createdAt: Date.now(),
      isStarted: false,
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
    const gameSessions = await ctx.db.query("gameSessions").collect();

    return await Promise.all(
      gameSessions.map(async (gameSession) => {
        if (gameSession.questionsSet) {
          const questionsSet = await ctx.db.get(
            "questionSets",
            gameSession.questionsSet,
          );
          return {
            ...gameSession,
            questionsSet: questionsSet
              ? {
                  ...questionsSet,
                  questions: await ctx.db
                    .query("questions")
                    .withIndex("by_questionSet", (q) =>
                      q.eq("questionSetId", questionsSet._id),
                    )
                    .collect(),
                }
              : undefined,
          };
        }
        return {
          ...gameSession,
          questionsSet: undefined,
        };
      }),
    );
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
      answeredQuestions: [],
      selectedQuestions: [],
    });
  },
});

// Question sets are now loaded from CSV files via convex/data/questionSets.ts

export const getQuestionSets = query({
  args: {},
  handler: async (ctx) => {
    const questionSets = await ctx.db.query("questionSets").collect();
    return await Promise.all(
      questionSets.map(async (questionSet) => {
        const questions = await ctx.db
          .query("questions")
          .withIndex("by_questionSet", (q) =>
            q.eq("questionSetId", questionSet._id),
          )
          .collect();
        return {
          ...questionSet,
          questions: questions,
        };
      }),
    );
  },
});

export const getQuestionCount = query({
  args: {
    questionSetId: v.optional(v.id("questionSets")),
  },
  handler: async (ctx, args) => {
    if (!args.questionSetId) {
      return 0;
    }
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_questionSet", (q) =>
        q.eq("questionSetId", args.questionSetId),
      )
      .collect();
    return questions.length;
  },
});

export const selectQuestionSet = mutation({
  args: {
    gameSessionId: v.id("gameSessions"),
    questionSetId: v.id("questionSets"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameSessionId, {
      questionsSet: args.questionSetId,
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

    if (!gameSession.questionsSet) {
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

    const questionSet = await ctx.db.get(
      "questionSets",
      gameSession.questionsSet,
    );

    if (!questionSet) {
      throw new Error("Question set not found");
    }

    await ctx.db.patch(args.gameSessionId, {
      questionsSet: questionSet._id,
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
    const gameSession = await ctx.db.get("gameSessions", id);
    if (!gameSession) {
      throw new Error("Game session not found");
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_questionSet", (q) =>
        q.eq("questionSetId", gameSession.questionsSet as Id<"questionSets">),
      )
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

    const team = await ctx.db.get("teams", args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if question is already answered by any team in this game session
    const allTeams = await ctx.db
      .query("teams")
      .withIndex("by_gameSession", (q) =>
        q.eq("gameSessionId", team.gameSessionId),
      )
      .collect();

    for (const t of allTeams) {
      if (t.answeredQuestions.includes(args.questionId)) {
        throw new Error("Question already answered");
      }
      if (t.selectedQuestions.includes(args.questionId)) {
        throw new Error("Question already selected");
      }
    }

    // Add question to team's selected questions
    await ctx.db.patch(args.teamId, {
      selectedQuestions: [...team.selectedQuestions, args.questionId],
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

    const team = await ctx.db.get("teams", args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if question is already answered by any team in this game session
    const allTeams = await ctx.db
      .query("teams")
      .withIndex("by_gameSession", (q) =>
        q.eq("gameSessionId", team.gameSessionId),
      )
      .collect();

    for (const t of allTeams) {
      if (t.answeredQuestions.includes(args.questionId)) {
        throw new Error("Question already answered");
      }
    }

    // Check if question is selected by this team
    if (!team.selectedQuestions.includes(args.questionId)) {
      throw new Error("Question not selected by this team");
    }

    // Remove from selectedQuestions and add to answeredQuestions
    const updatedSelectedQuestions = team.selectedQuestions.filter(
      (id) => id !== args.questionId,
    );
    const updatedAnsweredQuestions = [
      ...team.answeredQuestions,
      args.questionId,
    ];

    if (args.isCorrect) {
      // Add points and mark as answered
      await ctx.db.patch(args.teamId, {
        points: team.points + question.points,
        selectedQuestions: updatedSelectedQuestions,
        answeredQuestions: updatedAnsweredQuestions,
      });
    } else {
      // Mark as answered (wrong answer) but no points, question cannot be selected again
      await ctx.db.patch(args.teamId, {
        selectedQuestions: updatedSelectedQuestions,
        answeredQuestions: updatedAnsweredQuestions,
      });
    }
  },
});
