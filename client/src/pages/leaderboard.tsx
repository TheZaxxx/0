import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Users } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const { data, isLoading } = useQuery<{ entries: LeaderboardEntry[]; totalUsers: number }>({
    queryKey: ["/api/leaderboard", page],
  });

  const entries = data?.entries || [];
  const totalUsers = data?.totalUsers || 1000;
  const startRank = page * itemsPerPage + 1;
  const endRank = startRank + entries.length - 1;
  const hasMorePages = entries.length === itemsPerPage;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-[hsl(43,96%,52%)]" />;
      case 2:
        return <Medal className="w-6 h-6 text-[hsl(0,0%,75%)]" />;
      case 3:
        return <Award className="w-6 h-6 text-[hsl(30,80%,55%)]" />;
      default:
        return null;
    }
  };

  const getRankCardClass = (rank: number) => {
    if (rank === 1) {
      return "border-2 border-[hsl(43,96%,52%)] shadow-lg shadow-primary/20";
    }
    if (rank === 2) {
      return "border-2 border-[hsl(0,0%,75%)] shadow-md";
    }
    if (rank === 3) {
      return "border-2 border-[hsl(30,80%,55%)] shadow-md";
    }
    return "border border-card-border";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-gradient-to-r from-background via-accent/10 to-background">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold font-['Poppins'] bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
                Leaderboard
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Top performers in our community
            </p>
          </div>
          <Badge
            variant="outline"
            className="px-4 py-2 text-base border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5"
            data-testid="badge-total-users"
          >
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span className="font-semibold bg-gradient-to-r from-[hsl(43,96%,45%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
              {totalUsers.toLocaleString()}+
            </span>
            <span className="ml-1">registered users</span>
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-12 text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground text-sm">
                Start chatting and checking in to climb the leaderboard!
              </p>
            </Card>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className={`p-4 transition-all hover:shadow-lg hover:scale-[1.01] ${getRankCardClass(entry.rank)}`}
                data-testid={`card-rank-${entry.rank}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16">
                    {entry.rank <= 3 ? (
                      <div className="flex flex-col items-center">
                        {getRankIcon(entry.rank)}
                        <span
                          className={`text-3xl font-bold font-['Poppins'] mt-1 ${
                            entry.rank === 1
                              ? "bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent"
                              : entry.rank === 2
                              ? "text-[hsl(0,0%,60%)]"
                              : "text-[hsl(30,80%,50%)]"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-muted-foreground font-['Poppins']">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                      {entry.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`text-username-${entry.rank}`}>
                      {entry.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-2xl font-bold bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent font-['Poppins']"
                      data-testid={`text-points-${entry.rank}`}
                    >
                      {entry.points.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-sm text-muted-foreground">
            Showing ranks {startRank}-{endRank} of {totalUsers.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!hasMorePages}
              className={hasMorePages ? "bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] text-white border-0 hover:opacity-90" : ""}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
