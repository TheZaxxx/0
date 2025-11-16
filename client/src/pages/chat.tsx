import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { type ChatMessage, type ChatResponse } from "@shared/schema";
import { getAuthHeaders, authStorage } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const user = authStorage.getUser();

  const { data: history, isLoading } = useQuery<Record<string, ChatMessage[]>>({
    queryKey: ['/api/chat/history'],
    queryFn: async () => {
      const res = await fetch('/api/chat/history', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      return data.messages || {};
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      const res = await fetch('/api/chat/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      
      if (data.pointsEarned > 0) {
        toast({
          title: "Points Earned",
          description: `You earned ${data.pointsEarned} points!`,
        });
      }
    },
  });

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const msg = message;
    setMessage("");
    setIsTyping(true);
    
    try {
      await sendMessageMutation.mutateAsync(msg);
    } finally {
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  const allMessages = history ? Object.values(history).flat().sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) : [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-[Poppins] font-bold mb-2">Chat</h1>
        <p className="text-muted-foreground text-lg">
          Chat with AI and complete your daily check-in
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-[Poppins] flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <Skeleton className="h-16 flex-1 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-[Poppins] font-semibold mb-2">
                  Start Your Chat Journey
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Type <span className="font-mono font-semibold text-foreground">START</span> to begin, then{" "}
                  <span className="font-mono font-semibold text-foreground">CHECK-IN</span> to earn points!
                </p>
              </div>
            </div>
          ) : (
            <>
              {allMessages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-wrapper-${msg.id}`}
                >
                  {msg.sender === 'ai' && (
                    <div 
                      className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
                      data-testid={`avatar-ai-${msg.id}`}
                    >
                      <Bot className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                    data-testid={`message-${msg.sender}-${msg.id}`}
                  >
                    <p className="whitespace-pre-wrap break-words" data-testid={`message-text-${msg.id}`}>
                      {msg.message}
                    </p>
                    <p className="text-xs opacity-70 mt-1" data-testid={`message-time-${msg.id}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <div 
                      className="w-10 h-10 bg-chart-3 rounded-full flex items-center justify-center flex-shrink-0"
                      data-testid={`avatar-user-${msg.id}`}
                    >
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="icon"
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Hint: Type "START" first, then "CHECK-IN" to earn daily points
          </p>
        </div>
      </Card>
    </div>
  );
}