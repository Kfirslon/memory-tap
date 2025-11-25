import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Globe, Mic, Info } from "lucide-react";

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-5 w-5" />
            <h3 className="font-semibold">Appearance</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select defaultValue="light">
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5" />
            <h3 className="font-semibold">Language & Region</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-5 w-5" />
            <h3 className="font-semibold">Audio</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playback">Playback Speed</Label>
              <Select defaultValue="1">
                <SelectTrigger id="playback">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x (Normal)</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Microphone Permission</Label>
                <p className="text-xs text-muted-foreground">
                  Allow access to record voice memories
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5" />
            <h3 className="font-semibold">About</h3>
          </div>
          <p className="text-sm text-muted-foreground">MemoryTap v1.0.0</p>
          <p className="text-sm text-muted-foreground">
            AI-powered personal memory system
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
