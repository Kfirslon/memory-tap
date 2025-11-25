import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const MemoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [memory, setMemory] = useState<{
    id: string;
    fullText: string;
    summary: string;
    category: "task" | "reminder" | "idea" | "note";
    timestamp: string;
    date: string;
    hasReminder: boolean;
    audioUrl: string;
  }>({
    id: "",
    fullText: "",
    summary: "",
    category: "note",
    timestamp: "",
    date: "",
    hasReminder: false,
    audioUrl: "",
  });

  useEffect(() => {
    fetchMemory();
  }, [id]);

  const fetchMemory = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const data = await api.getMemoryById(id || "");
      setMemory(data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateMemory(memory.id, memory);

      toast({
        title: "Memory updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchMemory} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Memory Details</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {memory.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{memory.timestamp}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground">{memory.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Full Text</h3>
              <p className="text-sm leading-relaxed">{memory.fullText}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Audio Recording</h3>
              <AudioPlayer audioUrl={memory.audioUrl} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Edit Details</h3>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={memory.category}
                onValueChange={(value) =>
                  setMemory({ ...memory, category: value as any })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date/Deadline</Label>
              <Input
                id="date"
                type="date"
                value={memory.date}
                onChange={(e) => setMemory({ ...memory, date: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Set Reminder</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about this memory
                </p>
              </div>
              <Switch
                checked={memory.hasReminder}
                onCheckedChange={(checked) =>
                  setMemory({ ...memory, hasReminder: checked })
                }
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemoryDetail;
