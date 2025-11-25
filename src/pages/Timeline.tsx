import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MemoryCard } from "@/components/MemoryCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Inbox } from "lucide-react";
import { api } from "@/lib/api";

interface Memory {
  id: string;
  summary: string;
  category: "task" | "reminder" | "idea" | "note";
  timestamp: string;
  hasReminder: boolean;
}

const Timeline = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchMemories} />;
  if (memories.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No memories yet"
        description="Start recording your first voice memory from the home screen"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Memory Timeline</h1>
        <p className="text-sm text-muted-foreground">All your captured moments</p>
      </div>

      <div className="space-y-3">
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            {...memory}
            onClick={() => navigate(`/memory/${memory.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
