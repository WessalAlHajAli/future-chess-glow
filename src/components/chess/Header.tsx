import { Crown } from "lucide-react";

export function Header() {
  return (
    <div className="pointer-events-none relative flex flex-col items-center pb-2 pt-1 animate-fade-in">
      <Crown
        className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]"
        strokeWidth={1.75}
      />
      <h1 className="font-serif text-4xl font-medium tracking-[0.35em] text-foreground text-glow sm:text-5xl">
        AI&nbsp;CHESS
      </h1>
    </div>
  );
}

export function Tagline() {
  return (
    <p className="mt-6 text-center font-serif text-xs uppercase tracking-[0.5em] text-primary/70">
      Think &middot; Move &middot; Win
    </p>
  );
}