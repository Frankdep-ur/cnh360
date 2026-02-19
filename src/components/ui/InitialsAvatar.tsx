import { cn } from "@/lib/utils";

interface InitialsAvatarProps {
  name: string;
  size?: string;
  className?: string;
  textSize?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

export function InitialsAvatar({ name, size = "w-12 h-12", className, textSize }: InitialsAvatarProps) {
  return (
    <div
      className={cn("flex items-center justify-center text-white font-bold rounded-xl", size, className)}
      style={{ backgroundColor: getColorFromName(name) }}
    >
      <span className={textSize}>{getInitials(name)}</span>
    </div>
  );
}
