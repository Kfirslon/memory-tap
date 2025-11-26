import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Calendar, Tag, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function MemoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [memory, setMemory] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadMemory();
  }, [id]);

  const loadMemory = async () => {
    try {
      const data = await api.getMemoryById(id!);
      setMemory(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load memory",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.updateMemory(id!, memory);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Memory updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update memory",
        variant: "destructive",
      });
    }
  };

  // Format date nicely
  const formatDate = (isoString: string) => {
    if (!isoString) return "No date";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Audio playback handlers
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!memory) {
    return <div className="p-4">Loading...</div>;
  }

  // Fix audio URL - add leading slash if not present
  const audioUrl = memory.audioUrl
    ? (memory.audioUrl.startsWith('http')
      ? memory.audioUrl
      : `http://localhost:3000/${memory.audioUrl}`)
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Memory Details</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Edit2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Category and Date Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                  <Tag className="h-3 w-3" />
                  {memory.category || 'note'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(memory.timestamp)}
                </span>
              </div>

              {/* Summary */}
              <div>
                <Label>Summary</Label>
                {isEditing ? (
                  <Input
                    value={memory.summary || ""}
                    onChange={(e) =>
                      setMemory({ ...memory, summary: e.target.value })
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {memory.summary || "No summary"}
                  </p>
                )}
              </div>

              {/* Full Text */}
              <div>
                <Label>Full Text</Label>
                {isEditing ? (
                  <Textarea
                    value={memory.fullText || ""}
                    onChange={(e) =>
                      setMemory({ ...memory, fullText: e.target.value })
                    }
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm mt-1">{memory.fullText}</p>
                )}
              </div>

              {/* Audio Recording */}
              {audioUrl && (
                <div>
                  <Label>Audio Recording</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="default"
                        onClick={togglePlay}
                        className="rounded-full h-12 w-12"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>

                      <div className="flex-1 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          step="0.1"
                          className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-3
                            [&::-webkit-slider-thumb]:h-3
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date/Deadline (if exists) */}
              {memory.date && (
                <div>
                  <Label>Date/Deadline</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={memory.date || ""}
                      onChange={(e) =>
                        setMemory({ ...memory, date: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(memory.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}