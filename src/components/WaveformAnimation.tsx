import { cn } from "@/lib/utils";

export const WaveformAnimation = () => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full animate-wave",
            "transition-all duration-300"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
};
