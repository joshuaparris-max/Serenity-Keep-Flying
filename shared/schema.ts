import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // e.g. "AutoSave", "Save 1"
  data: jsonb("data").notNull(), // The game state S
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
