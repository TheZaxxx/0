import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Link as LinkIcon, Gift, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReferralStats } from "@shared/schema";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referral"],
  });

  const handleCopyLink = async () => {
    if (stats?.referralLink) {
      try {
        await navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Share this link with your friends to earn points",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      try {
        await navigator.clipboard.writeText(stats.referralCode);
        toast({
          title: "Code copied!",
          description: "Your referral code has been copied",
        });
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Please copy the code manually",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-gradient-to-r from-background via-accent/10 to-background">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold font-['Poppins'] bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
                Referral Program
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Invite friends and earn rewards together
            </p>
          </div>
          <Badge
            variant="outline"
            className="px-4 py-2 text-base border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5"
          >
            <span className="font-semibold bg-gradient-to-r from-[hsl(43,96%,45%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
              20 points
            </span>
            <span className="ml-1">per referral</span>
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Total Referrals
                </CardTitle>
                <CardDescription>Friends who joined using your link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold font-['Poppins'] bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
                  {stats?.totalReferrals || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">successful referrals</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Total Bonus Points
                </CardTitle>
                <CardDescription>Points earned from referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold font-['Poppins'] bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
                  {stats?.totalPoints || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">points from referrals</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-accent/5 to-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with your friends to invite them to SydAI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={stats?.referralLink || ""}
                  readOnly
                  className="flex-1 font-mono text-sm"
                  data-testid="input-referral-link"
                />
                <Button
                  onClick={handleCopyLink}
                  className="bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] hover:opacity-90 transition-opacity"
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-2">Referral Code:</p>
                <div className="flex gap-2">
                  <Input
                    value={stats?.referralCode || ""}
                    readOnly
                    className="flex-1 font-mono text-lg font-bold text-center"
                    data-testid="input-referral-code"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyCode}
                    className="border-primary/30 hover:bg-primary/5"
                    data-testid="button-copy-code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">
                    Copy your unique referral link or code and share it with friends
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Friends Join SydAI</p>
                  <p className="text-sm text-muted-foreground">
                    When they sign up using your link, they become your referral
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Earn Bonus Points</p>
                  <p className="text-sm text-muted-foreground">
                    You automatically receive 20 points for each successful referral!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
