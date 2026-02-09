import { users, gameSaves, type User, type InsertUser, type GameSave, type InsertGameSave } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game Saves
  getGameSaves(userId: string): Promise<GameSave[]>;
  getGameSave(id: number): Promise<GameSave | undefined>;
  createGameSave(save: InsertGameSave): Promise<GameSave>;
  deleteGameSave(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods (fallback/legacy)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: Replit Auth uses email/sub, this is for compatibility
    return undefined; 
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Game Save methods
  async getGameSaves(userId: string): Promise<GameSave[]> {
    return await db.select()
      .from(gameSaves)
      .where(eq(gameSaves.userId, userId))
      .orderBy(desc(gameSaves.updatedAt));
  }

  async getGameSave(id: number): Promise<GameSave | undefined> {
    const [save] = await db.select().from(gameSaves).where(eq(gameSaves.id, id));
    return save;
  }

  async createGameSave(save: InsertGameSave): Promise<GameSave> {
    const [newSave] = await db.insert(gameSaves).values(save).returning();
    return newSave;
  }

  async deleteGameSave(id: number): Promise<void> {
    await db.delete(gameSaves).where(eq(gameSaves.id, id));
  }
}

export const storage = new DatabaseStorage();
