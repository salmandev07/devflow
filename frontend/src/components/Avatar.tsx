interface AvatarProps {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

const colorSeeds = [
  "bg-indigo-600",
  "bg-violet-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-cyan-600",
  "bg-rose-600",
  "bg-amber-600",
];

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name?: string): string {
  if (!name) return colorSeeds[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colorSeeds[hash % colorSeeds.length];
}

export default function Avatar({ name, size = "sm", className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const color = getColor(name);
  return (
    <div
      className={`
        ${sizeMap[size]} ${color}
        rounded-full flex items-center justify-center
        font-semibold text-white shrink-0
        ring-2 ring-white/20 dark:ring-slate-900
        ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  );
}
