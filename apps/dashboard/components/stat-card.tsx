interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="paper rounded p-5">
      <p className="text-[11px] font-sans font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-sans font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sub && (
        <p className="text-[12px] text-ink-500 mt-1 font-serif">{sub}</p>
      )}
    </div>
  );
}
