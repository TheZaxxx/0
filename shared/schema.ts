import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  checkInTime: timestamp("check_in_time").notNull().defaultNow(),
  pointsEarned: integer("points_earned").notNull().default(10),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  sessionId: text("session_id").notNull().default('default'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: text("referrer_id").notNull().references(() => users.id),
  referredId: text("referred_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const referralActivities = pgTable("referral_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: text("referral_id").notNull().references(() => referrals.id),
  activityType: text("activity_type").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  referralCode: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type ReferralActivity = typeof referralActivities.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    referralCode: string;
  };
}

export interface ChatResponse {
  response: string;
  checkedIn: boolean;
  alreadyChecked: boolean;
  pointsEarned: number;
  hasStarted: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  email: string;
}

export interface ReferralInfo {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalPointsEarned: number;
  shareableLink: string;
}

export interface UserStats {
  totalPoints: number;
  weeklyPoints: number;
  dailyStreak: number;
  totalReferrals: number;
  rank: number;
  todayCheckedIn: boolean;
}