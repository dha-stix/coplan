import Image from "next/image";
import { cn, colorFor, initials } from "@/lib/utils";

interface AvatarProps {
  id: string;
  name: string;
  photoURL?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ id, name, photoURL, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.36)) };
  if (photoURL) {
    return <Image src={photoURL} alt={name} width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={style} />;
  }
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ ...style, background: colorFor(id) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export interface AvatarPerson {
  id: string;
  name: string;
  photoURL?: string | null;
}

export function AvatarStack({ people, max = 4, size = 30 }: { people: AvatarPerson[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <Avatar key={p.id} {...p} size={size} className={cn("ring-2 ring-white", i > 0 && "-ml-2")} />
      ))}
      {extra > 0 && (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-full bg-soft text-[11px] font-semibold text-ink-2 ring-2 ring-white"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
