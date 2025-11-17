// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  checkIns;
  chatMessages;
  referrals;
  referralActivities;
  notifications;
  userSessions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.checkIns = /* @__PURE__ */ new Map();
    this.chatMessages = /* @__PURE__ */ new Map();
    this.referrals = /* @__PURE__ */ new Map();
    this.referralActivities = /* @__PURE__ */ new Map();
    this.notifications = /* @__PURE__ */ new Map();
    this.userSessions = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(userData) {
    const id = randomUUID();
    const user = {
      ...userData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async createCheckIn(checkInData) {
    const id = randomUUID();
    const checkIn = {
      ...checkInData,
      id,
      checkInTime: /* @__PURE__ */ new Date()
    };
    this.checkIns.set(id, checkIn);
    return checkIn;
  }
  async getUserCheckIns(userId) {
    return Array.from(this.checkIns.values()).filter((checkIn) => checkIn.userId === userId).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }
  async getTodayCheckIn(userId) {
    const today = (/* @__PURE__ */ new Date()).toDateString();
    return Array.from(this.checkIns.values()).find((checkIn) => {
      const checkInDate = new Date(checkIn.checkInTime).toDateString();
      return checkIn.userId === userId && checkInDate === today;
    });
  }
  async createChatMessage(messageData) {
    const id = randomUUID();
    const message = {
      ...messageData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  async getUserChatMessages(userId) {
    return Array.from(this.chatMessages.values()).filter((msg) => msg.userId === userId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async createReferral(referralData) {
    const id = randomUUID();
    const referral = {
      ...referralData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.referrals.set(id, referral);
    return referral;
  }
  async getUserReferrals(userId) {
    return Array.from(this.referrals.values()).filter((ref) => ref.referrerId === userId);
  }
  async getReferralByCode(code) {
    return Array.from(this.users.values()).find((user) => user.referralCode === code);
  }
  async createReferralActivity(activityData) {
    const id = randomUUID();
    const activity = {
      ...activityData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.referralActivities.set(id, activity);
    return activity;
  }
  async getReferralActivities(referralId) {
    return Array.from(this.referralActivities.values()).filter((activity) => activity.referralId === referralId);
  }
  async createNotification(notificationData) {
    const id = randomUUID();
    const notification = {
      ...notificationData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
  async getUserNotifications(userId) {
    return Array.from(this.notifications.values()).filter((notif) => notif.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async markNotificationAsRead(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async getAllCheckIns() {
    return Array.from(this.checkIns.values());
  }
  async getAllReferralActivities() {
    return Array.from(this.referralActivities.values());
  }
  getUserSession(userId) {
    let session = this.userSessions.get(userId);
    if (!session) {
      session = { hasStarted: false, createdAt: /* @__PURE__ */ new Date() };
      this.userSessions.set(userId, session);
    }
    return session;
  }
  updateUserSession(userId, hasStarted) {
    const session = this.getUserSession(userId);
    session.hasStarted = hasStarted;
    this.userSessions.set(userId, session);
  }
};
var storage = new MemStorage();

// server/routes.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  checkInTime: timestamp("check_in_time").notNull().defaultNow(),
  pointsEarned: integer("points_earned").notNull().default(10)
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  sessionId: text("session_id").notNull().default("default"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: text("referrer_id").notNull().references(() => users.id),
  referredId: text("referred_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true)
});
var referralActivities = pgTable("referral_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: text("referral_id").notNull().references(() => referrals.id),
  activityType: text("activity_type").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  referralCode: true
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  referralCode: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty")
});

// server/routes.ts
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or SESSION_SECRET environment variable must be set");
}
var authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function checkWeeklyReferralBonus(userId) {
  const userReferrals = await storage.getUserReferrals(userId);
  const oneWeekAgo = /* @__PURE__ */ new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  for (const referral of userReferrals) {
    if (!referral.isActive) continue;
    const referredCheckIns = await storage.getUserCheckIns(referral.referredId);
    const weeklyCheckIns = referredCheckIns.filter(
      (checkIn) => new Date(checkIn.checkInTime) >= oneWeekAgo
    );
    if (weeklyCheckIns.length >= 7) {
      const activity = await storage.createReferralActivity({
        referralId: referral.id,
        activityType: "weekly_checkin",
        pointsEarned: 5
      });
      await storage.createNotification({
        userId,
        title: "Weekly Referral Bonus",
        message: `Your referral completed their weekly streak! +5 points!`,
        type: "referral_bonus",
        isRead: false
      });
    }
  }
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email, password, name, referralCode } = validation.data;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userReferralCode = generateReferralCode();
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        referralCode: userReferralCode
      });
      if (referralCode) {
        const referrer = await storage.getReferralByCode(referralCode);
        if (referrer && referrer.id !== user.id) {
          const referral = await storage.createReferral({
            referrerId: referrer.id,
            referredId: user.id,
            referralCode,
            isActive: true
          });
          await storage.createReferralActivity({
            referralId: referral.id,
            activityType: "signup",
            pointsEarned: 2
          });
          await storage.createNotification({
            userId: referrer.id,
            title: "Referral Bonus",
            message: `${name} joined using your referral code! +2 points!`,
            type: "referral_bonus",
            isRead: false
          });
        }
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode
        }
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/chat/check-in", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const validation = chatMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { message } = validation.data;
      const session = storage.getUserSession(userId);
      const alreadyCheckedIn = await storage.getTodayCheckIn(userId);
      await storage.createChatMessage({
        userId,
        message,
        sender: "user",
        sessionId: "default"
      });
      let aiResponse = "";
      let checkedIn = false;
      let pointsEarned = 0;
      if (!session.hasStarted) {
        if (message.trim().toUpperCase() === "START") {
          storage.updateUserSession(userId, true);
          aiResponse = "Congratulations! You have successfully signed in. Now let's CHECK-IN to get points!";
        } else {
          aiResponse = "Wrong command. Please try to sign in correctly by typing START";
        }
      } else if (!alreadyCheckedIn) {
        if (message.trim().toLowerCase() === "check-in") {
          const points = 10;
          await storage.createCheckIn({
            userId,
            pointsEarned: points
          });
          aiResponse = "Congratulations! You have successfully earned 10 points from today's check-in! Come back tomorrow to keep earning points, and maintain your weekly process to get bonuses!";
          checkedIn = true;
          pointsEarned = points;
          await storage.createNotification({
            userId,
            title: "Check-in Successful",
            message: `You earned ${points} points for checking in today!`,
            type: "points_earned",
            isRead: false
          });
          await checkWeeklyReferralBonus(userId);
        } else {
          aiResponse = "Wrong command! You failed to check-in. Please try again with the correct command";
        }
      } else {
        aiResponse = "Hi, you have already successfully checked in today! Come back tomorrow";
      }
      await storage.createChatMessage({
        userId,
        message: aiResponse,
        sender: "ai",
        sessionId: "default"
      });
      res.json({
        response: aiResponse,
        checkedIn: checkedIn || !!alreadyCheckedIn,
        alreadyChecked: !!alreadyCheckedIn,
        pointsEarned,
        hasStarted: session.hasStarted
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/chat/history", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const userMessages = await storage.getUserChatMessages(userId);
      const groupedMessages = {};
      userMessages.forEach((msg) => {
        const date = new Date(msg.createdAt).toDateString();
        if (!groupedMessages[date]) {
          groupedMessages[date] = [];
        }
        groupedMessages[date].push(msg);
      });
      res.json({
        messages: groupedMessages,
        total: userMessages.length
      });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/leaderboard/weekly", authMiddleware, async (req, res) => {
    try {
      const oneWeekAgo = /* @__PURE__ */ new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const allCheckIns = await storage.getAllCheckIns();
      const allUsers = await storage.getAllUsers();
      const allReferralActivities = await storage.getAllReferralActivities();
      const allReferrals = await storage.getUserReferrals(req.userId);
      const weeklyPoints = {};
      allCheckIns.forEach((checkIn) => {
        if (new Date(checkIn.checkInTime) >= oneWeekAgo) {
          if (!weeklyPoints[checkIn.userId]) {
            weeklyPoints[checkIn.userId] = 0;
          }
          weeklyPoints[checkIn.userId] += checkIn.pointsEarned;
        }
      });
      allReferralActivities.forEach((activity) => {
        if (new Date(activity.createdAt) >= oneWeekAgo) {
          const referral = allReferrals.find((r) => r.id === activity.referralId);
          if (referral) {
            if (!weeklyPoints[referral.referrerId]) {
              weeklyPoints[referral.referrerId] = 0;
            }
            weeklyPoints[referral.referrerId] += activity.pointsEarned;
          }
        }
      });
      const leaderboard = Object.entries(weeklyPoints).map(([userId, points]) => {
        const user = allUsers.find((u) => u.id === userId);
        return {
          userId,
          name: user?.name || "Unknown User",
          points,
          email: user?.email || ""
        };
      }).sort((a, b) => b.points - a.points).slice(0, 10);
      res.json({ leaderboard });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/leaderboard/alltime", authMiddleware, async (req, res) => {
    try {
      const allCheckIns = await storage.getAllCheckIns();
      const allUsers = await storage.getAllUsers();
      const allReferralActivities = await storage.getAllReferralActivities();
      const allReferrals = await storage.getUserReferrals(req.userId);
      const allTimePoints = {};
      allCheckIns.forEach((checkIn) => {
        if (!allTimePoints[checkIn.userId]) {
          allTimePoints[checkIn.userId] = 0;
        }
        allTimePoints[checkIn.userId] += checkIn.pointsEarned;
      });
      allReferralActivities.forEach((activity) => {
        const referral = allReferrals.find((r) => r.id === activity.referralId);
        if (referral) {
          if (!allTimePoints[referral.referrerId]) {
            allTimePoints[referral.referrerId] = 0;
          }
          allTimePoints[referral.referrerId] += activity.pointsEarned;
        }
      });
      const leaderboard = Object.entries(allTimePoints).map(([userId, points]) => {
        const user = allUsers.find((u) => u.id === userId);
        return {
          userId,
          name: user?.name || "Unknown User",
          points,
          email: user?.email || ""
        };
      }).sort((a, b) => b.points - a.points).slice(0, 10);
      res.json({ leaderboard });
    } catch (error) {
      console.error("All-time leaderboard error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/referral/info", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userReferrals = await storage.getUserReferrals(userId);
      const activeReferrals = userReferrals.filter((r) => r.isActive);
      let totalReferralPoints = 0;
      for (const ref of userReferrals) {
        const activities = await storage.getReferralActivities(ref.id);
        totalReferralPoints += activities.reduce((sum, activity) => sum + activity.pointsEarned, 0);
      }
      let domain = "http://localhost:5000";
      if (process.env.REPLIT_DEV_DOMAIN) {
        domain = `https://${process.env.REPLIT_DEV_DOMAIN}`;
      } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        domain = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      }
      const referralInfo = {
        referralCode: user.referralCode,
        totalReferrals: userReferrals.length,
        activeReferrals: activeReferrals.length,
        totalPointsEarned: totalReferralPoints,
        shareableLink: `${domain}/register?ref=${user.referralCode}`
      };
      res.json(referralInfo);
    } catch (error) {
      console.error("Referral info error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const notifications2 = await storage.getUserNotifications(userId);
      const limitedNotifications = notifications2.slice(0, 20);
      res.json({ notifications: limitedNotifications });
    } catch (error) {
      console.error("Notifications error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/notifications/mark-read", authMiddleware, async (req, res) => {
    try {
      const { notificationId } = req.body;
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/user/stats", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId;
      const userCheckIns = await storage.getUserCheckIns(userId);
      const userReferrals = await storage.getUserReferrals(userId);
      const allCheckIns = await storage.getAllCheckIns();
      const allReferralActivities = await storage.getAllReferralActivities();
      const totalPoints = userCheckIns.reduce((sum, checkIn) => sum + checkIn.pointsEarned, 0);
      let referralPoints = 0;
      for (const ref of userReferrals) {
        const activities = await storage.getReferralActivities(ref.id);
        referralPoints += activities.reduce((sum, activity) => sum + activity.pointsEarned, 0);
      }
      const totalPointsWithReferrals = totalPoints + referralPoints;
      const oneWeekAgo = /* @__PURE__ */ new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCheckIns = userCheckIns.filter((checkIn) => new Date(checkIn.checkInTime) >= oneWeekAgo);
      const weeklyPoints = weeklyCheckIns.reduce((sum, checkIn) => sum + checkIn.pointsEarned, 0);
      let dailyStreak = 0;
      const sortedCheckIns = [...userCheckIns].sort(
        (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
      );
      if (sortedCheckIns.length > 0) {
        dailyStreak = 1;
        let currentDate = new Date(sortedCheckIns[0].checkInTime);
        for (let i = 1; i < sortedCheckIns.length; i++) {
          const prevDate = new Date(sortedCheckIns[i].checkInTime);
          const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1e3 * 60 * 60 * 24));
          if (daysDiff === 1) {
            dailyStreak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
      const todayCheckIn = await storage.getTodayCheckIn(userId);
      const allUserPoints = {};
      allCheckIns.forEach((checkIn) => {
        if (!allUserPoints[checkIn.userId]) {
          allUserPoints[checkIn.userId] = 0;
        }
        allUserPoints[checkIn.userId] += checkIn.pointsEarned;
      });
      const sortedUsers = Object.entries(allUserPoints).sort((a, b) => b[1] - a[1]);
      const rank = sortedUsers.findIndex(([id]) => id === userId) + 1;
      const stats = {
        totalPoints: totalPointsWithReferrals,
        weeklyPoints,
        dailyStreak,
        totalReferrals: userReferrals.length,
        rank: rank || 0,
        todayCheckedIn: !!todayCheckIn
      };
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
