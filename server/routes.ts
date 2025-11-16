import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, chatMessageSchema, type UserStats, type LeaderboardEntry, type ReferralInfo } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET or SESSION_SECRET environment variable must be set');
}

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function checkWeeklyReferralBonus(userId: string) {
  const userReferrals = await storage.getUserReferrals(userId);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const referral of userReferrals) {
    if (!referral.isActive) continue;

    const referredCheckIns = await storage.getUserCheckIns(referral.referredId);
    const weeklyCheckIns = referredCheckIns.filter(
      checkIn => new Date(checkIn.checkInTime) >= oneWeekAgo
    );

    if (weeklyCheckIns.length >= 7) {
      const activity = await storage.createReferralActivity({
        referralId: referral.id,
        activityType: 'weekly_checkin',
        pointsEarned: 5,
      });

      await storage.createNotification({
        userId: userId,
        title: 'Weekly Referral Bonus',
        message: `Your referral completed their weekly streak! +5 points!`,
        type: 'referral_bonus',
        isRead: false,
      });
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password, name, referralCode } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userReferralCode = generateReferralCode();

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        referralCode: userReferralCode,
      });

      if (referralCode) {
        const referrer = await storage.getReferralByCode(referralCode);
        if (referrer && referrer.id !== user.id) {
          const referral = await storage.createReferral({
            referrerId: referrer.id,
            referredId: user.id,
            referralCode: referralCode,
            isActive: true,
          });

          await storage.createReferralActivity({
            referralId: referral.id,
            activityType: 'signup',
            pointsEarned: 2,
          });

          await storage.createNotification({
            userId: referrer.id,
            title: 'Referral Bonus',
            message: `${name} joined using your referral code! +2 points!`,
            type: 'referral_bonus',
            isRead: false,
          });
        }
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
        },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password } = validation.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/chat/check-in', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
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
        sender: 'user',
        sessionId: 'default',
      });

      let aiResponse = "";
      let checkedIn = false;
      let pointsEarned = 0;

      if (!session.hasStarted) {
        if (message.trim().toUpperCase() === 'START') {
          storage.updateUserSession(userId, true);
          aiResponse = "Congratulations! You have successfully signed in. Now let's CHECK-IN to get points!";
        } else {
          aiResponse = "Wrong command. Please try to sign in correctly by typing START";
        }
      } else if (!alreadyCheckedIn) {
        if (message.trim().toLowerCase() === 'check-in') {
          const points = 10;
          await storage.createCheckIn({
            userId,
            pointsEarned: points,
          });

          aiResponse = "Congratulations! You have successfully earned 10 points from today's check-in! Come back tomorrow to keep earning points, and maintain your weekly process to get bonuses!";
          checkedIn = true;
          pointsEarned = points;

          await storage.createNotification({
            userId,
            title: 'Check-in Successful',
            message: `You earned ${points} points for checking in today!`,
            type: 'points_earned',
            isRead: false,
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
        sender: 'ai',
        sessionId: 'default',
      });

      res.json({
        response: aiResponse,
        checkedIn: checkedIn || !!alreadyCheckedIn,
        alreadyChecked: !!alreadyCheckedIn,
        pointsEarned,
        hasStarted: session.hasStarted,
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/chat/history', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const userMessages = await storage.getUserChatMessages(userId);

      const groupedMessages: Record<string, typeof userMessages> = {};
      userMessages.forEach(msg => {
        const date = new Date(msg.createdAt).toDateString();
        if (!groupedMessages[date]) {
          groupedMessages[date] = [];
        }
        groupedMessages[date].push(msg);
      });

      res.json({
        messages: groupedMessages,
        total: userMessages.length,
      });
    } catch (error: any) {
      console.error('Chat history error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/leaderboard/weekly', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const allCheckIns = await storage.getAllCheckIns();
      const allUsers = await storage.getAllUsers();
      const allReferralActivities = await storage.getAllReferralActivities();
      const allReferrals = await storage.getUserReferrals(req.userId!);

      const weeklyPoints: Record<string, number> = {};

      allCheckIns.forEach(checkIn => {
        if (new Date(checkIn.checkInTime) >= oneWeekAgo) {
          if (!weeklyPoints[checkIn.userId]) {
            weeklyPoints[checkIn.userId] = 0;
          }
          weeklyPoints[checkIn.userId] += checkIn.pointsEarned;
        }
      });

      allReferralActivities.forEach(activity => {
        if (new Date(activity.createdAt) >= oneWeekAgo) {
          const referral = allReferrals.find(r => r.id === activity.referralId);
          if (referral) {
            if (!weeklyPoints[referral.referrerId]) {
              weeklyPoints[referral.referrerId] = 0;
            }
            weeklyPoints[referral.referrerId] += activity.pointsEarned;
          }
        }
      });

      const leaderboard: LeaderboardEntry[] = Object.entries(weeklyPoints)
        .map(([userId, points]) => {
          const user = allUsers.find(u => u.id === userId);
          return {
            userId,
            name: user?.name || 'Unknown User',
            points,
            email: user?.email || '',
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

      res.json({ leaderboard });
    } catch (error: any) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/leaderboard/alltime', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const allCheckIns = await storage.getAllCheckIns();
      const allUsers = await storage.getAllUsers();
      const allReferralActivities = await storage.getAllReferralActivities();
      const allReferrals = await storage.getUserReferrals(req.userId!);

      const allTimePoints: Record<string, number> = {};

      allCheckIns.forEach(checkIn => {
        if (!allTimePoints[checkIn.userId]) {
          allTimePoints[checkIn.userId] = 0;
        }
        allTimePoints[checkIn.userId] += checkIn.pointsEarned;
      });

      allReferralActivities.forEach(activity => {
        const referral = allReferrals.find(r => r.id === activity.referralId);
        if (referral) {
          if (!allTimePoints[referral.referrerId]) {
            allTimePoints[referral.referrerId] = 0;
          }
          allTimePoints[referral.referrerId] += activity.pointsEarned;
        }
      });

      const leaderboard: LeaderboardEntry[] = Object.entries(allTimePoints)
        .map(([userId, points]) => {
          const user = allUsers.find(u => u.id === userId);
          return {
            userId,
            name: user?.name || 'Unknown User',
            points,
            email: user?.email || '',
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

      res.json({ leaderboard });
    } catch (error: any) {
      console.error('All-time leaderboard error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/referral/info', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userReferrals = await storage.getUserReferrals(userId);
      const activeReferrals = userReferrals.filter(r => r.isActive);

      let totalReferralPoints = 0;
      for (const ref of userReferrals) {
        const activities = await storage.getReferralActivities(ref.id);
        totalReferralPoints += activities.reduce((sum, activity) => sum + activity.pointsEarned, 0);
      }

      let domain = 'http://localhost:5000';
      if (process.env.REPLIT_DEV_DOMAIN) {
        domain = `https://${process.env.REPLIT_DEV_DOMAIN}`;
      } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        domain = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      }

      const referralInfo: ReferralInfo = {
        referralCode: user.referralCode,
        totalReferrals: userReferrals.length,
        activeReferrals: activeReferrals.length,
        totalPointsEarned: totalReferralPoints,
        shareableLink: `${domain}/register?ref=${user.referralCode}`,
      };

      res.json(referralInfo);
    } catch (error: any) {
      console.error('Referral info error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/notifications', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const notifications = await storage.getUserNotifications(userId);
      const limitedNotifications = notifications.slice(0, 20);

      res.json({ notifications: limitedNotifications });
    } catch (error: any) {
      console.error('Notifications error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/notifications/mark-read', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { notificationId } = req.body;
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      console.error('Mark read error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/user/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
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

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCheckIns = userCheckIns.filter(checkIn => new Date(checkIn.checkInTime) >= oneWeekAgo);
      const weeklyPoints = weeklyCheckIns.reduce((sum, checkIn) => sum + checkIn.pointsEarned, 0);

      let dailyStreak = 0;
      const sortedCheckIns = [...userCheckIns].sort((a, b) => 
        new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
      );
      
      if (sortedCheckIns.length > 0) {
        dailyStreak = 1;
        let currentDate = new Date(sortedCheckIns[0].checkInTime);
        
        for (let i = 1; i < sortedCheckIns.length; i++) {
          const prevDate = new Date(sortedCheckIns[i].checkInTime);
          const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            dailyStreak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }

      const todayCheckIn = await storage.getTodayCheckIn(userId);

      const allUserPoints: Record<string, number> = {};
      allCheckIns.forEach(checkIn => {
        if (!allUserPoints[checkIn.userId]) {
          allUserPoints[checkIn.userId] = 0;
        }
        allUserPoints[checkIn.userId] += checkIn.pointsEarned;
      });

      const sortedUsers = Object.entries(allUserPoints)
        .sort((a, b) => b[1] - a[1]);
      const rank = sortedUsers.findIndex(([id]) => id === userId) + 1;

      const stats: UserStats = {
        totalPoints: totalPointsWithReferrals,
        weeklyPoints,
        dailyStreak,
        totalReferrals: userReferrals.length,
        rank: rank || 0,
        todayCheckedIn: !!todayCheckIn,
      };

      res.json(stats);
    } catch (error: any) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}