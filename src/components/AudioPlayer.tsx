import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl?: string;
}

export const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Mock play/pause - in real app, control audio element
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlay}
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <div className="flex-1 space-y-1">
        <Slider
          value={[progress]}
          onValueChange={(value) => setProgress(value[0])}
          max={100}
          step={1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span>0:45</span>
        </div>
      </div>
    </div>
  );
};
