import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MemoryCard } from "@/components/MemoryCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { format, isToday, isThisWeek, parseISO } from "date-fns";

interface ReminderGroup {
  title: string;
  items: any[];
}

const Reminders = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ReminderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const data = await api.getReminders();

      // Group reminders
      const today = data.filter((r: any) => isToday(parseISO(r.due_date)));
      const thisWeek = data.filter((r: any) => !isToday(parseISO(r.due_date)) && isThisWeek(parseISO(r.due_date)));
      const later = data.filter((r: any) => !isToday(parseISO(r.due_date)) && !isThisWeek(parseISO(r.due_date)));

      const newGroups = [];
      if (today.length > 0) newGroups.push({ title: "Today", items: today });
      if (thisWeek.length > 0) newGroups.push({ title: "This Week", items: thisWeek });
      if (later.length > 0) newGroups.push({ title: "Later", items: later });

      setGroups(newGroups);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchReminders} />;

  const totalReminders = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (totalReminders === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No reminders"
        description="Set reminders on your memories to see them here"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          {totalReminders} upcoming {totalReminders === 1 ? "reminder" : "reminders"}
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item) => (
              <MemoryCard
                key={item.id}
                {...item}
                onClick={() => navigate(`/memory/${item.id}`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reminders;
