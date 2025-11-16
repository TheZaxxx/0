import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check, Share2, Gift } from "lucide-react";
import { type ReferralInfo } from "@shared/schema";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ReferralInfo>({
    queryKey: ['/api/referral/info'],
    queryFn: async () => {
      const res = await fetch('/api/referral/info', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch referral info');
      return res.json();
    },
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({
          title: 'Join Chat AI',
          text: `Use my referral code: ${data.referralCode} to earn bonus points!`,
          url: data.shareableLink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Referrals",
      value: data?.totalReferrals || 0,
      icon: Users,
      color: "text-chart-1",
    },
    {
      label: "Active Referrals",
      value: data?.activeReferrals || 0,
      icon: Users,
      color: "text-chart-2",
    },
    {
      label: "Points Earned",
      value: data?.totalPointsEarned || 0,
      icon: Gift,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-[Poppins] font-bold mb-2">Referral Program</h1>
        <p className="text-muted-foreground text-lg">
          Share your code and earn rewards for every friend who joins
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-[Poppins]">Your Referral Code</CardTitle>
            <CardDescription>
              Share this code with friends to earn 2 points per signup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-primary/20 to-chart-3/20 rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Code</p>
              <p className="text-4xl font-[Poppins] font-bold tracking-wider font-mono" data-testid="text-referral-code">
                {data?.referralCode}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={data?.shareableLink || ''}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-referral-link"
                />
                <Button
                  onClick={() => handleCopy(data?.shareableLink || '')}
                  size="icon"
                  variant="secondary"
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-chart-2" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleCopy(data?.referralCode || '')}
                  variant="outline"
                  className="w-full"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                {navigator.share && (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-2">
              <p className="font-semibold text-sm">How it works:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Share your code with friends</li>
                <li>They enter it during registration</li>
                <li>You earn 2 points instantly</li>
                <li>Weekly bonus for active referrals</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-[Poppins]">Your Stats</CardTitle>
            <CardDescription>
              Track your referral performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover-elevate transition-all"
                data-testid={`referral-stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="font-medium">{stat.label}</span>
                </div>
                <span className="text-2xl font-[Poppins] font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  {stat.value}
                </span>
              </div>
            ))}

            <div className="bg-gradient-to-br from-chart-1/20 to-chart-2/20 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-chart-1" />
                <p className="font-semibold">Bonus Rewards</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Earn additional points when your referrals complete their weekly check-in streak!
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-[Poppins] font-bold text-chart-1">+5</span>
                <span className="text-sm text-muted-foreground">points per active referral/week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}