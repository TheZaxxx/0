import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff, Trash2, Gift, Trophy, CheckCircle } from "lucide-react";
import { type Notification } from "@shared/schema";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('POST', '/api/notifications/mark-read', { notificationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'referral_bonus':
        return <Gift className="w-5 h-5 text-chart-4" />;
      case 'points_earned':
        return <CheckCircle className="w-5 h-5 text-chart-2" />;
      case 'leaderboard':
        return <Trophy className="w-5 h-5 text-chart-1" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-[Poppins] font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with your activities and rewards
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold" data-testid="badge-unread">
            {unreadCount} new
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-[Poppins] font-semibold mb-2">
              No Notifications Yet
            </p>
            <p className="text-muted-foreground text-center max-w-md">
              You'll receive notifications here when you earn points, get referral bonuses, or climb the leaderboard
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.isRead ? 'border-primary border-l-4' : ''
              }`}
              data-testid={`notification-card-${notification.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.isRead ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          !notification.isRead ? 'font-bold' : ''
                        }`} data-testid={`notification-title-${notification.id}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1" data-testid={`notification-message-${notification.id}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2" data-testid={`notification-time-${notification.id}`}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}