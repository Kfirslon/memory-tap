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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} memories?`)) {
      try {
        await Promise.all(Array.from(selectedIds).map(id => api.deleteMemory(id)));
        setMemories(memories.filter(m => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Failed to delete memories:', error);
      }
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Memory Timeline</h1>
          <p className="text-sm text-muted-foreground">All your captured moments</p>
        </div>
        <div className="flex gap-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedIds(new Set());
                }}
                className="text-muted-foreground font-medium text-sm px-3 py-1.5 hover:bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="text-red-500 font-medium text-sm px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors"
                disabled={selectedIds.size === 0}
              >
                Delete ({selectedIds.size})
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="text-primary font-medium text-sm px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors"
            >
              Select
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {memories.map((memory) => (
          <div key={memory.id} className="relative flex items-center gap-3">
            {isSelectionMode && (
              <input
                type="checkbox"
                checked={selectedIds.has(memory.id)}
                onChange={() => toggleSelection(memory.id)}
                className="h-5 w-5 rounded-full border-gray-300 text-primary focus:ring-primary"
              />
            )}
            <div className="flex-1">
              <MemoryCard
                {...memory}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(memory.id);
                  } else {
                    navigate(`/memory/${memory.id}`);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
