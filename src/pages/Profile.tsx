import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut, FileText, Bell, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [memoryCount, setMemoryCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const authData = await api.checkAuth();
      if (authData.authenticated && authData.user) {
        setUser(authData.user);

        // Fetch counts
        const memories = await api.getMemories();
        const reminders = await api.getReminders();
        setMemoryCount(memories.length);
        setReminderCount(reminders.length);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              {user?.picture && <AvatarImage src={user.picture} alt={user.name} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{user?.name || 'Guest User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || 'Not logged in'}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Memories</span>
              </div>
              <p className="text-2xl font-bold">{memoryCount}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bell className="h-4 w-4" />
                <span className="text-xs">Reminders</span>
              </div>
              <p className="text-2xl font-bold">{reminderCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Let AI suggest reminders for your memories
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Advanced Organization</Label>
                <p className="text-xs text-muted-foreground">
                  Use AI to categorize and tag memories
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Digest</Label>
                <p className="text-xs text-muted-foreground">
                  Receive a summary of upcoming tasks
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Log Out
      </Button>
    </div>
  );
};

export default Profile;
