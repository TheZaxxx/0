import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-8xl font-[Poppins] font-bold text-primary">404</h1>
          <h2 className="text-3xl font-[Poppins] font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => setLocation('/dashboard')}
            size="lg"
            data-testid="button-home"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}