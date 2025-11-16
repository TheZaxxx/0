import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Flame, TrendingUp } from "lucide-react";
import { type UserStats } from "@shared/schema";
import { getAuthHeaders } from "@/lib/auth";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Points",
      value: stats?.totalPoints || 0,
      icon: Trophy,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Weekly Points",
      value: stats?.weeklyPoints || 0,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Daily Streak",
      value: `${stats?.dailyStreak || 0} days`,
      icon: Flame,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Referrals",
      value: stats?.totalReferrals || 0,
      icon: Users,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ];

  const weekProgress = Math.min(((stats?.dailyStreak || 0) / 7) * 100, 100);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-[Poppins] font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here's your progress overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="hover-elevate transition-all duration-200"
            data-testid={`card-${stat.title.toLowerCase().replace(' ', '-')}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-[Poppins] font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-[Poppins]">Check-in Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Today's Check-in</span>
              {stats?.todayCheckedIn ? (
                <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm font-semibold">
                  ✓ Completed
                </span>
              ) : (
                <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm font-semibold">
                  Pending
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Progress</span>
                <span className="font-semibold">{stats?.dailyStreak || 0}/7 days</span>
              </div>
              <Progress value={weekProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-[Poppins]">Leaderboard Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-4xl font-[Poppins] font-bold text-primary" data-testid="text-rank">
                  #{stats?.rank || '-'}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep checking in daily to climb the leaderboard!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}