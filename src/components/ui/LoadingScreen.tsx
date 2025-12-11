import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({ 
  message = "Carregando...", 
  submessage 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003087] to-[#00BFFF] flex flex-col items-center justify-center p-6">
      {/* Animated Logo */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-white/20 absolute inset-0 animate-[spin_3s_linear_infinite]" />
        
        {/* Middle ring */}
        <div 
          className="w-24 h-24 rounded-full border-4 border-transparent border-t-white/60 absolute inset-0 animate-[spin_1.5s_linear_infinite]" 
        />
        
        {/* Inner content */}
        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <Car className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2 animate-pulse">
          {message}
        </h2>
        {submessage && (
          <p className="text-white/70 text-sm">
            {submessage}
          </p>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full bg-white/80",
              "animate-bounce"
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}