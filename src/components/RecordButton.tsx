import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  onRecordComplete: (audioBlob: Blob) => void;
}

export const RecordButton = ({ onRecordComplete }: RecordButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handlePress = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow microphone permissions.");
    }
  };

  const handleRelease = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <div className="absolute h-64 w-64 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute h-56 w-56 rounded-full bg-primary/30 animate-pulse-ring animation-delay-150" />
        </>
      )}

      {/* Main button */}
      <button
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        className={cn(
          "relative h-48 w-48 rounded-full transition-all duration-300",
          "flex items-center justify-center",
          "shadow-lg hover:shadow-xl",
          isRecording
            ? "bg-primary scale-110 shadow-primary/50"
            : "bg-primary hover:bg-primary/90"
        )}
      >
        <Mic className="h-20 w-20 text-primary-foreground" />
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -bottom-12 flex items-center gap-2 animate-fade-in">
          <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Recording...</span>
        </div>
      )}
    </div>
  );
};
