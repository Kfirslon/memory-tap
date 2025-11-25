import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecordButton } from "@/components/RecordButton";
import { WaveformAnimation } from "@/components/WaveformAnimation";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Home = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleRecordComplete = async (audioBlob: Blob) => {
    try {
      // Upload audio
      const uploadRes = await api.uploadAudio(audioBlob);

      // Transcribe
      const transcribeRes = await api.transcribe(uploadRes.filePath);

      // Create memory
      await api.createMemory(transcribeRes.text, uploadRes.filePath);

      toast({
        title: "Memory saved!",
        description: "Your voice note has been processed.",
      });

      navigate("/timeline");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 pb-20">
      <div className="space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">MemoryTap</h1>
          <p className="text-muted-foreground">
            Press and hold to capture a voice memory
          </p>
        </div>

        {isUploading ? (
          <div className="space-y-4">
            <WaveformAnimation />
            <p className="text-sm text-muted-foreground">Processing your memory...</p>
          </div>
        ) : (
          <RecordButton onRecordComplete={handleRecordComplete} />
        )}

        <p className="text-xs text-muted-foreground max-w-sm">
          Your voice notes are automatically organized with AI
        </p>
      </div>
    </div>
  );
};

export default Home;
