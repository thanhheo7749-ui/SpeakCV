// frontend/components/AudioWave.tsx
import { Mic } from "lucide-react";

export const AudioWave = ({ state }: { state: string }) => {
  if (state === "idle")
    return <Mic size={48} className="text-white opacity-80" />;
  const barColor = state === "listening" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-full ${barColor} animate-pulse`}
          style={{ height: "100%", animationDuration: `${0.4 + i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
};
