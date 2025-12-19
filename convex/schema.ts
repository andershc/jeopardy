import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  gameSessions: defineTable({
    createdAt: v.number(),
    questionsSet: v.optional(v.id("questionSets")),
    isStarted: v.boolean(),
    selectedQuestionSet: v.optional(v.string()),
  }),
  teams: defineTable({
    name: v.string(),
    points: v.number(),
    gameSessionId: v.id("gameSessions"),
    answeredQuestions: v.array(v.id("questions")),
    selectedQuestions: v.array(v.id("questions")),
  }).index("by_gameSession", ["gameSessionId"]),
  questionSets: defineTable({
    name: v.string(),
  }),
  questions: defineTable({
    text: v.string(),
    answer: v.string(),
    points: v.number(),
    category: v.string(),
    questionSetId: v.optional(v.id("questionSets")),
  }).index("by_questionSet", ["questionSetId"]),
});
