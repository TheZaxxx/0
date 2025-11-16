import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award } from "lucide-react";
import { type LeaderboardEntry } from "@shared/schema";
import { getAuthHeaders, authStorage } from "@/lib/auth";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");
  const user = authStorage.getUser();

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ['/api/leaderboard/weekly'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/weekly', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch weekly leaderboard');
      return res.json();
    },
  });

  const { data: alltimeData, isLoading: alltimeLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ['/api/leaderboard/alltime'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/alltime', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch all-time leaderboard');
      return res.json();
    },
  });

  const isLoading = activeTab === "weekly" ? weeklyLoading : alltimeLoading;
  const leaderboard = activeTab === "weekly" 
    ? weeklyData?.leaderboard || [] 
    : alltimeData?.leaderboard || [];

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-chart-4" />;
      case 2:
        return <Medal className="w-8 h-8 text-muted-foreground" />;
      case 3:
        return <Award className="w-8 h-8 text-chart-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-[Poppins] font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-lg">
          See how you rank against other users
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "weekly" | "alltime")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
          <TabsTrigger value="alltime" data-testid="tab-alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : leaderboard.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-[Poppins] font-semibold mb-2">
                  No Rankings Yet
                </p>
                <p className="text-muted-foreground text-center">
                  Be the first to check in and claim the top spot!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[top3[1], top3[0], top3[2]].map((entry, visualIndex) => {
                  if (!entry) return null;
                  const actualRank = visualIndex === 1 ? 1 : visualIndex === 0 ? 2 : 3;
                  const isCurrentUser = entry.userId === user?.id;
                  
                  return (
                    <Card 
                      key={entry.userId} 
                      className={`${visualIndex === 1 ? 'md:order-2' : ''} ${
                        isCurrentUser ? 'border-primary border-2' : ''
                      }`}
                      data-testid={`podium-card-${actualRank}`}
                    >
                      <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                          {getMedalIcon(actualRank)}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rank #{actualRank}</p>
                          <p className="text-xl font-[Poppins] font-bold mt-1" data-testid={`rank-${actualRank}-name`}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="text-xs text-primary ml-2">(You)</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4">
                          <p className="text-3xl font-[Poppins] font-bold text-primary" data-testid={`rank-${actualRank}-points`}>
                            {entry.points}
                          </p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {remaining.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-[Poppins]">Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {remaining.map((entry, index) => {
                        const rank = index + 4;
                        const isCurrentUser = entry.userId === user?.id;
                        
                        return (
                          <div
                            key={entry.userId}
                            className={`flex items-center justify-between p-4 rounded-lg hover-elevate transition-all ${
                              isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
                            }`}
                            data-testid={`rank-${rank}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center font-bold">
                                {rank}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {entry.name}
                                  {isCurrentUser && (
                                    <span className="text-xs text-primary ml-2">(You)</span>
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">{entry.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-[Poppins] font-bold">{entry.points}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}