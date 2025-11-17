import { MessageSquare, Trophy, Bell, Settings as SettingsIcon, LogOut, Gift } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SiX, SiDiscord, SiTelegram, SiYoutube } from "react-icons/si";

const menuItems = [
  {
    title: "SydAI",
    url: "/",
    icon: MessageSquare,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Referral",
    url: "/referral",
    icon: Gift,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];

const socialLinks = [
  { icon: SiX, url: "https://x.com", label: "X (Twitter)", color: "#000000" },
  { icon: SiDiscord, url: "https://discord.com", label: "Discord", color: "#5865F2" },
  { icon: SiTelegram, url: "https://telegram.org", label: "Telegram", color: "#26A5E4" },
  { icon: SiYoutube, url: "https://youtube.com", label: "YouTube", color: "#FF0000" },
];

export function AppSidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-6 py-6">
            <h1 className="font-['Poppins'] text-2xl font-bold bg-gradient-to-r from-[hsl(43,96%,45%)] via-[hsl(43,96%,58%)] to-[hsl(48,95%,60%)] bg-clip-text text-transparent">
              SydAI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Premium AI Assistant</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover-elevate active-elevate-2"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 pb-4 space-y-4">
          <div className="flex items-center justify-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-9 h-9 rounded-md flex items-center justify-center hover-elevate active-elevate-2 transition-colors"
              >
                <social.icon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full hover-elevate active-elevate-2"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-copyright">
              © SydAI 2025
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
