import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type Settings,
  type InsertSettings,
  type LeaderboardEntry,
  type Referral,
  type InsertReferral,
  type ReferralStats,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User | undefined>;
  updateUserCheckin(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Message methods
  getMessagesByUserId(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage, userId: string): Promise<Message>;
  
  // Notification methods
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification, userId: string): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Settings methods
  getSettingsByUserId(userId: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings, userId: string): Promise<Settings>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings | undefined>;
  
  // Leaderboard methods
  getLeaderboard(page: number, limit: number): Promise<{ entries: LeaderboardEntry[]; totalUsers: number }>;
  
  // Referral methods
  getReferralByUserId(userId: string): Promise<Referral | undefined>;
  createReferral(userId: string): Promise<Referral>;
  getReferralStats(userId: string): Promise<ReferralStats>;
  completeReferral(referralCode: string, newUserId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private notifications: Map<string, Notification>;
  private settings: Map<string, Settings>;
  private referrals: Map<string, Referral>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.settings = new Map();
    this.referrals = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock users with varying points for leaderboard
    const mockUsernames = [
      "CryptoKing", "AIWizard", "TechGuru", "DataMaster", "CodeNinja",
      "WebDev", "CloudExpert", "SecurityPro", "MLEnthusiast", "DevOpsHero",
      "FullStackDev", "BackendPro", "FrontendAce", "MobileGenius", "GameDev"
    ];
    
    for (let i = 0; i < 15; i++) {
      const id = randomUUID();
      const points = Math.floor(Math.random() * 10000) + 100;
      const user: User = {
        id,
        username: mockUsernames[i] || `User${i + 1}`,
        password: "hashed_password",
        points,
        lastCheckin: i < 5 ? new Date(Date.now() - 86400000) : null, // Last 5 users checked in yesterday
        avatarUrl: null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 86400000), // Random date in last 30 days
      };
      this.users.set(id, user);
    }
    
    // Create a default user for testing
    const defaultUserId = randomUUID();
    const defaultUser: User = {
      id: defaultUserId,
      username: "DefaultUser",
      password: "hashed_password",
      points: 500,
      lastCheckin: null,
      avatarUrl: null,
      createdAt: new Date(),
    };
    this.users.set(defaultUserId, defaultUser);
    
    // Create default settings for default user
    const defaultSettingsId = randomUUID();
    const defaultSettings: Settings = {
      id: defaultSettingsId,
      userId: defaultUserId,
      theme: "light",
      notifications: true,
      emailNotifications: false,
    };
    this.settings.set(defaultSettingsId, defaultSettings);
    
    // Create some welcome messages
    const welcomeMessageId = randomUUID();
    const welcomeMessage: Message = {
      id: welcomeMessageId,
      userId: defaultUserId,
      content: "Welcome to SydAI! I'm here to help you with anything you need. Complete your daily check-in to earn points!",
      isFromUser: false,
      createdAt: new Date(),
    };
    this.messages.set(welcomeMessageId, welcomeMessage);
    
    // Create welcome notification
    const welcomeNotifId = randomUUID();
    const welcomeNotif: Notification = {
      id: welcomeNotifId,
      userId: defaultUserId,
      title: "Welcome to SydAI!",
      message: "Start chatting and complete your daily check-in to earn points and climb the leaderboard.",
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(welcomeNotifId, welcomeNotif);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      points: 0,
      lastCheckin: null,
      avatarUrl: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(id: string, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, points: user.points + points };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserCheckin(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastCheckin: new Date(),
      points: user.points + 10,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Message methods
  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage, userId: string): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      userId,
      content: insertMessage.content,
      isFromUser: insertMessage.isFromUser,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    // Auto-generate AI response
    if (insertMessage.isFromUser) {
      setTimeout(() => {
        const aiResponseId = randomUUID();
        const aiResponse: Message = {
          id: aiResponseId,
          userId,
          content: this.generateAIResponse(insertMessage.content),
          isFromUser: false,
          createdAt: new Date(),
        };
        this.messages.set(aiResponseId, aiResponse);
      }, 1000);
    }
    
    return message;
  }

  private generateAIResponse(userMessage: string): string {
    const responses = [
      "That's an interesting question! I'm here to help you with that.",
      "Great point! Let me share my thoughts on that.",
      "I understand what you're asking. Here's what I think...",
      "Thanks for sharing that with me! I'd be happy to assist.",
      "That's a wonderful topic to discuss. Let me help you with that.",
      "I appreciate your question! Keep chatting to earn more points!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Notification methods
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotif: InsertNotification, userId: string): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      userId,
      title: insertNotif.title,
      message: insertNotif.message,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updated = { ...notification, isRead: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId);
    
    for (const notif of userNotifications) {
      const updated = { ...notif, isRead: true };
      this.notifications.set(notif.id, updated);
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Settings methods
  async getSettingsByUserId(userId: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createSettings(insertSettings: InsertSettings, userId: string): Promise<Settings> {
    const id = randomUUID();
    const settings: Settings = {
      id,
      userId,
      theme: insertSettings.theme,
      notifications: insertSettings.notifications,
      emailNotifications: insertSettings.emailNotifications,
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existing = await this.getSettingsByUserId(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.settings.set(existing.id, updated);
    return updated;
  }

  // Leaderboard methods
  async getLeaderboard(page: number, limit: number): Promise<{ entries: LeaderboardEntry[]; totalUsers: number }> {
    const allUsers = Array.from(this.users.values());
    // Always show at least 1000 users as the minimum for the leaderboard
    const totalUsers = Math.max(allUsers.length, 1000);
    
    // Sort by points descending
    const sortedUsers = allUsers.sort((a, b) => b.points - a.points);
    
    // Paginate - only show actual users that exist
    const start = page * limit;
    const paginatedUsers = sortedUsers.slice(start, start + limit);
    
    // Map to leaderboard entries with actual ranks
    const entries: LeaderboardEntry[] = paginatedUsers.map((user, index) => ({
      id: user.id,
      username: user.username,
      points: user.points,
      rank: start + index + 1,
      avatarUrl: user.avatarUrl || undefined,
    }));
    
    return { entries, totalUsers };
  }

  // Referral methods
  async getReferralByUserId(userId: string): Promise<Referral | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.referrerId === userId
    );
  }

  async createReferral(userId: string): Promise<Referral> {
    const id = randomUUID();
    const referralCode = this.generateReferralCode();
    const referral: Referral = {
      id,
      referrerId: userId,
      referredUserId: null,
      referralCode,
      isCompleted: false,
      createdAt: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  private generateReferralCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    let referral = await this.getReferralByUserId(userId);
    
    if (!referral) {
      referral = await this.createReferral(userId);
    }

    const completedReferrals = Array.from(this.referrals.values()).filter(
      (r) => r.referrerId === userId && r.isCompleted
    );

    const totalReferrals = completedReferrals.length;
    const totalPoints = totalReferrals * 20;

    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : "http://localhost:5000";

    return {
      referralCode: referral.referralCode,
      referralLink: `${baseUrl}/signup?ref=${referral.referralCode}`,
      totalReferrals,
      totalPoints,
    };
  }

  async completeReferral(referralCode: string, newUserId: string): Promise<boolean> {
    const referral = Array.from(this.referrals.values()).find(
      (r) => r.referralCode === referralCode && !r.isCompleted
    );

    if (!referral) return false;

    const updated: Referral = {
      ...referral,
      referredUserId: newUserId,
      isCompleted: true,
    };
    this.referrals.set(referral.id, updated);

    await this.updateUserPoints(referral.referrerId, 20);

    return true;
  }
}

export const storage = new MemStorage();
