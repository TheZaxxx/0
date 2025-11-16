import { 
  type User, 
  type InsertUser, 
  type CheckIn, 
  type ChatMessage, 
  type Referral, 
  type ReferralActivity, 
  type Notification 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  
  createCheckIn(checkIn: Omit<CheckIn, 'id' | 'checkInTime'>): Promise<CheckIn>;
  getUserCheckIns(userId: string): Promise<CheckIn[]>;
  getTodayCheckIn(userId: string): Promise<CheckIn | undefined>;
  
  createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  getUserChatMessages(userId: string): Promise<ChatMessage[]>;
  
  createReferral(referral: Omit<Referral, 'id' | 'createdAt'>): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  getReferralByCode(code: string): Promise<User | undefined>;
  
  createReferralActivity(activity: Omit<ReferralActivity, 'id' | 'createdAt'>): Promise<ReferralActivity>;
  getReferralActivities(referralId: string): Promise<ReferralActivity[]>;
  
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  
  getAllUsers(): Promise<User[]>;
  getAllCheckIns(): Promise<CheckIn[]>;
  getAllReferralActivities(): Promise<ReferralActivity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private checkIns: Map<string, CheckIn>;
  private chatMessages: Map<string, ChatMessage>;
  private referrals: Map<string, Referral>;
  private referralActivities: Map<string, ReferralActivity>;
  private notifications: Map<string, Notification>;
  private userSessions: Map<string, { hasStarted: boolean; createdAt: Date }>;

  constructor() {
    this.users = new Map();
    this.checkIns = new Map();
    this.chatMessages = new Map();
    this.referrals = new Map();
    this.referralActivities = new Map();
    this.notifications = new Map();
    this.userSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createCheckIn(checkInData: Omit<CheckIn, 'id' | 'checkInTime'>): Promise<CheckIn> {
    const id = randomUUID();
    const checkIn: CheckIn = {
      ...checkInData,
      id,
      checkInTime: new Date(),
    };
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }

  async getTodayCheckIn(userId: string): Promise<CheckIn | undefined> {
    const today = new Date().toDateString();
    return Array.from(this.checkIns.values()).find(checkIn => {
      const checkInDate = new Date(checkIn.checkInTime).toDateString();
      return checkIn.userId === userId && checkInDate === today;
    });
  }

  async createChatMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getUserChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createReferral(referralData: Omit<Referral, 'id' | 'createdAt'>): Promise<Referral> {
    const id = randomUUID();
    const referral: Referral = {
      ...referralData,
      id,
      createdAt: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === userId);
  }

  async getReferralByCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.referralCode === code);
  }

  async createReferralActivity(activityData: Omit<ReferralActivity, 'id' | 'createdAt'>): Promise<ReferralActivity> {
    const id = randomUUID();
    const activity: ReferralActivity = {
      ...activityData,
      id,
      createdAt: new Date(),
    };
    this.referralActivities.set(id, activity);
    return activity;
  }

  async getReferralActivities(referralId: string): Promise<ReferralActivity[]> {
    return Array.from(this.referralActivities.values())
      .filter(activity => activity.referralId === referralId);
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllCheckIns(): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values());
  }

  async getAllReferralActivities(): Promise<ReferralActivity[]> {
    return Array.from(this.referralActivities.values());
  }

  getUserSession(userId: string): { hasStarted: boolean; createdAt: Date } {
    let session = this.userSessions.get(userId);
    if (!session) {
      session = { hasStarted: false, createdAt: new Date() };
      this.userSessions.set(userId, session);
    }
    return session;
  }

  updateUserSession(userId: string, hasStarted: boolean): void {
    const session = this.getUserSession(userId);
    session.hasStarted = hasStarted;
    this.userSessions.set(userId, session);
  }
}

export const storage = new MemStorage();