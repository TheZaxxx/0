import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", { content, isFromUser: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/checkin", {});
    },
    onSuccess: () => {
      toast({
        title: "Check-in Complete!",
        description: "You've earned 10 points!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "You've already checked in today",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-gradient-to-r from-background via-accent/10 to-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Poppins'] bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
              Chat with SydAI
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with SydAI and complete your daily check-in to get points!
            </p>
          </div>
          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            data-testid="button-checkin"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Daily Check-in
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-12 text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground text-sm">
                Send a message to SydAI and start earning points!
              </p>
            </Card>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"} gap-3`}
            >
              {!msg.isFromUser && (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.isFromUser
                    ? "bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] text-white"
                    : "bg-card border border-card-border"
                }`}
                data-testid={`message-${msg.isFromUser ? 'user' : 'ai'}-${msg.id}`}
              >
                <p className={msg.isFromUser ? "text-white" : "text-card-foreground"}>
                  {msg.content}
                </p>
              </div>
              {msg.isFromUser && (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,52%)] to-[hsl(48,95%,60%)] hover:opacity-90 transition-opacity"
            size="icon"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
