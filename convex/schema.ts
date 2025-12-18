import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  gameSessions: defineTable({
    createdAt: v.number(),
    questions: v.array(v.id("questions")),
    isStarted: v.boolean(),
    selectedQuestionSet: v.optional(v.string()),
  }),
  teams: defineTable({
    name: v.string(),
    points: v.number(),
    gameSessionId: v.id("gameSessions"),
  }).index("by_gameSession", ["gameSessionId"]),
  questions: defineTable({
    text: v.string(),
    answer: v.string(),
    points: v.number(),
    category: v.string(),
    answeredByTeamId: v.optional(v.id("teams")),
    selectedByTeamId: v.optional(v.id("teams")),
    gameSessionId: v.id("gameSessions"),
  }).index("by_gameSession", ["gameSessionId"]),
});
