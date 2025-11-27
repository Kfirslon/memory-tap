import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecordButton } from "@/components/RecordButton";
import { WaveformAnimation } from "@/components/WaveformAnimation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in first.",
        });
        navigate("/login");
        return;
      }

      // Upload audio to storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get signed URL for the audio
      const { data: urlData } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName);

      const audioUrl = urlData.publicUrl;

      // For now, create a basic memory without transcription
      // In a production app, you would call a transcription service here
      const memoryText = "Voice note recorded at " + new Date().toLocaleString();

      // Analyze with AI
      const { data: analysis, error: aiError } = await supabase.functions.invoke('analyze-memory', {
        body: { text: memoryText }
      });

      if (aiError) {
        console.error('AI analysis error:', aiError);
        // Continue without AI analysis
      }

      // Create memory in database
      const { error: insertError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          full_text: memoryText,
          summary: analysis?.summary || memoryText.slice(0, 100),
          category: analysis?.category || 'note',
          reminder_needed: analysis?.reminderNeeded || false,
          date: analysis?.extractedDate || null,
          audio_url: audioUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Memory saved!",
        description: "Your voice note has been processed and saved.",
      });

      navigate("/timeline");
    } catch (error: any) {
      console.error("Error processing memory:", error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsProcessing(false);
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

        {isProcessing ? (
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
