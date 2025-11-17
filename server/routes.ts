import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertNotificationSchema, insertSettingsSchema } from "@shared/schema";

// Mock user ID for demo purposes - in production, this would come from authentication
const DEMO_USER_ID = "default-user-id";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to get or create demo user
  const getDemoUser = async () => {
    const users = await storage.getAllUsers();
    if (users.length === 0) {
      return await storage.createUser({
        username: "DemoUser",
        password: "demo",
      });
    }
    return users[users.length - 1]; // Return the last user (default user)
  };

  // Messages endpoints
  app.get("/api/messages", async (req, res) => {
    try {
      const user = await getDemoUser();
      const messages = await storage.getMessagesByUserId(user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const user = await getDemoUser();
      const parsed = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(parsed, user.id);
      
      // Award points for sending a message
      await storage.updateUserPoints(user.id, 1);
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Check-in endpoint
  app.post("/api/checkin", async (req, res) => {
    try {
      const user = await getDemoUser();
      
      // Check if user already checked in today
      if (user.lastCheckin) {
        const lastCheckin = new Date(user.lastCheckin);
        const today = new Date();
        const isSameDay =
          lastCheckin.getDate() === today.getDate() &&
          lastCheckin.getMonth() === today.getMonth() &&
          lastCheckin.getFullYear() === today.getFullYear();
        
        if (isSameDay) {
          return res.status(400).json({ error: "Already checked in today" });
        }
      }
      
      // Update check-in and award points
      const updatedUser = await storage.updateUserCheckin(user.id);
      
      // Create notification
      await storage.createNotification(
        {
          title: "Daily Check-in Complete!",
          message: "You've earned 10 points! Come back tomorrow for more.",
        },
        user.id
      );
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // User info endpoint
  app.get("/api/user", async (req, res) => {
    try {
      const user = await getDemoUser();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const limit = 10;
      const leaderboard = await storage.getLeaderboard(page, limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const user = await getDemoUser();
      const notifications = await storage.getNotificationsByUserId(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const user = await getDemoUser();
      const parsed = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(parsed, user.id);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const user = await getDemoUser();
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const user = await getDemoUser();
      let settings = await storage.getSettingsByUserId(user.id);
      
      // Create default settings if they don't exist
      if (!settings) {
        settings = await storage.createSettings(
          {
            theme: "light",
            notifications: true,
            emailNotifications: false,
          },
          user.id
        );
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const user = await getDemoUser();
      const parsed = insertSettingsSchema.partial().parse(req.body);
      
      let settings = await storage.getSettingsByUserId(user.id);
      
      if (!settings) {
        // Create if doesn't exist
        settings = await storage.createSettings(
          {
            theme: parsed.theme || "light",
            notifications: parsed.notifications ?? true,
            emailNotifications: parsed.emailNotifications ?? false,
          },
          user.id
        );
      } else {
        // Update existing
        settings = await storage.updateSettings(user.id, parsed);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Referral endpoints
  app.get("/api/referral", async (req, res) => {
    try {
      const user = await getDemoUser();
      const stats = await storage.getReferralStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referral stats" });
    }
  });

  app.post("/api/referral/complete", async (req, res) => {
    try {
      const { referralCode, userId } = req.body;
      
      if (!referralCode || !userId) {
        return res.status(400).json({ error: "Missing referral code or user ID" });
      }

      const success = await storage.completeReferral(referralCode, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete referral" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
